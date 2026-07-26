<?php

namespace app\services\miniapp;

use app\services\BaseServices;
use app\services\pay\VirtualPaymentServices;
use crmeb\exceptions\ApiException;
use think\facade\Db;

/** Safe WeChat reconciliation and manual refund-entitlement review for training-camp orders. */
class TrainingCampOrderAdminServices extends BaseServices
{
    private const CAMP_ORDER_TABLE = 'miniapp_training_camp_order';
    private const ATTEMPT_TABLE = 'miniapp_virtual_payment_attempt';

    public function adminList(array $where): array
    {
        [$page, $limit, $defaultLimit] = $this->getPageValue();
        $limit = $limit ?: $defaultLimit;
        $query = $this->buildListQuery($where);
        $count = (clone $query)->count();
        $rows = $query
            ->field('c.*,o.paid,o.is_del,o.pay_price,o.pay_time,o.member_price,o.vip_day,o.is_permanent,u.nickname,u.phone,u.avatar,r.child_name,r.contact_phone')
            ->order('c.id', 'desc')
            ->page($page ?: 1, $limit)
            ->select()
            ->toArray();

        $attempts = $this->latestAttempts(array_column($rows, 'order_id'));
        $list = array_map(function (array $row) use ($attempts) {
            return $this->formatOrder($row, $attempts[(string)$row['order_id']] ?? []);
        }, $rows);

        return [
            'list' => $list,
            'count' => $count,
            'summary' => $this->summary(),
        ];
    }

    public function detail(int $id): array
    {
        $row = $this->requireOrder($id);
        $attempts = Db::name(self::ATTEMPT_TABLE)
            ->where('order_id', (string)$row['order_id'])
            ->order('id', 'desc')
            ->select()
            ->toArray();
        $statusLogs = Db::name('other_order_status')
            ->where('oid', (int)$row['other_order_id'])
            ->order('change_time', 'desc')
            ->select()
            ->toArray();
        $registration = Db::name('training_camp_registration')
            ->where('uid', (int)$row['uid'])
            ->where('is_del', 0)
            ->find();

        return [
            'order' => $this->formatOrder($row, $attempts[0] ?? []),
            'attempts' => array_map([$this, 'formatAttempt'], $attempts),
            'statusLogs' => array_map(function (array $log) {
                return [
                    'changeType' => (string)($log['change_type'] ?? ''),
                    'message' => (string)($log['change_message'] ?? ''),
                    'time' => $this->formatTime((int)($log['change_time'] ?? 0)),
                ];
            }, $statusLogs),
            'registration' => $registration ?: null,
        ];
    }

    public function syncFromWechat(int $id): array
    {
        return $this->reconcileOne($id, false);
    }

    public function retryDelivery(int $id): array
    {
        return $this->reconcileOne($id, true);
    }

