<?php

namespace app\services\miniapp;

use app\services\BaseServices;
use app\services\order\OtherOrderServices;
use app\services\order\OtherOrderStatusServices;
use app\services\other\QrcodeServices;
use app\services\pay\PayServices;
use app\services\pay\PaymentLockService;
use app\services\pay\VirtualPaymentServices;
use app\services\user\member\MemberCardServices;
use app\services\user\UserServices;
use app\services\user\UserExtractServices;
use app\services\wechat\RoutineServices;
use app\services\wechat\WechatUserServices;
use crmeb\exceptions\ApiException;
use crmeb\services\CacheService;
use think\facade\Db;
use think\facade\Log;

class MiniappServices extends BaseServices
{
    private const PENDING_MEMBER_ORDER_TTL = 1800;
    private const CAMP_ORDER_TABLE = 'miniapp_training_camp_order';
    private const TRAINING_CAMP_MEMBER_TYPE = 'ever';

    private const REFERRAL_POSTER_PAGES = [
        'pages/home/home',
        'pages/module-5-camp/module-5-camp',
        'pages/camp-checkout/camp-checkout',
    ];

    public function login(string $code, string $referrerUid = ''): array
    {
        if ($code === '') {
            throw new ApiException('Missing wx.login code');
        }

        $pendingSpreadUid = $this->resolveMemberReferrerUid($referrerUid);

        /** @var RoutineServices $routineServices */
        $routineServices = app()->make(RoutineServices::class);
        $authInfo = $routineServices->authType($code, 0, 0);
        $createData = CacheService::get($authInfo['key'] ?? '');
        $loginInfo = $routineServices->authLogin($authInfo['key']);

        [$openid] = $createData ?: [''];
        /** @var WechatUserServices $wechatUserServices */
        $wechatUserServices = app()->make(WechatUserServices::class);
        $user = $openid ? $wechatUserServices->getAuthUserInfo($openid, 'routine') : null;
        $user = $this->modelToArray($user);

        if (!$user || empty($user['uid'])) {
            throw new ApiException('Miniapp user login failed');
        }

        if ($pendingSpreadUid > 0) {
            /** @var UserServices $userServices */
            $userServices = app()->make(UserServices::class);
            $userServices->recordPendingMemberReferrer((int)$user['uid'], $pendingSpreadUid);
        }

        return [
            'token' => $loginInfo['token'],
            'expiresTime' => $loginInfo['expires_time'] ?? 0,
            'bindName' => $loginInfo['bindName'] ?? false,
            'user' => $this->formatUser($user),
        ];
    }

    public function getMineOverview(int $uid): array
    {
        $user = $this->requireUser($uid);
        $member = $this->formatMember($user);
        $plans = $this->getMemberPlans();
        $defaultPlan = $this->getDefaultMemberPlan($plans);

        return [
            'member' => $member,
            'registration' => app()->make(TrainingCampRegistrationServices::class)->getSummaryForMiniapp($uid),
            'trainingCamp' => [
                'productId' => $defaultPlan['mcId'] ? 'member-card-' . $defaultPlan['mcId'] : 'training-camp-21-days',
                'memberPlan' => $defaultPlan,
                'memberPlans' => $plans,
                'title' => $this->zh('\u0032\u0031\u5929\u81ea\u4e3b\u5b66\u4e60\u8bad\u7ec3\u8425'),
                'subtitle' => $this->zh('\u76f4\u64ad\u8bfe + \u6253\u5361\u966a\u8dd1 + \u7b54\u7591\u670d\u52a1'),
                'priceText' => $defaultPlan['priceText'] ?: $this->zh('\u0033\u0039\u0039\u5143'),
                'ctaText' => $member['isMember'] ? $this->zh('\u8fdb\u5165\u8bad\u7ec3\u8425') : $this->zh('\u7acb\u5373\u62a5\u540d'),
            ],
            'benefitText' => $member['isMember'] ? $this->zh('\u4f1a\u5458\u6743\u76ca\u5df2\u5f00\u901a') : $this->zh('\u62a5\u540d\u540e\u5f00\u901a\u4f1a\u5458\u6743\u76ca'),
            'referral' => $this->formatReferral($user),
        ];
    }

    public function getMemberPlans(): array
    {
        /** @var MemberCardServices $memberCardServices */
        $memberCardServices = app()->make(MemberCardServices::class);
        $plans = $memberCardServices->DoMemberType();
        if (!$plans) {
            return [];
        }

        $plans = array_filter($plans, function ($item) {
            return (string)($item['type'] ?? '') === self::TRAINING_CAMP_MEMBER_TYPE;
        });

        return array_values(array_map(function ($item) {
            $price = $this->formatAmount($item['pre_price'] ?? 0);
            $originalPrice = $this->formatAmount($item['price'] ?? 0);
            return [
                'mcId' => (int)($item['mc_id'] ?? 0),
                'title' => $item['title'] ?? '',
                'type' => $item['type'] ?? '',
                'vipDay' => (int)($item['vip_day'] ?? 0),
                'price' => $price,
                'priceText' => $price . $this->zh('\u5143'),
                'originalPrice' => $originalPrice,
                'isFree' => ($item['type'] ?? '') === 'free' || (float)$price <= 0,
            ];
        }, $plans));
    }