    /**
     * Resolve the local membership after staff has completed the money refund
     * in WeChat's virtual-payment console. This method never starts a refund.
     */
    public function reviewRefund(int $id, string $decision, string $note, int $adminId, string $adminName = ''): array
    {
        $decision = strtolower(trim($decision));
        $note = trim($note);
        if (!in_array($decision, ['revoke', 'retain'], true)) {
            throw new ApiException('退款复核决定无效');
        }
        if ($note === '') {
            throw new ApiException('请填写退款复核备注');
        }
        if (mb_strlen($note) > 120) {
            throw new ApiException('退款复核备注不能超过 120 个字');
        }

        $message = Db::transaction(function () use ($id, $decision, $note, $adminId, $adminName) {
            $camp = Db::name(self::CAMP_ORDER_TABLE)->where('id', $id)->lock(true)->find();
            if (!$camp) {
                throw new ApiException('训练营订单不存在');
            }

            $resolvedState = $decision === 'revoke' ? 'revoked' : 'retained';
            if ((string)$camp['entitlement_state'] === $resolvedState) {
                return $decision === 'revoke' ? '该退款订单已撤销会员，无需重复处理' : '该退款订单已确认保留会员，无需重复处理';
            }
            if (in_array((string)$camp['entitlement_state'], ['revoked', 'retained'], true)) {
                throw new ApiException('该退款订单已经完成复核，不能重复变更处理结果');
            }
            if ((string)$camp['refund_state'] !== 'refunded' || (string)$camp['order_state'] !== 'refunded' || (string)$camp['entitlement_state'] !== 'review') {
                throw new ApiException('仅已退款且权益待复核的订单可以处理');
            }

            $attempt = Db::name(self::ATTEMPT_TABLE)
                ->where('uid', (int)$camp['uid'])
                ->where('order_id', (string)$camp['order_id'])
                ->order('id', 'desc')
                ->lock(true)
                ->find();
            if (!$attempt || !in_array((int)$attempt['wx_status'], [5, 8], true)) {
                throw new ApiException('微信退款尚未完成，请先核对支付状态');
            }

            $order = Db::name('other_order')->where('id', (int)$camp['other_order_id'])->lock(true)->find();
            if (!$order || (int)$order['paid'] !== 1) {
                throw new ApiException('原会员订单状态异常，不能执行退款复核');
            }

            $user = Db::name('user')->where('uid', (int)$camp['uid'])->lock(true)->find();
            if (!$user) {
                throw new ApiException('退款订单对应用户不存在');
            }
            $userUpdate = [];
            if ($decision === 'revoke') {
                $source = (int)($user['is_money_level'] ?? 0);
                $isPermanent = (int)($user['is_ever_level'] ?? 0);
                if (($source === 0 && $isPermanent === 1) || ($source !== 0 && $source !== 1)) {
                    throw new ApiException('用户当前会员来源不是付费购买，不能撤销，请人工核实后选择保留会员');
                }
                if ($source === 1 && $isPermanent !== 1) {
                    throw new ApiException('用户付费会员状态异常，不能直接撤销，请人工核实');
                }
                if ($source === 1 && $isPermanent === 1) {
                    $userUpdate = array_merge($userUpdate, [
                        'is_ever_level' => 0,
                        'is_money_level' => 0,
                        'overdue_time' => 0,
                        'is_promoter' => 0,
                        'spread_open' => 0,
                    ]);
                }

                $this->reverseMemberBrokerage((int)$camp['other_order_id']);
            }
            if ((int)($camp['refund_account_frozen'] ?? 0) === 1) {
                $userUpdate['status'] = 1;
            }
            if ($userUpdate) {
                Db::name('user')->where('uid', (int)$camp['uid'])->update($userUpdate);
            }

            Db::name(self::CAMP_ORDER_TABLE)->where('id', $id)->update([
                'entitlement_state' => $resolvedState,
                'refund_account_frozen' => 0,
                'last_error' => '',
                'update_time' => time(),
            ]);

            $operator = $adminName !== '' ? $adminName . '(ID ' . $adminId . ')' : '管理员 ID ' . $adminId;
            $actionText = $decision === 'revoke' ? '撤销永久会员' : '保留永久会员';
            Db::name('other_order_status')->insert([
                'oid' => (int)$camp['other_order_id'],
                'change_type' => $decision === 'revoke' ? 'refund_entitlement_revoked' : 'refund_entitlement_retained',
                'change_message' => mb_substr('退款复核：' . $actionText . '；操作人：' . $operator . '；备注：' . $note, 0, 256),
                'shop_type' => (int)($order['type'] ?? 1),
                'change_time' => time(),
            ]);

            return $decision === 'revoke' ? '会员已撤销，退款复核完成' : '会员已保留，退款复核完成';
        });

        return [
            'message' => $message,
            'detail' => $this->detail($id),
        ];
    }