    public function createTrainingCampMemberOrder(int $uid, int $mcId = 0, string $payType = PayServices::VIRTUAL_PAY): array
    {
        $user = $this->requireUser($uid);
        $plans = $this->getMemberPlans();
        $plan = $mcId > 0 ? $this->findMemberPlan($plans, $mcId) : $this->getDefaultMemberPlan($plans);
        if (!$plan || empty($plan['mcId'])) {
            throw new ApiException('No paid membership plan is configured');
        }
        if (!empty($plan['isFree'])) {
            throw new ApiException('Please choose a paid membership plan');
        }
        if ((string)($plan['type'] ?? '') !== self::TRAINING_CAMP_MEMBER_TYPE) {
            throw new ApiException('Training camp only supports permanent membership');
        }

        // This product delivers digital membership/content and must not fall back to ordinary WeChat Pay.
        $payType = PayServices::VIRTUAL_PAY;

        /** @var PaymentLockService $lock */
        $lock = app()->make(PaymentLockService::class);
        return $lock->run('camp:create:' . $uid, function () use ($uid, $user, $plan, $payType) {
            /** @var VirtualPaymentServices $virtualPaymentServices */
            $virtualPaymentServices = app()->make(VirtualPaymentServices::class);
            $virtualPaymentServices->reconcileUserPendingOrders($uid);
            $this->expirePendingTrainingCampOrders($uid);

            $pendingOrder = $this->getPendingTrainingCampOrder($uid);
            if ($pendingOrder) {
                $sameMemberType = (string)($pendingOrder['member_type'] ?? '') === (string)$plan['type'];
                $samePrice = $this->formatAmount($pendingOrder['pay_price'] ?? 0) === $this->formatAmount($plan['price']);
                if ($sameMemberType && $samePrice) {
                    return $this->formatTrainingCampOrderAction($pendingOrder, 'pending_reused');
                }

                $virtualPaymentServices->assertTrainingCampOrderClosable($uid, $pendingOrder);
                $this->closeTrainingCampOrderRecord(
                    $pendingOrder,
                    'replace_member_order',
                    $this->zh('\u4f1a\u5458\u65b9\u6848\u6216\u4ef7\u683c\u5df2\u66f4\u65b0\uff0c\u65e7\u8ba2\u5355\u5df2\u5173\u95ed')
                );
            }

            return Db::transaction(function () use ($uid, $user, $plan, $payType) {
                // The user row is the database fallback when Redis is unavailable.
                Db::name('user')->where('uid', $uid)->lock(true)->find();
                $existing = $this->getPendingTrainingCampOrder($uid);
                if ($existing) {
                    $sameType = (string)$existing['member_type'] === (string)$plan['type'];
                    $samePrice = $this->formatAmount($existing['pay_price']) === $this->formatAmount($plan['price']);
                    if ($sameType && $samePrice) {
                        return $this->formatTrainingCampOrderAction($existing, 'pending_reused');
                    }
                    throw new ApiException('已有其他报名订单正在处理，请稍后重试');
                }

                /** @var OtherOrderServices $otherOrderServices */
                $otherOrderServices = app()->make(OtherOrderServices::class);
                $order = $this->modelToArray($otherOrderServices->createOrder(
                    $uid,
                    $user['user_type'] ?? 'routine',
                    $plan['type'],
                    $plan['price'],
                    $payType,
                    1,
                    $plan['price'],
                    (int)$plan['mcId']
                ));
                if (!$order) {
                    throw new ApiException('Membership order creation failed');
                }

                Db::name(self::CAMP_ORDER_TABLE)->insert([
                    'uid' => $uid,
                    'other_order_id' => (int)$order['id'],
                    'order_id' => (string)$order['order_id'],
                    'active_uid_key' => (string)$uid,
                    'plan_id' => (int)$plan['mcId'],
                    'member_type' => (string)$plan['type'],
                    'product_id' => trim((string)config('xpay.training_camp_product_id', '')),
                    'price_fen' => (int)round((float)$plan['price'] * 100),
                    'order_state' => 'pending',
                    'entitlement_state' => 'not_granted',
                    'delivery_state' => 'not_delivered',
                    'refund_state' => 'none',
                    'add_time' => time(),
                    'update_time' => time(),
                ]);

                return $this->formatTrainingCampOrderAction($order, 'created');
            });
        }, 30, 2000);
    }

    public function payTrainingCampMemberOrder(
        int $uid,
        string $orderId,
        string $payType = PayServices::VIRTUAL_PAY,
        string $loginCode = ''
    ): array
    {
        $this->requireUser($uid);
        /** @var VirtualPaymentServices $virtualPaymentServices */
        $virtualPaymentServices = app()->make(VirtualPaymentServices::class);
        $virtualPaymentServices->reconcileUserPendingOrders($uid);
        $this->expirePendingTrainingCampOrders($uid);
        $order = $this->getTrainingCampOrderByOrderId($uid, $orderId);
        if (!$order) {
            throw new ApiException('Order does not exist');
        }
        if ((int)($order['is_del'] ?? 0) === 1) {
            throw new ApiException('Order has been closed');
        }
        if ((int)($order['paid'] ?? 0) === 1) {
            return [
                'order' => $this->formatTrainingCampOrderAction($order, 'paid'),
                'payment' => [
                    'provider' => 'wechat_xpay',
                    'alreadyConfirmed' => true,
                    'orderId' => (string)$order['order_id'],
                ],
            ];
        }

        if (($payType ?: PayServices::VIRTUAL_PAY) !== PayServices::VIRTUAL_PAY) {
            throw new ApiException('训练营仅支持小程序虚拟支付');
        }

        return [
            'order' => $this->formatTrainingCampOrderAction($order, 'paying'),
            'payment' => $virtualPaymentServices->prepareTrainingCampPayment($uid, $order, $loginCode),
        ];
    }

    public function confirmTrainingCampMemberOrder(int $uid, string $orderId, string $outTradeNo): array
    {
        $this->requireUser($uid);
        $order = $this->getTrainingCampOrderByOrderId($uid, $orderId);
        if (!$order) {
            throw new ApiException('Order does not exist');
        }

        /** @var VirtualPaymentServices $virtualPaymentServices */
        $virtualPaymentServices = app()->make(VirtualPaymentServices::class);
        return $virtualPaymentServices->confirmTrainingCampPayment($uid, $order, $outTradeNo);
    }

    public function cancelTrainingCampMemberOrder(int $uid, string $orderId): array
    {
        $this->requireUser($uid);
        $order = $this->getTrainingCampOrderByOrderId($uid, $orderId);
        if (!$order) {
            throw new ApiException('Order does not exist');
        }
        if ((int)($order['paid'] ?? 0) === 1) {
            throw new ApiException('Paid order cannot be cancelled');
        }
        if ((int)($order['is_del'] ?? 0) === 1) {
            return $this->formatTrainingCampOrderAction($order, 'closed');
        }

        /** @var VirtualPaymentServices $virtualPaymentServices */
        $virtualPaymentServices = app()->make(VirtualPaymentServices::class);
        $virtualPaymentServices->assertTrainingCampOrderClosable($uid, $order);
        $this->closeTrainingCampOrderRecord(
            $order,
            'cancel_member_order',
            $this->zh('\u7528\u6237\u53d6\u6d88\u8ba2\u5355')
        );
        $order['is_del'] = 1;

        return $this->formatTrainingCampOrderAction($order, 'closed');
    }

    public function createReferralPoster(int $uid, string $page = ''): array
    {
        $user = $this->requireMemberUser($uid);
        if (!$this->canPromote($user)) {
            throw new ApiException('当前账号的推广资格已关闭');
        }
        $member = $this->formatMember($user);

        $page = $this->normalizeReferralPosterPage($page);
        $memberUid = $member['uid'];
        /** @var QrcodeServices $qrcodeServices */
        $qrcodeServices = app()->make(QrcodeServices::class);
        // Return the generated code inline. The mini program reaches this API
        // through CloudBase callContainer, so a container-local /uploads URL is
        // not a reliable image source for the device.
        $codeUrl = $qrcodeServices->getMiniappMemberInviteCode($memberUid, $page, false);
        if (!$codeUrl || $codeUrl === 'unpublished') {
            throw new ApiException($this->zh('\u5c0f\u7a0b\u5e8f\u4e8c\u7ef4\u7801\u751f\u6210\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5 AppID\u3001AppSecret \u548c\u56fe\u7247\u5b58\u50a8\u914d\u7f6e'));
        }

        return [
            'memberUid' => $memberUid,
            'posterUrl' => '',
            'codeUrl' => $codeUrl ?: '',
            'sharePath' => $page . '?ref=' . $memberUid,
            'scene' => 'ref=' . $memberUid,
        ];
    }

    public function useRedeemCode(int $uid, string $code): array
    {
        $this->requireUser($uid);
        if (trim($code) === '') {
            throw new ApiException('Missing redeem code');
        }

        throw new ApiException('Redeem code backend is not configured yet');
    }

    public function getInviteRecords(int $uid, int $grade = 0, string $sort = '', string $keyword = ''): array
    {
        $this->requireMemberUser($uid);
        /** @var UserServices $userServices */
        $userServices = app()->make(UserServices::class);
        $firstLevelUids = $userServices->getUserSpredadUids($uid, 1);
        $secondLevelUids = sys_config('brokerage_level', 2) == 2 ? $userServices->getUserSpredadUids($uid, 2) : [];
        $targetUids = (int)$grade === 1 ? $secondLevelUids : $firstLevelUids;
        $list = [];

        if ($targetUids) {
            $users = Db::name('user')
                ->whereIn('uid', $targetUids)
                ->where('is_del', 0)
                ->field('uid,nickname,avatar,phone,add_time,spread_time,spread_uid,is_ever_level,is_money_level,overdue_time,level,pay_count')
                ->order('spread_time', 'desc')
                ->select()
                ->toArray();
            foreach ($users as $item) {
                $list[] = $this->formatInviteRecord($item, (int)$grade === 1 ? 2 : 1, 'registered');
            }
        }

        if ((int)$grade === 0) {
            $list = array_merge($this->getPendingInviteRecords($uid), $list);
        }
        $pendingCount = count(array_filter($list, function ($item) {
            return ($item['status'] ?? '') === 'pending';
        }));
        $registeredCount = count(array_filter($list, function ($item) {
            return ($item['status'] ?? '') === 'registered';
        }));

        return [
            'summary' => [
                'invitedCount' => $pendingCount + $registeredCount,
                'pendingCount' => $pendingCount,
                'registeredCount' => $registeredCount,
                'secondLevelCount' => count($secondLevelUids),
            ],
            'brokerageLevel' => (int)sys_config('brokerage_level', 2),
            'list' => $list,
            'count' => count($list),
        ];
    }