    /**
     * Reverse only the commission generated by this membership order.
     * If the commission was already withdrawn, keep the deficit as a negative
     * brokerage balance so later income is used to repay it before withdrawal.
     */
    private function reverseMemberBrokerage(int $otherOrderId): void
    {
        $types = ['self_member_brokerage', 'one_member_brokerage', 'two_member_brokerage'];
        $rows = Db::name('user_brokerage')
            ->where('link_id', (string)$otherOrderId)
            ->whereIn('type', $types)
            ->where('pm', 1)
            ->where('status', 1)
            ->lock(true)
            ->select()
            ->toArray();

        $amounts = [];
        foreach ($rows as $row) {
            $uid = (int)($row['uid'] ?? 0);
            if ($uid > 0) {
                $amounts[$uid] = bcadd((string)($amounts[$uid] ?? '0'), (string)($row['number'] ?? '0'), 2);
            }
        }

        foreach ($amounts as $uid => $amount) {
            $alreadyReversed = Db::name('user_brokerage')
                ->where('uid', $uid)
                ->where('link_id', (string)$otherOrderId)
                ->where('type', 'refund')
                ->where('pm', 0)
                ->find();
            if ($alreadyReversed) {
                continue;
            }

            $beneficiary = Db::name('user')->where('uid', $uid)->lock(true)->find();
            if (!$beneficiary) {
                continue;
            }

            $balance = (string)($beneficiary['brokerage_price'] ?? '0');
            $deduction = $amount;
            $newBalance = bcsub($balance, $deduction, 2);
            Db::name('user')->where('uid', $uid)->update(['brokerage_price' => $newBalance]);
            Db::name('user_brokerage')->insert([
                'uid' => $uid,
                'link_id' => (string)$otherOrderId,
                'type' => 'refund',
                'title' => '训练营退款退佣金',
                'number' => $deduction,
                'balance' => bccomp($newBalance, '0', 2) < 0 ? '0.00' : $newBalance,
                'pm' => 0,
                'mark' => '训练营订单退款，扣回本订单佣金' . floatval($deduction) . '元',
                'status' => 1,
                'take' => 0,
                'frozen_time' => 0,
                'add_time' => time(),
            ]);
        }

        if ($rows) {
            Db::name('user_brokerage')
                ->where('link_id', (string)$otherOrderId)
                ->whereIn('type', $types)
                ->where('pm', 1)
                ->update(['status' => -1, 'frozen_time' => 0]);
        }
    }

    private function reconcileOne(int $id, bool $deliveryOnly): array
    {
        $row = $this->requireOrder($id);
        if ($deliveryOnly && (int)$row['paid'] !== 1) {
            throw new ApiException('订单尚未支付，不能重试权益发货');
        }
        if ($deliveryOnly && (string)$row['delivery_state'] === 'delivered') {
            return ['message' => '权益发货已确认，无需重试', 'detail' => $this->detail($id)];
        }

        $attempt = Db::name(self::ATTEMPT_TABLE)
            ->where('uid', (int)$row['uid'])
            ->where('order_id', (string)$row['order_id'])
            ->order('id', 'desc')
            ->find();
        if (!$attempt) {
            throw new ApiException('该订单还没有微信虚拟支付尝试记录');
        }

        $order = Db::name('other_order')->where('id', (int)$row['other_order_id'])->find();
        if (!$order) {
            throw new ApiException('本地会员订单不存在');
        }

        /** @var VirtualPaymentServices $virtualPaymentServices */
        $virtualPaymentServices = app()->make(VirtualPaymentServices::class);
        $result = $virtualPaymentServices->confirmTrainingCampPayment(
            (int)$row['uid'],
            $order,
            (string)$attempt['out_trade_no']
        );

        $status = (int)($result['status'] ?? 0);
        $message = !empty($result['confirmed']) ? '微信支付状态核对完成' : '微信订单仍未确认支付';
        if (in_array($status, [5, 8], true)) {
            $message = '微信退款状态核对完成，请处理会员权益复核';
        } elseif ($status === 7) {
            $message = '微信退款失败状态已同步';
        }

        return [
            'message' => $message,
            'confirmation' => $result,
            'detail' => $this->detail($id),
        ];
    }

    private function buildListQuery(array $where)
    {
        $query = Db::name(self::CAMP_ORDER_TABLE)
            ->alias('c')
            ->join('other_order o', 'o.id = c.other_order_id AND o.order_id = c.order_id')
            ->leftJoin('user u', 'u.uid = c.uid')
            ->leftJoin('training_camp_registration r', 'r.uid = c.uid AND r.is_del = 0');

        $keyword = trim((string)($where['keyword'] ?? ''));
        if ($keyword !== '') {
            $query->where(function ($query) use ($keyword) {
                $query->whereLike('c.order_id|u.nickname|u.phone|r.child_name|r.contact_phone', '%' . $keyword . '%');
            });
        }
        foreach (['order_state', 'delivery_state', 'refund_state'] as $field) {
            $value = trim((string)($where[$field] ?? ''));
            if ($value !== '') {
                $query->where('c.' . $field, $value);
            }
        }
        if (!empty($where['add_time'])) {
            $times = explode('-', (string)$where['add_time']);
            if (count($times) >= 2) {
                $start = strtotime(trim($times[0]));
                $end = strtotime(trim($times[1]) . ' 23:59:59');
                if ($start && $end) {
                    $query->whereBetween('c.add_time', [$start, $end]);
                }
            }
        }
        return $query;
    }

    private function summary(): array
    {
        $base = Db::name(self::CAMP_ORDER_TABLE);
        return [
            'total' => (int)(clone $base)->count(),
            'pending' => (int)(clone $base)->whereIn('order_state', ['pending', 'paying'])->count(),
            'paid' => (int)(clone $base)->where('order_state', 'paid')->count(),
            'deliveryFailed' => (int)(clone $base)->where('delivery_state', 'failed')->count(),
            'refundReview' => (int)(clone $base)->where('refund_state', 'refunded')->where('entitlement_state', 'review')->count(),
        ];
    }

    private function requireOrder(int $id): array
    {
        if ($id <= 0) {
            throw new ApiException('缺少训练营订单 ID');
        }
        $row = Db::name(self::CAMP_ORDER_TABLE)
            ->alias('c')
            ->join('other_order o', 'o.id = c.other_order_id AND o.order_id = c.order_id')
            ->leftJoin('user u', 'u.uid = c.uid')
            ->leftJoin('training_camp_registration r', 'r.uid = c.uid AND r.is_del = 0')
            ->where('c.id', $id)
            ->field('c.*,o.paid,o.is_del,o.pay_price,o.pay_time,o.member_price,o.vip_day,o.is_permanent,u.nickname,u.phone,u.avatar,r.child_name,r.contact_phone')
            ->find();
        if (!$row) {
            throw new ApiException('训练营订单不存在');
        }
        return $row;
    }

    private function latestAttempts(array $orderIds): array
    {
        if (!$orderIds) return [];
        $rows = Db::name(self::ATTEMPT_TABLE)
            ->whereIn('order_id', $orderIds)
            ->order('id', 'desc')
            ->select()
            ->toArray();
        $result = [];
        foreach ($rows as $row) {
            $key = (string)$row['order_id'];
            if (!isset($result[$key])) $result[$key] = $row;
        }
        return $result;
    }