    public function getIncomeRecords(int $uid, int $type = 3): array
    {
        $this->requireMemberUser($uid);
        [$page, $limit, $defaultLimit] = $this->getPageValue();
        $limit = $limit ?: $defaultLimit;
        $count = Db::name('user_brokerage')
            ->where('uid', $uid)
            ->whereIn('type', $this->memberIncomeTypes())
            ->count();
        $rows = Db::name('user_brokerage')
            ->where('uid', $uid)
            ->whereIn('type', $this->memberIncomeTypes())
            ->order('id', 'desc')
            ->page($page ?: 1, $limit)
            ->select()
            ->toArray();
        $list = array_map(function ($item) {
            return $this->formatIncomeRecord($item);
        }, $rows);
        $totalAmount = Db::name('user_brokerage')
            ->where('uid', $uid)
            ->whereIn('type', $this->memberIncomeTypes())
            ->where('pm', 1)
            ->sum('number');
        $pendingAmount = Db::name('user_brokerage')
            ->where('uid', $uid)
            ->whereIn('type', $this->memberIncomeTypes())
            ->where('pm', 1)
            ->where('frozen_time', '>', time())
            ->sum('number');
        $settledAmount = Db::name('user_brokerage')
            ->where('uid', $uid)
            ->whereIn('type', $this->memberIncomeTypes())
            ->where('pm', 1)
            ->where(function ($query) {
                $query->where('frozen_time', '<=', time())->whereOr('frozen_time', 0);
            })
            ->sum('number');

        return [
            'summary' => [
                'totalAmount' => $this->formatAmount($totalAmount),
                'availableAmount' => $this->formatAmount($settledAmount),
                'pendingAmount' => $this->formatAmount($pendingAmount),
                'settledAmount' => $this->formatAmount($settledAmount),
            ],
            'list' => $list,
            'count' => $count,
        ];
    }

    public function getTrainingCampOrders(int $uid): array
    {
        $this->requireUser($uid);
        /** @var VirtualPaymentServices $virtualPaymentServices */
        $virtualPaymentServices = app()->make(VirtualPaymentServices::class);
        $virtualPaymentServices->reconcileUserPendingOrders($uid);
        $this->expirePendingTrainingCampOrders($uid);

        [$page, $limit, $defaultLimit] = $this->getPageValue();
        $limit = $limit ?: $defaultLimit;
        $baseQuery = Db::name('other_order')
            ->alias('o')
            ->join(self::CAMP_ORDER_TABLE . ' c', 'c.other_order_id = o.id AND c.order_id = o.order_id')
            ->leftJoin('user u', 'u.uid = o.uid')
            ->where('c.uid', $uid)
            ->where(function ($query) {
                $query->where('o.is_del', 0)
                    ->whereOr(function ($query) {
                        $query->where('o.is_del', 1)->where('o.paid', 0);
                    });
            });
        $count = (clone $baseQuery)->count();
        $paidCount = (clone $baseQuery)->where('o.paid', 1)->where('o.is_del', 0)->count();
        $pendingCount = (clone $baseQuery)->where('o.paid', 0)->where('o.is_del', 0)->count();
        $closedCount = (clone $baseQuery)->where('o.paid', 0)->where('o.is_del', 1)->count();
        $paidAmount = (clone $baseQuery)->where('o.paid', 1)->where('o.is_del', 0)->sum('o.pay_price');
        $rows = $baseQuery
            ->field('o.id,o.uid,o.order_id,o.member_type,o.pay_type,o.paid,o.pay_price,o.member_price,o.pay_time,o.add_time,o.is_free,o.is_permanent,o.vip_day,o.is_del,u.nickname,u.phone')
            ->order('o.id', 'desc')
            ->page($page ?: 1, $limit)
            ->select()
            ->toArray();
        $list = array_map(function ($item) {
            return $this->formatTrainingCampOrder($item, 0);
        }, $rows);

        return [
            'summary' => [
                'totalCount' => $count,
                'paidCount' => $paidCount,
                'pendingCount' => $pendingCount,
                'closedCount' => $closedCount,
                'paidAmount' => $this->formatAmount($paidAmount),
            ],
            'list' => $list,
            'count' => $count,
        ];
    }

    public function getWithdrawalOverview(int $uid): array
    {
        $user = $this->requireMemberUser($uid);
        /** @var UserExtractServices $extractServices */
        $extractServices = app()->make(UserExtractServices::class);
        $config = $extractServices->bank($uid);
        $records = Db::name('user_extract')
            ->where('uid', $uid)
            ->where('extract_type', 'weixin')
            ->order('id', 'desc')
            ->limit(10)
            ->select()
            ->toArray();

        $list = array_map(function (array $row) {
            $status = (int)($row['status'] ?? 0);
            $state = strtoupper((string)($row['state'] ?? ''));
            $statusKey = $status === -1 ? 'rejected' : ($status === 0 ? 'reviewing' : 'processing');
            $statusText = $status === -1 ? '已拒绝' : ($status === 0 ? '审核中' : '处理中');
            if ($status === 1 && $state === 'SUCCESS') {
                $statusKey = 'paid';
                $statusText = '已到账';
            } elseif ($status === 1 && !empty($row['package_info']) && in_array($state, ['', 'WAIT_USER_CONFIRM'], true)) {
                $statusKey = 'confirm';
                $statusText = '待确认收款';
            } elseif ($status === 1 && $state === '') {
                $statusKey = 'paid';
                $statusText = '已通过';
            }

            return [
                'id' => (int)$row['id'],
                'amount' => $this->formatAmount($row['extract_price'] ?? 0),
                'fee' => $this->formatAmount($row['extract_fee'] ?? 0),
                'status' => $statusKey,
                'statusText' => $statusText,
                'state' => $state,
                'failReason' => (string)($row['fail_reason'] ?: ($row['fail_msg'] ?? '')),
                'addTime' => !empty($row['add_time']) ? date('Y-m-d H:i:s', (int)$row['add_time']) : '',
                'canConfirm' => $statusKey === 'confirm',
                'transfer' => $statusKey === 'confirm' ? [
                    'mchId' => (string)sys_config('pay_weixin_mchid', ''),
                    'appId' => (string)sys_config('routine_appId', ''),
                    'package' => (string)$row['package_info'],
                ] : null,
            ];
        }, $records);

        return [
            'enabled' => (bool)sys_config('weixin_extract_type', 0),
            'eligible' => (int)($user['is_promoter'] ?? 0) === 1 && (int)($user['spread_open'] ?? 0) === 1,
            'availableAmount' => $this->formatAmount(max(0, (float)($config['commissionCount'] ?? 0))),
            'minAmount' => $this->formatAmount($config['minPrice'] ?? 0.1),
            'feeRate' => (string)($config['withdrawal_fee'] ?? 0),
            'hasPending' => Db::name('user_extract')->where('uid', $uid)->where('status', 0)->count() > 0,
            'list' => $list,
        ];
    }

    public function applyWithdrawal(int $uid, $amount): array
    {
        $user = $this->requireMemberUser($uid);
        if ((int)($user['is_promoter'] ?? 0) !== 1 || (int)($user['spread_open'] ?? 0) !== 1) {
            throw new ApiException('当前账号没有有效的推广提现资格');
        }
        if (!sys_config('weixin_extract_type', 0)) {
            throw new ApiException('后台尚未开启微信提现到零钱，请联系管理员');
        }
        if (!is_numeric($amount)) {
            throw new ApiException('请输入正确的提现金额');
        }
        $amount = bcadd((string)$amount, '0', 2);
        if (bccomp($amount, '0.10', 2) < 0) {
            throw new ApiException('提现金额不能小于0.10元');
        }

        Db::transaction(function () use ($uid, $amount, $user) {
            Db::name('user')->where('uid', $uid)->lock(true)->find();
            if (Db::name('user_extract')->where('uid', $uid)->where('status', 0)->find()) {
                throw new ApiException('已有一笔提现正在审核，请勿重复提交');
            }

            /** @var UserExtractServices $extractServices */
            $extractServices = app()->make(UserExtractServices::class);
            $extractServices->cash($uid, [
                'extract_type' => 'weixin',
                'money' => $amount,
                'channel_type' => 'routine',
                'weixin' => '',
                'user_name' => (string)($user['real_name'] ?? ($user['nickname'] ?? '微信用户')),
                'qrcode_url' => '',
            ]);
        });

        return $this->getWithdrawalOverview($uid);
    }

    /** Safely close stale unpaid training-camp orders from the cron worker. */
    public function expireStaleTrainingCampOrders(int $limit = 100): array
    {
        $orders = Db::name('other_order')
            ->alias('o')
            ->join(self::CAMP_ORDER_TABLE . ' c', 'c.other_order_id = o.id AND c.order_id = o.order_id')
            ->whereIn('c.order_state', ['pending', 'paying'])
            ->where('o.paid', 0)
            ->where('o.is_del', 0)
            ->where('o.add_time', '<', time() - self::PENDING_MEMBER_ORDER_TTL)
            ->field('o.*')
            ->order('o.id', 'asc')
            ->limit(max(1, min(200, $limit)))
            ->select()
            ->toArray();

        $result = ['checked' => 0, 'closed' => 0, 'deferred' => 0];
        foreach ($orders as $order) {
            $result['checked']++;
            try {
                /** @var VirtualPaymentServices $virtualPaymentServices */
                $virtualPaymentServices = app()->make(VirtualPaymentServices::class);
                $virtualPaymentServices->assertTrainingCampOrderClosable((int)$order['uid'], $order);
                $this->closeTrainingCampOrderRecord(
                    $order,
                    'timeout_member_order',
                    $this->zh('\u8ba2\u5355\u8d85\u65f6\u81ea\u52a8\u5173\u95ed')
                );
                $result['closed']++;
            } catch (\Throwable $exception) {
                $result['deferred']++;
                Log::warning('training_camp_order_timeout_deferred', [
                    'order_id' => $order['order_id'] ?? '',
                    'message' => $exception->getMessage(),
                ]);
            }
        }
        return $result;
    }

    private function getPendingTrainingCampOrder(int $uid): ?array
    {
        $row = Db::name('other_order')
            ->alias('o')
            ->join(self::CAMP_ORDER_TABLE . ' c', 'c.other_order_id = o.id AND c.order_id = o.order_id')
            ->where('c.uid', $uid)
            ->whereIn('c.order_state', ['pending', 'paying'])
            ->where('o.paid', 0)
            ->where('o.is_del', 0)
            ->field('o.*')
            ->order('o.id', 'desc')
            ->find();

        return $row ?: null;
    }

    private function getTrainingCampOrderByOrderId(int $uid, string $orderId): ?array
    {
        $orderId = trim($orderId);
        if ($orderId === '') {
            throw new ApiException('Missing order id');
        }
        $row = Db::name('other_order')
            ->alias('o')
            ->join(self::CAMP_ORDER_TABLE . ' c', 'c.other_order_id = o.id AND c.order_id = o.order_id')
            ->where('c.uid', $uid)
            ->where('c.order_id', $orderId)
            ->field('o.*')
            ->find();

        return $row ?: null;
    }