    private function formatOrder(array $row, array $attempt): array
    {
        return [
            'id' => (int)$row['id'],
            'uid' => (int)$row['uid'],
            'orderId' => (string)$row['order_id'],
            'nickname' => (string)($row['nickname'] ?? ''),
            'phone' => (string)($row['phone'] ?? ''),
            'avatar' => (string)($row['avatar'] ?? ''),
            'childName' => (string)($row['child_name'] ?? ''),
            'contactPhone' => (string)($row['contact_phone'] ?? ''),
            'planId' => (int)$row['plan_id'],
            'memberType' => (string)$row['member_type'],
            'productId' => (string)$row['product_id'],
            'price' => number_format((int)$row['price_fen'] / 100, 2, '.', ''),
            'paid' => (bool)$row['paid'],
            'closed' => (bool)$row['is_del'],
            'orderState' => (string)$row['order_state'],
            'orderStateText' => $this->orderStateText((string)$row['order_state']),
            'entitlementState' => (string)$row['entitlement_state'],
            'entitlementStateText' => $this->entitlementStateText((string)$row['entitlement_state']),
            'deliveryState' => (string)$row['delivery_state'],
            'deliveryStateText' => $this->deliveryStateText((string)$row['delivery_state']),
            'refundState' => (string)$row['refund_state'],
            'refundStateText' => $this->refundStateText((string)$row['refund_state']),
            'refundAccountFrozen' => (bool)($row['refund_account_frozen'] ?? false),
            'lastError' => (string)($row['last_error'] ?? ''),
            'addTime' => $this->formatTime((int)$row['add_time']),
            'payTime' => $this->formatTime((int)($row['pay_time'] ?? 0)),
            'updateTime' => $this->formatTime((int)$row['update_time']),
            'latestAttempt' => $attempt ? $this->formatAttempt($attempt) : null,
            'canSync' => !empty($attempt),
            'canRetryDelivery' => (int)$row['paid'] === 1 && (string)$row['delivery_state'] !== 'delivered' && !empty($attempt),
            'canReviewRefund' => (string)$row['refund_state'] === 'refunded' && (string)$row['entitlement_state'] === 'review',
        ];
    }

    private function formatAttempt(array $attempt): array
    {
        $status = (int)($attempt['wx_status'] ?? 0);
        return [
            'id' => (int)($attempt['id'] ?? 0),
            'outTradeNo' => (string)($attempt['out_trade_no'] ?? ''),
            'wxOrderId' => (string)($attempt['wx_order_id'] ?? ''),
            'transactionId' => (string)($attempt['transaction_id'] ?? ''),
            'wxStatus' => $status,
            'wxStatusText' => $this->wxStatusText($status),
            'localState' => (string)($attempt['local_state'] ?? ''),
            'retryCount' => (int)($attempt['retry_count'] ?? 0),
            'deliveryRetryCount' => (int)($attempt['delivery_retry_count'] ?? 0),
            'lastError' => (string)($attempt['last_error'] ?? ''),
            'confirmedAt' => $this->formatTime((int)($attempt['confirmed_at'] ?? 0)),
            'deliveredAt' => $this->formatTime((int)($attempt['delivered_at'] ?? 0)),
            'addTime' => $this->formatTime((int)($attempt['add_time'] ?? 0)),
            'updateTime' => $this->formatTime((int)($attempt['update_time'] ?? 0)),
        ];
    }

    private function orderStateText(string $state): string
    {
        return ['pending' => '待支付', 'paying' => '支付处理中', 'paid' => '已支付', 'closed' => '已关闭', 'refunded' => '已退款', 'exception' => '异常'][$state] ?? $state;
    }

    private function entitlementStateText(string $state): string
    {
        return ['not_granted' => '未发放', 'granted' => '已开通', 'review' => '待人工复核', 'revoked' => '退款后已撤销', 'retained' => '退款后保留'][$state] ?? $state;
    }

    private function deliveryStateText(string $state): string
    {
        return ['not_delivered' => '未确认', 'delivered' => '已确认', 'failed' => '确认失败'][$state] ?? $state;
    }

    private function refundStateText(string $state): string
    {
        return ['none' => '无退款', 'refunding' => '退款中', 'refunded' => '已退款', 'failed' => '退款失败'][$state] ?? $state;
    }

    private function wxStatusText(int $status): string
    {
        return [0 => '初始化/未创建', 1 => '已创建', 2 => '已支付待发货', 3 => '发货中', 4 => '发货完成', 5 => '已退款', 6 => '已关闭', 7 => '退款失败', 8 => '用户退款完成'][$status] ?? '未知';
    }

    private function formatTime(int $timestamp): string
    {
        return $timestamp > 0 ? date('Y-m-d H:i:s', $timestamp) : '';
    }
}