    private function expirePendingTrainingCampOrders(int $uid): void
    {
        $deadline = time() - self::PENDING_MEMBER_ORDER_TTL;
        $orders = Db::name('other_order')
            ->alias('o')
            ->join(self::CAMP_ORDER_TABLE . ' c', 'c.other_order_id = o.id AND c.order_id = o.order_id')
            ->where('c.uid', $uid)
            ->whereIn('c.order_state', ['pending', 'paying'])
            ->where('o.paid', 0)
            ->where('o.is_del', 0)
            ->where('o.add_time', '<', $deadline)
            ->field('o.*')
            ->select()
            ->toArray();

        foreach ($orders as $order) {
            try {
                /** @var VirtualPaymentServices $virtualPaymentServices */
                $virtualPaymentServices = app()->make(VirtualPaymentServices::class);
                $virtualPaymentServices->assertTrainingCampOrderClosable($uid, $order);
                $this->closeTrainingCampOrderRecord(
                    $order,
                    'timeout_member_order',
                    $this->zh('\u8ba2\u5355\u8d85\u65f6\u81ea\u52a8\u5173\u95ed')
                );
            } catch (\Throwable $exception) {
                // A query failure or in-flight payment must never be converted to a local close.
                Log::warning('training_camp_order_timeout_deferred', [
                    'order_id' => $order['order_id'] ?? '',
                    'message' => $exception->getMessage(),
                ]);
            }
        }
    }

    private function closeTrainingCampOrderRecord(array $order, string $changeType, string $message): void
    {
        Db::transaction(function () use ($order, $changeType, $message) {
            $locked = Db::name('other_order')->where('id', (int)$order['id'])->lock(true)->find();
            $camp = Db::name(self::CAMP_ORDER_TABLE)
                ->where('order_id', (string)$order['order_id'])
                ->lock(true)
                ->find();
            if (!$locked || !$camp) {
                throw new ApiException('训练营订单不存在');
            }
            if ((int)$locked['paid'] === 1) {
                throw new ApiException('订单已支付，不能关闭');
            }
            if ((int)$locked['is_del'] === 0) {
                Db::name('other_order')->where('id', (int)$locked['id'])->update(['is_del' => 1]);
                Db::name(self::CAMP_ORDER_TABLE)->where('id', (int)$camp['id'])->update([
                    'order_state' => 'closed',
                    'active_uid_key' => null,
                    'active_attempt_id' => null,
                    'update_time' => time(),
                ]);
                $this->saveTrainingCampOrderStatus($locked, $changeType, $message);
            }
        });
    }

    private function saveTrainingCampOrderStatus(array $order, string $changeType, string $message): void
    {
        /** @var OtherOrderStatusServices $statusService */
        $statusService = app()->make(OtherOrderStatusServices::class);
        $statusService->save([
            'oid' => (int)($order['id'] ?? 0),
            'change_type' => $changeType,
            'change_message' => $message,
            'change_time' => time(),
            'shop_type' => (int)($order['type'] ?? 1),
        ]);
    }

    private function formatTrainingCampOrderAction(array $order, string $status): array
    {
        return [
            'orderId' => $order['order_id'] ?? '',
            'id' => (int)($order['id'] ?? 0),
            'memberType' => $order['member_type'] ?? '',
            'payPrice' => $this->formatAmount($order['pay_price'] ?? 0),
            'payType' => $order['pay_type'] ?? PayServices::VIRTUAL_PAY,
            'status' => $status,
            'needPay' => (int)($order['paid'] ?? 0) === 0 && (int)($order['is_del'] ?? 0) === 0,
            'message' => $status === 'closed'
                ? $this->zh('\u8ba2\u5355\u5df2\u5173\u95ed')
                : ($status === 'pending_reused'
                    ? $this->zh('\u5df2\u6709\u5f85\u652f\u4ed8\u8ba2\u5355\uff0c\u8bf7\u7ee7\u7eed\u652f\u4ed8')
                    : $this->zh('\u4f1a\u5458\u8ba2\u5355\u5df2\u521b\u5efa\uff0c\u8bf7\u7ee7\u7eed\u5b8c\u6210\u652f\u4ed8')),
        ];
    }

    private function getDefaultMemberPlan(array $plans): array
    {
        foreach ($plans as $plan) {
            if ((string)($plan['type'] ?? '') === self::TRAINING_CAMP_MEMBER_TYPE && empty($plan['isFree'])) {
                return $plan;
            }
        }
        return $plans[0] ?? [
            'mcId' => 0,
            'title' => '',
            'type' => '',
            'vipDay' => 0,
            'price' => '',
            'priceText' => '',
            'originalPrice' => '',
            'isFree' => false,
        ];
    }

    private function findMemberPlan(array $plans, int $mcId): array
    {
        foreach ($plans as $plan) {
            if ((int)($plan['mcId'] ?? 0) === $mcId &&
                (string)($plan['type'] ?? '') === self::TRAINING_CAMP_MEMBER_TYPE) {
                return $plan;
            }
        }
        return [];
    }

    private function requireUser(int $uid): array
    {
        if ($uid <= 0) {
            throw new ApiException('Please login first');
        }

        /** @var UserServices $userServices */
        $userServices = app()->make(UserServices::class);
        $user = $this->modelToArray($userServices->getUserInfo($uid));
        if (!$user) {
            throw new ApiException('User not found');
        }
        return $user;
    }

    private function requireMemberUser(int $uid): array
    {
        $user = $this->requireUser($uid);
        if (!$this->isTrainingCampMember($user)) {
            throw new ApiException('Training camp membership is required');
        }
        return $user;
    }

    private function formatUser(array $user): array
    {
        $isMember = $this->isTrainingCampMember($user);
        return [
            'uid' => (int)$user['uid'],
            'memberUid' => $isMember ? $this->encodeMemberUid((int)$user['uid']) : '',
            'nickname' => $user['nickname'] ?? '',
            'avatar' => $user['avatar'] ?? '',
            'phone' => $user['phone'] ?? '',
        ];
    }

    private function formatMember(array $user): array
    {
        $isMember = $this->isTrainingCampMember($user);
        return [
            'isMember' => $isMember,
            'uid' => $isMember ? $this->encodeMemberUid((int)$user['uid']) : '',
            'statusText' => $isMember ? $this->zh('\u0032\u0031\u5929\u8bad\u7ec3\u8425\u4f1a\u5458') : $this->zh('\u672a\u5f00\u901a\u8bad\u7ec3\u8425'),
            'expiresAt' => $this->formatOverdueTime((int)($user['overdue_time'] ?? 0)),
        ];
    }

    private function formatReferral(array $user): array
    {
        $uid = (int)$user['uid'];
        $isMember = $this->isTrainingCampMember($user);
        if (!$isMember) {
            return [
                'inviteCount' => 0,
                'orderCount' => 0,
                'incomeAmount' => '0.00',
                'posterCount' => 0,
                'canPromote' => false,
                'posterCtaText' => $this->zh('\u5f00\u901a\u540e\u751f\u6210\u63a8\u5e7f\u6d77\u62a5'),
            ];
        }

        /** @var UserServices $userServices */
        $userServices = app()->make(UserServices::class);
        $inviteCount = (int)($user['spread_count'] ?? count($userServices->getUserSpredadUids($uid, 1)));
        $canPromote = $this->canPromote($user);

        return [
            'inviteCount' => $inviteCount,
            'orderCount' => (int)($user['pay_count'] ?? 0),
            'incomeAmount' => $this->formatAmount($user['brokerage_price'] ?? 0),
            'posterCount' => 0,
            'canPromote' => $canPromote,
            'posterCtaText' => $canPromote ? $this->zh('\u751f\u6210\u63a8\u5e7f\u6d77\u62a5') : '推广资格已关闭',
        ];
    }

    private function getPendingInviteRecords(int $uid): array
    {
        $locks = Db::name('miniapp_member_referrer_locks')
            ->where('spread_uid', $uid)
            ->where('status', 0)
            ->where('expires_at', '>=', time())
            ->order('locked_at', 'desc')
            ->select()
            ->toArray();
        if (!$locks) {
            return [];
        }

        $targetUids = array_values(array_unique(array_map('intval', array_column($locks, 'uid'))));
        $users = [];
        if ($targetUids) {
            $rows = Db::name('user')
                ->whereIn('uid', $targetUids)
                ->where('is_del', 0)
                ->field('uid,nickname,avatar,phone,add_time,spread_time,spread_uid,is_ever_level,is_money_level,overdue_time,level,pay_count')
                ->select()
                ->toArray();
            foreach ($rows as $row) {
                $users[(int)$row['uid']] = $row;
            }
        }

        $records = [];
        foreach ($locks as $lock) {
            $targetUid = (int)($lock['uid'] ?? 0);
            $item = $users[$targetUid] ?? ['uid' => $targetUid];
            $item['locked_at'] = (int)($lock['locked_at'] ?? 0);
            $item['expires_at'] = (int)($lock['expires_at'] ?? 0);
            $records[] = $this->formatInviteRecord($item, 1, 'pending');
        }

        return $records;
    }

    private function formatInviteRecord(array $item, int $grade, string $fallbackStatus): array
    {
        $uid = (int)($item['uid'] ?? 0);
        $isMember = $this->isTrainingCampMember($item);
        // A referral binding is only an invitation. It becomes "registered" after
        // the invited user has actually obtained the training-camp membership.
        $status = $isMember ? 'registered' : 'pending';
        $time = $status === 'pending'
            ? (int)($item['locked_at'] ?? $item['spread_time'] ?? $item['add_time'] ?? 0)
            : (int)($item['spread_time'] ?? $item['add_time'] ?? 0);
        $orderCount = $status === 'registered' ? max(1, (int)($item['pay_count'] ?? 0)) : 0;

        return [
            'id' => (string)$uid,
            'uid' => $uid,
            'memberUid' => $isMember ? $this->encodeMemberUid($uid) : '',
            'avatar' => $item['avatar'] ?? '',
            'nickname' => $item['nickname'] ?? '',
            'name' => $item['nickname'] ?? '',
            'phone' => $item['phone'] ?? '',
            'grade' => $grade,
            'orderCount' => $orderCount,
            'time' => $this->formatOverdueTime($time),
            'add_time' => $this->formatOverdueTime((int)($item['add_time'] ?? 0)),
            'lockedAt' => $this->formatOverdueTime((int)($item['locked_at'] ?? 0)),
            'expiresAt' => $this->formatOverdueTime((int)($item['expires_at'] ?? 0)),
            'status' => $status,
            'statusText' => $status === 'registered' ? $this->zh('\u5df2\u62a5\u540d') : $this->zh('\u5f85\u8f6c\u5316'),
            'source' => $this->zh('\u4f1a\u5458\u4e8c\u7ef4\u7801'),
            'reward' => '0.00',
            'rewardState' => $status === 'registered' ? $this->zh('\u5f85\u7ed3\u7b97') : $this->zh('\u62a5\u540d\u540e\u8ba1\u5956'),
        ];
    }

    private function memberIncomeTypes(): array
    {
        return ['get_member_brokerage', 'get_self_member_brokerage', 'get_two_member_brokerage', 'self_member_brokerage', 'one_member_brokerage', 'two_member_brokerage'];
    }

    private function formatIncomeRecord(array $item): array
    {
        $type = (string)($item['type'] ?? '');
        $typeText = in_array($type, ['get_two_member_brokerage', 'two_member_brokerage'], true)
            ? $this->zh('\u4e8c\u7ea7\u4f1a\u5458\u4f63\u91d1')
            : $this->zh('\u4e00\u7ea7\u4f1a\u5458\u4f63\u91d1');
        $isFrozen = (int)($item['frozen_time'] ?? 0) > time();
        $status = $isFrozen ? 'pending' : 'settled';

        return [
            'id' => (string)($item['id'] ?? ''),
            'type' => $type,
            'typeText' => $typeText,
            'title' => $typeText,
            'desc' => $item['mark'] ?? '',
            'mark' => $item['mark'] ?? '',
            'time' => $this->formatOverdueTime((int)($item['add_time'] ?? 0)),
            'add_time' => $this->formatOverdueTime((int)($item['add_time'] ?? 0)),
            'amount' => $this->formatAmount($item['number'] ?? 0),
            'number' => $this->formatAmount($item['number'] ?? 0),
            'pm' => (int)($item['pm'] ?? 1),
            'statusKey' => $status,
            'statusText' => $status === 'pending' ? $this->zh('\u5f85\u7ed3\u7b97') : $this->zh('\u5df2\u5230\u8d26'),
            'isFrozen' => $isFrozen,
            'frozenTime' => $this->formatOverdueTime((int)($item['frozen_time'] ?? 0)),
            'linkId' => (int)($item['link_id'] ?? 0),
        ];
    }

    private function formatTrainingCampOrder(array $item, int $grade): array
    {
        $paid = (int)($item['paid'] ?? 0) === 1;
        $closed = (int)($item['is_del'] ?? 0) === 1;
        $status = $closed ? 'closed' : ($paid ? 'paid' : 'pending');
        $time = $paid && !empty($item['pay_time']) ? (int)$item['pay_time'] : (int)($item['add_time'] ?? 0);
        $buyer = trim((string)($item['nickname'] ?? ''));
        if ($buyer === '') {
            $buyer = $this->zh('\u7528\u6237') . (int)($item['uid'] ?? 0);
        }

        return [
            'id' => (string)($item['id'] ?? ''),
            'uid' => (int)($item['uid'] ?? 0),
            'memberUid' => $this->encodeMemberUid((int)($item['uid'] ?? 0)),
            'grade' => $grade,
            'title' => $this->zh('\u0032\u0031\u5929\u81ea\u4e3b\u5b66\u4e60\u8bad\u7ec3\u8425'),
            'buyer' => $buyer,
            'phone' => $item['phone'] ?? '',
            'orderNo' => $item['order_id'] ?? '',
            'time' => $this->formatOverdueTime($time),
            'add_time' => $this->formatOverdueTime((int)($item['add_time'] ?? 0)),
            'payTime' => $this->formatOverdueTime((int)($item['pay_time'] ?? 0)),
            'amount' => $this->formatAmount($item['pay_price'] ?? 0),
            'amountText' => $this->formatAmount($item['pay_price'] ?? 0) . $this->zh('\u5143'),
            'memberType' => $item['member_type'] ?? '',
            'payType' => $item['pay_type'] ?? '',
            'status' => $status,
            'statusText' => $closed ? $this->zh('\u5df2\u5173\u95ed') : ($paid ? $this->zh('\u5df2\u652f\u4ed8') : $this->zh('\u5f85\u652f\u4ed8')),
            'canPay' => $status === 'pending',
            'canCancel' => $status === 'pending',
        ];
    }

    private function isTrainingCampMember(array $user): bool
    {
        $overdueTime = (int)($user['overdue_time'] ?? 0);
        $isPaidLevel = (int)($user['is_money_level'] ?? 0) > 0 && ($overdueTime === 0 || $overdueTime > time());
        return (int)($user['is_ever_level'] ?? 0) > 0 || $isPaidLevel;
    }

    private function canPromote(array $user): bool
    {
        return $this->isTrainingCampMember($user)
            && (int)($user['is_promoter'] ?? 0) === 1
            && (int)($user['spread_open'] ?? 0) === 1;
    }

    private function resolveMemberReferrerUid(string $referrerUid): int
    {
        $spreadUid = $this->decodeMemberUid($referrerUid);
        if ($spreadUid <= 0) {
            return 0;
        }

        /** @var UserServices $userServices */
        $userServices = app()->make(UserServices::class);
        $spreadUser = $this->modelToArray($userServices->getUserInfo($spreadUid));
        if (!$spreadUser || !$this->canPromote($spreadUser)) {
            return 0;
        }

        return $spreadUid;
    }

    private function normalizeReferralPosterPage(string $page): string
    {
        $page = trim($page);
        if ($page === '') {
            return 'pages/home/home';
        }

        $page = str_replace('\\', '/', $page);
        $page = ltrim(explode('?', $page, 2)[0], '/');

        return in_array($page, self::REFERRAL_POSTER_PAGES, true)
            ? $page
            : 'pages/home/home';
    }

    private function decodeMemberUid(string $memberUid): int
    {
        $memberUid = trim($memberUid);
        if ($memberUid === '') {
            return 0;
        }
        $digits = preg_replace('/\D+/', '', $memberUid);
        return $digits === '' ? 0 : (int)$digits;
    }

    private function encodeMemberUid(int $uid): string
    {
        return 'A' . str_pad((string)$uid, 5, '0', STR_PAD_LEFT);
    }

    private function formatAmount($amount): string
    {
        return number_format((float)$amount, 2, '.', '');
    }

    private function formatOverdueTime(int $time): string
    {
        return $time > 0 ? date('Y-m-d H:i:s', $time) : '';
    }

    private function modelToArray($value): array
    {
        if (!$value) {
            return [];
        }
        if (is_array($value)) {
            return $value;
        }
        if (method_exists($value, 'toArray')) {
            return $value->toArray();
        }
        return [];
    }

    private function zh(string $escaped): string
    {
        return json_decode('"' . $escaped . '"') ?: '';
    }
}
