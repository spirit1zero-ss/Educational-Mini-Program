<?php

namespace app\services\pay;

use app\services\order\OtherOrderServices;
use app\services\wechat\WechatUserServices;
use crmeb\exceptions\ApiException;
use crmeb\services\app\MiniProgramService;
use think\facade\Db;
use think\facade\Log;

/**
 * WeChat Mini Program virtual payment (XPay) for the training-camp membership.
 *
 * Redis serializes duplicate requests, unique database keys prevent a second
 * active attempt, and the locked local order makes entitlement delivery
 * idempotent. WeChat's queried order status is the payment source of truth.
 */
class VirtualPaymentServices
{
    private const MODE_ONE_TIME_ENTITLEMENT = 'short_series_goods';
    private const CURRENCY_CNY = 'CNY';
    private const ATTEMPT_TABLE = 'miniapp_virtual_payment_attempt';
    private const CAMP_ORDER_TABLE = 'miniapp_training_camp_order';
    private const QUERY_ORDER_URI = '/xpay/query_order';
    private const NOTIFY_ENTITLEMENT_URI = '/xpay/notify_provide_goods';
    private const API_ORIGIN = 'https://api.weixin.qq.com';
    private const PAID_STATUSES = [2, 3, 4];
    private const TERMINAL_STATUSES = [5, 6, 7, 8];

    public function prepareTrainingCampPayment(int $uid, array $order, string $loginCode): array
    {
        $config = $this->requireConfig();
        if ($loginCode === '') {
            throw new ApiException('缺少支付登录凭证，请重新发起支付');
        }

        $session = MiniProgramService::getUserInfo($loginCode);
        $openid = (string)($session['openid'] ?? '');
        $sessionKey = (string)($session['session_key'] ?? '');
        if ($openid === '' || $sessionKey === '') {
            throw new ApiException('获取微信支付登录态失败，请重新发起支付');
        }

        /** @var WechatUserServices $wechatUserServices */
        $wechatUserServices = app()->make(WechatUserServices::class);
        $expectedOpenid = (string)$wechatUserServices->uidToOpenid($uid, 'routine');
        if ($expectedOpenid === '' || !hash_equals($expectedOpenid, $openid)) {
            throw new ApiException('当前微信账号与订单账号不一致');
        }

        $orderId = (string)($order['order_id'] ?? '');
        if ($orderId === '') {
            throw new ApiException('支付订单不存在');
        }

        /** @var PaymentLockService $lock */
        $lock = app()->make(PaymentLockService::class);
        return $lock->run('camp:order:' . $orderId, function () use ($uid, $orderId, $openid, $sessionKey, $config) {
            $freshOrder = $this->requireCampOrder($uid, $orderId);
            if ((int)$freshOrder['paid'] === 1) {
                return [
                    'provider' => 'wechat_xpay',
                    'alreadyConfirmed' => true,
                    'orderId' => $orderId,
                ];
            }
            if ((int)$freshOrder['is_del'] === 1) {
                throw new ApiException('订单已关闭');
            }

            $amount = $this->amountToFen($freshOrder['pay_price'] ?? 0);
            if ($amount <= 0) {
                throw new ApiException('支付订单金额异常');
            }
            if ((int)($freshOrder['camp_price_fen'] ?? 0) > 0 && (int)$freshOrder['camp_price_fen'] !== $amount) {
                throw new ApiException('订单价格与创建快照不一致，请联系客服');
            }
            if ((string)($freshOrder['camp_product_id'] ?? '') !== '' &&
                !hash_equals((string)$freshOrder['camp_product_id'], (string)$config['product_id'])) {
                throw new ApiException('训练营商品配置已变化，请关闭旧订单后重新报名');
            }

            $attempt = $this->activeAttempt($uid, $orderId);
            if ($attempt) {
                $status = (int)$attempt['wx_status'];
                if ($status === 1 || in_array($status, self::PAID_STATUSES, true)) {
                    $remote = $this->queryOrder($attempt);
                    $status = (int)($remote['status'] ?? 0);
                    $this->updateAttemptFromRemote($attempt, $remote);
                    if (in_array($status, self::PAID_STATUSES, true)) {
                        $result = $this->confirmVerifiedPayment($freshOrder, $attempt, $remote);
                        return [
                            'provider' => 'wechat_xpay',
                            'alreadyConfirmed' => true,
                            'orderId' => $orderId,
                            'confirmation' => $result,
                        ];
                    }
                    if ($status === 1) {
                        throw new ApiException('该订单支付正在处理中，请稍后查看订单状态');
                    }
                }

                if (in_array($status, self::TERMINAL_STATUSES, true)) {
                    $this->releaseActiveAttempt($attempt, $status);
                    $attempt = null;
                }
            }

            if (!$attempt) {
                $attempt = $this->createAttempt(
                    $uid,
                    $orderId,
                    $openid,
                    $config['env'],
                    $config['product_id'],
                    $amount
                );
            } elseif ((int)$attempt['amount'] !== $amount || !hash_equals((string)$attempt['openid'], $openid)) {
                throw new ApiException('当前支付尝试与订单信息不一致，请稍后重试');
            }

            Db::name('other_order')->where('id', (int)$freshOrder['id'])->update([
                'pay_type' => PayServices::VIRTUAL_PAY,
            ]);
            Db::name(self::CAMP_ORDER_TABLE)->where('order_id', $orderId)->update([
                'order_state' => 'paying',
                'active_attempt_id' => (int)$attempt['id'],
                'update_time' => time(),
            ]);

            return $this->buildClientPayment($attempt, $sessionKey, $config);
        }, 20, 1500);
    }

    public function confirmTrainingCampPayment(int $uid, array $order, string $outTradeNo): array
    {
        $orderId = (string)($order['order_id'] ?? '');
        /** @var PaymentLockService $lock */
        $lock = app()->make(PaymentLockService::class);
        return $lock->run('camp:order:' . $orderId, function () use ($uid, $orderId, $outTradeNo) {
            $freshOrder = $this->requireCampOrder($uid, $orderId);
            $attempt = $this->requireAttempt($uid, $orderId, $outTradeNo);
            $remote = $this->queryOrder($attempt);
            $this->updateAttemptFromRemote($attempt, $remote);
            return $this->confirmVerifiedPayment($freshOrder, $attempt, $remote);
        }, 30, 2000);
    }

    /**
     * Query WeChat before an unpaid order is cancelled or timed out.
     * A network/query failure deliberately blocks closing: losing a paid order is
     * worse than asking the user to retry cancellation.
     */
    public function assertTrainingCampOrderClosable(int $uid, array $order): void
    {
        $orderId = (string)($order['order_id'] ?? '');
        /** @var PaymentLockService $lock */
        $lock = app()->make(PaymentLockService::class);
        $lock->run('camp:order:' . $orderId, function () use ($uid, $orderId) {
            $freshOrder = $this->requireCampOrder($uid, $orderId);
            if ((int)$freshOrder['paid'] === 1) {
                throw new ApiException('订单已支付，不能关闭');
            }

            $attempt = $this->activeAttempt($uid, $orderId);
            if (!$attempt) {
                return;
            }

            $remote = $this->queryOrder($attempt);
            $status = (int)($remote['status'] ?? 0);
            $this->updateAttemptFromRemote($attempt, $remote);
            if (in_array($status, self::PAID_STATUSES, true)) {
                $this->confirmVerifiedPayment($freshOrder, $attempt, $remote);
                throw new ApiException('微信侧已支付，订单已自动恢复，不能关闭');
            }
            if ($status === 1) {
                throw new ApiException('支付正在处理中，暂时不能关闭订单');
            }

            $this->releaseActiveAttempt($attempt, $status, 'closed');
        }, 25, 1500);
    }

    public function reconcileUserPendingOrders(int $uid): void
    {
        $this->reconcilePendingPayments(8, $uid);
    }

    /** Reconcile paid-but-not-delivered and pending attempts. Safe for a cron job. */
    public function reconcilePendingPayments(int $limit = 50, int $uid = 0): array
    {
        if (!(bool)config('xpay.enabled', false)) {
            return ['checked' => 0, 'confirmed' => 0, 'failed' => 0];
        }

        $query = Db::name(self::ATTEMPT_TABLE)
            ->alias('a')
            ->join(self::CAMP_ORDER_TABLE . ' c', 'c.order_id = a.order_id AND c.uid = a.uid')
            ->join('other_order o', 'o.id = c.other_order_id AND o.uid = c.uid')
            ->where(function ($query) {
                $query->whereIn('a.local_state', ['prepared', 'paying', 'confirmed'])
                    ->whereOr(function ($query) {
                        // We do not auto-revoke entitlements, but still detect a later refund.
                        $query->where('a.local_state', 'delivered')->where('a.update_time', '<=', time() - 21600);
                    });
            })
            ->where(function ($query) {
                $query->where('a.next_retry_at', 0)->whereOr('a.next_retry_at', '<=', time());
            });
        if ($uid > 0) {
            $query->where('a.uid', $uid);
        }
        $attempts = $query->field('a.*,o.id AS local_order_pk,o.paid,o.is_del,o.pay_price,o.member_type,o.type')
            ->order('a.id', 'asc')
            ->limit(max(1, min(200, $limit)))
            ->select()
            ->toArray();

        $result = ['checked' => 0, 'confirmed' => 0, 'failed' => 0];
        foreach ($attempts as $attempt) {
            $result['checked']++;
            try {
                $order = [
                    'id' => (int)$attempt['local_order_pk'],
                    'uid' => (int)$attempt['uid'],
                    'order_id' => (string)$attempt['order_id'],
                    'paid' => (int)$attempt['paid'],
                    'is_del' => (int)$attempt['is_del'],
                    'pay_price' => $attempt['pay_price'],
                    'member_type' => $attempt['member_type'],
                    'type' => $attempt['type'],
                ];
                $confirmation = $this->confirmTrainingCampPayment(
                    (int)$attempt['uid'],
                    $order,
                    (string)$attempt['out_trade_no']
                );
                if (!empty($confirmation['confirmed'])) {
                    $result['confirmed']++;
                }
            } catch (\Throwable $exception) {
                $result['failed']++;
                $this->scheduleRetry($attempt, $exception->getMessage());
            }
        }
        return $result;
    }

    private function confirmVerifiedPayment(array $order, array $attempt, array $remote): array
    {
        $status = (int)($remote['status'] ?? 0);
        $expectedAmount = (int)$attempt['amount'];
        $localAmount = $this->amountToFen($order['pay_price'] ?? 0);
        $remoteAmount = (int)($remote['order_fee'] ?? 0);
        if ($localAmount !== $expectedAmount ||
            ((int)($order['camp_price_fen'] ?? 0) > 0 && (int)$order['camp_price_fen'] !== $expectedAmount)) {
            throw new ApiException('本地订单金额与支付快照不一致，请联系客服');
        }
        if ($remoteAmount > 0 && $remoteAmount !== $expectedAmount) {
            Log::error('xpay_order_amount_mismatch', [
                'order_id' => $order['order_id'],
                'out_trade_no' => $attempt['out_trade_no'],
                'expected' => $expectedAmount,
                'actual' => $remoteAmount,
            ]);
            throw new ApiException('虚拟支付订单金额校验失败，请联系客服');
        }

        if (!in_array($status, self::PAID_STATUSES, true)) {
            return [
                'confirmed' => false,
                'pending' => in_array($status, [0, 1], true),
                'status' => $status,
                'orderId' => $order['order_id'],
                'outTradeNo' => $attempt['out_trade_no'],
            ];
        }

        $activated = $this->activateLocalOrder($order, $attempt);
        $delivered = $status === 4;
        if ($delivered) {
            $this->markDelivered($attempt);
        } else {
            try {
                $this->notifyEntitlementDelivered($attempt, (string)($remote['wx_order_id'] ?? ''));
                $delivered = true;
                $this->markDelivered($attempt);
            } catch (\Throwable $exception) {
                $this->markDeliveryFailed($attempt, $exception->getMessage());
                Log::warning('xpay_notify_entitlement_failed', [
                    'order_id' => $order['order_id'],
                    'out_trade_no' => $attempt['out_trade_no'],
                    'message' => $exception->getMessage(),
                ]);
            }
        }

        return [
            'confirmed' => true,
            'activated' => $activated,
            'delivered' => $delivered,
            'status' => $status,
            'orderId' => $order['order_id'],
            'outTradeNo' => $attempt['out_trade_no'],
        ];
    }

    private function activateLocalOrder(array $order, array $attempt): bool
    {
        return (bool)Db::transaction(function () use ($order, $attempt) {
            $campOrder = Db::name(self::CAMP_ORDER_TABLE)
                ->where('order_id', (string)$order['order_id'])
                ->lock(true)
                ->find();
            $locked = Db::name('other_order')->where('id', (int)$order['id'])->lock(true)->find();
            if (!$campOrder || !$locked) {
                throw new ApiException('本地训练营订单不存在');
            }
            if ((int)$locked['paid'] === 1) {
                Db::name(self::CAMP_ORDER_TABLE)->where('id', (int)$campOrder['id'])->update([
                    'order_state' => 'paid',
                    'active_uid_key' => null,
                    'entitlement_state' => 'granted',
                    'update_time' => time(),
                ]);
                return false;
            }

            /** @var OtherOrderServices $otherOrderServices */
            $otherOrderServices = app()->make(OtherOrderServices::class);
            if (!$otherOrderServices->paySuccess($locked, PayServices::VIRTUAL_PAY)) {
                throw new ApiException('支付成功，但会员权益发放失败，请联系客服');
            }
            Db::name(self::CAMP_ORDER_TABLE)->where('id', (int)$campOrder['id'])->update([
                'order_state' => 'paid',
                'active_uid_key' => null,
                'entitlement_state' => 'granted',
                'active_attempt_id' => (int)$attempt['id'],
                'last_error' => '',
                'update_time' => time(),
            ]);
            return true;
        });
    }

    private function buildClientPayment(array $attempt, string $sessionKey, array $config): array
    {
        $attach = $this->encodeJson([
            'orderId' => (string)$attempt['order_id'],
            'outTradeNo' => (string)$attempt['out_trade_no'],
        ]);
        $signData = $this->encodeJson([
            'offerId' => $config['offer_id'],
            'buyQuantity' => 1,
            'env' => $config['env'],
            'currencyType' => self::CURRENCY_CNY,
            'productId' => $config['product_id'],
            'goodsPrice' => (int)$attempt['amount'],
            'outTradeNo' => (string)$attempt['out_trade_no'],
            'attach' => $attach,
        ]);

        return [
            'provider' => 'wechat_xpay',
            'mode' => self::MODE_ONE_TIME_ENTITLEMENT,
            'signData' => $signData,
            'paySig' => $this->paySignature('requestVirtualPayment', $signData, $config['app_key']),
            'signature' => hash_hmac('sha256', $signData, $sessionKey),
            'outTradeNo' => (string)$attempt['out_trade_no'],
            'orderId' => (string)$attempt['order_id'],
            'environment' => $config['env'] === 1 ? 'sandbox' : 'production',
        ];
    }

    private function requireCampOrder(int $uid, string $orderId): array
    {
        $order = Db::name('other_order')->alias('o')
            ->join(self::CAMP_ORDER_TABLE . ' c', 'c.other_order_id = o.id AND c.order_id = o.order_id')
            ->where('c.uid', $uid)
            ->where('c.order_id', $orderId)
            ->field('o.*,c.price_fen AS camp_price_fen,c.product_id AS camp_product_id,c.order_state AS camp_order_state')
            ->find();
        if (!$order) {
            throw new ApiException('训练营订单不存在，请确认已执行支付数据库升级');
        }
        return $order;
    }

    private function activeAttempt(int $uid, string $orderId): ?array
    {
        $attempt = Db::name(self::ATTEMPT_TABLE)
            ->where('uid', $uid)
            ->where('order_id', $orderId)
            ->where('active_order_key', $orderId)
            ->order('id', 'desc')
            ->find();
        return $attempt ?: null;
    }

    private function requireAttempt(int $uid, string $orderId, string $outTradeNo): array
    {
        if ($outTradeNo === '') {
            throw new ApiException('缺少虚拟支付单号');
        }
        $attempt = Db::name(self::ATTEMPT_TABLE)
            ->where('uid', $uid)
            ->where('order_id', $orderId)
            ->where('out_trade_no', $outTradeNo)
            ->find();
        if (!$attempt) {
            throw new ApiException('虚拟支付记录不存在');
        }
        return $attempt;
    }

    private function createAttempt(int $uid, string $orderId, string $openid, int $environment, string $productId, int $amount): array
    {
        for ($number = 0; $number < 3; $number++) {
            $outTradeNo = 'VP' . date('ymdHis') . strtoupper(bin2hex(random_bytes(6)));
            try {
                $id = Db::name(self::ATTEMPT_TABLE)->insertGetId([
                    'uid' => $uid,
                    'order_id' => $orderId,
                    'out_trade_no' => $outTradeNo,
                    'active_order_key' => $orderId,
                    'openid' => $openid,
                    'environment' => $environment,
                    'product_id' => $productId,
                    'amount' => $amount,
                    'wx_status' => 0,
                    'local_state' => 'prepared',
                    'add_time' => time(),
                    'update_time' => time(),
                ]);
                return Db::name(self::ATTEMPT_TABLE)->where('id', $id)->find();
            } catch (\Throwable $exception) {
                $existing = $this->activeAttempt($uid, $orderId);
                if ($existing) {
                    return $existing;
                }
                if ($number === 2) {
                    Log::error('xpay_attempt_create_failed', ['message' => $exception->getMessage()]);
                    throw new ApiException('虚拟支付记录创建失败，请确认已执行数据库升级');
                }
            }
        }
        throw new ApiException('虚拟支付单号生成失败');
    }

    private function queryOrder(array $attempt): array
    {
        $body = $this->encodeJson([
            'openid' => (string)$attempt['openid'],
            'env' => (int)$attempt['environment'],
            'order_id' => (string)$attempt['out_trade_no'],
        ]);
        $appKey = $this->appKeyForEnvironment((int)$attempt['environment']);
        $paySig = $this->paySignature(self::QUERY_ORDER_URI, $body, $appKey);
        $response = $this->callXPay(self::QUERY_ORDER_URI, $body, ['pay_sig' => $paySig]);
        if (!isset($response['order']) || !is_array($response['order'])) {
            throw new ApiException('微信虚拟支付订单查询结果异常');
        }
        return $response['order'];
    }

    private function updateAttemptFromRemote(array $attempt, array $remote): void
    {
        $status = (int)($remote['status'] ?? 0);
        $state = 'paying';
        if (in_array($status, [2, 3], true)) $state = 'confirmed';
        if ($status === 4) $state = 'delivered';
        if ($status === 6) $state = 'closed';
        if (in_array($status, [5, 8], true)) $state = 'refunded';
        if ($status === 7) $state = 'failed';

        $data = [
            'wx_status' => $status,
            'local_state' => $state,
            'wx_order_id' => (string)($remote['wx_order_id'] ?? ''),
            'transaction_id' => (string)($remote['wxpay_order_id'] ?? ''),
            'confirmed_at' => in_array($status, self::PAID_STATUSES, true) ? time() : (int)($attempt['confirmed_at'] ?? 0),
            'update_time' => time(),
        ];
        if (in_array($status, self::TERMINAL_STATUSES, true)) {
            $data['active_order_key'] = null;
        }
        if (in_array($status, [5, 8], true)) {
            $data['refunded_at'] = time();
        }
        Db::name(self::ATTEMPT_TABLE)->where('id', (int)$attempt['id'])->update($data);

        if (in_array($status, [5, 8], true)) {
            $camp = Db::name(self::CAMP_ORDER_TABLE)->where('order_id', (string)$attempt['order_id'])->find();
            $currentEntitlement = (string)($camp['entitlement_state'] ?? 'not_granted');
            if ($currentEntitlement === 'granted') {
                $nextEntitlement = 'review';
            } elseif (in_array($currentEntitlement, ['review', 'revoked', 'retained'], true)) {
                $nextEntitlement = $currentEntitlement;
            } else {
                $nextEntitlement = 'not_granted';
            }
            Db::name(self::CAMP_ORDER_TABLE)->where('order_id', (string)$attempt['order_id'])->update([
                'order_state' => 'refunded',
                'active_uid_key' => null,
                'refund_state' => 'refunded',
                'entitlement_state' => $nextEntitlement,
                'last_error' => $nextEntitlement === 'review' ? '检测到微信退款，请人工复核会员权益。' : (string)($camp['last_error'] ?? ''),
                'update_time' => time(),
            ]);
        }
    }

    private function notifyEntitlementDelivered(array $attempt, string $wxOrderId): void
    {
        $payload = ['env' => (int)$attempt['environment']];
        if ($wxOrderId !== '') {
            $payload['wx_order_id'] = $wxOrderId;
        } else {
            $payload['order_id'] = (string)$attempt['out_trade_no'];
        }
        $this->callXPay(self::NOTIFY_ENTITLEMENT_URI, $this->encodeJson($payload));
    }

    private function markDelivered(array $attempt): void
    {
        Db::transaction(function () use ($attempt) {
            Db::name(self::ATTEMPT_TABLE)->where('id', (int)$attempt['id'])->update([
                'wx_status' => 4,
                'local_state' => 'delivered',
                'active_order_key' => null,
                'delivered_at' => time(),
                'last_error' => '',
                'next_retry_at' => 0,
                'update_time' => time(),
            ]);
            Db::name(self::CAMP_ORDER_TABLE)->where('order_id', (string)$attempt['order_id'])->update([
                'order_state' => 'paid',
                'delivery_state' => 'delivered',
                'last_error' => '',
                'update_time' => time(),
            ]);
        });
    }

    private function markDeliveryFailed(array $attempt, string $message): void
    {
        $retry = (int)($attempt['delivery_retry_count'] ?? 0) + 1;
        $next = time() + min(3600, 30 * (2 ** min(6, $retry - 1)));
        Db::name(self::ATTEMPT_TABLE)->where('id', (int)$attempt['id'])->update([
            'local_state' => 'confirmed',
            'delivery_retry_count' => $retry,
            'next_retry_at' => $next,
            'last_error' => mb_substr($message, 0, 500),
            'update_time' => time(),
        ]);
        Db::name(self::CAMP_ORDER_TABLE)->where('order_id', (string)$attempt['order_id'])->update([
            'delivery_state' => 'failed',
            'last_error' => mb_substr($message, 0, 500),
            'update_time' => time(),
        ]);
    }

    private function releaseActiveAttempt(array $attempt, int $status, string $state = ''): void
    {
        $state = $state ?: ($status === 6 ? 'closed' : (in_array($status, [5, 8], true) ? 'refunded' : 'failed'));
        Db::name(self::ATTEMPT_TABLE)->where('id', (int)$attempt['id'])->update([
            'active_order_key' => null,
            'local_state' => $state,
            'wx_status' => $status,
            'update_time' => time(),
        ]);
        Db::name(self::CAMP_ORDER_TABLE)->where('order_id', (string)$attempt['order_id'])->update([
            'active_attempt_id' => null,
            'update_time' => time(),
        ]);
    }

    private function scheduleRetry(array $attempt, string $message): void
    {
        $retry = (int)($attempt['retry_count'] ?? 0) + 1;
        Db::name(self::ATTEMPT_TABLE)->where('id', (int)$attempt['id'])->update([
            'retry_count' => $retry,
            'next_retry_at' => time() + min(3600, 30 * (2 ** min(6, $retry - 1))),
            'last_error' => mb_substr($message, 0, 500),
            'update_time' => time(),
        ]);
    }

    private function callXPay(string $uri, string $body, array $query = [], bool $retryToken = true): array
    {
        $accessToken = MiniProgramService::miniprogram()->access_token->getToken(!$retryToken);
        $url = self::API_ORIGIN . $uri . '?' . http_build_query(array_merge(['access_token' => $accessToken], $query));
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 12,
        ]);
        $raw = curl_exec($curl);
        $error = curl_error($curl);
        $statusCode = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        if ($raw === false || $error !== '' || $statusCode !== 200) {
            throw new ApiException('微信虚拟支付服务暂不可用，请稍后重试');
        }
        $response = json_decode($raw, true);
        if (!is_array($response)) {
            throw new ApiException('微信虚拟支付响应解析失败');
        }
        $errorCode = (int)($response['errcode'] ?? 0);
        if ($retryToken && in_array($errorCode, [40001, 40014, 42001], true)) {
            return $this->callXPay($uri, $body, $query, false);
        }
        if ($errorCode !== 0) {
            Log::warning('xpay_api_error', ['uri' => $uri, 'errcode' => $errorCode, 'errmsg' => $response['errmsg'] ?? '']);
            throw new ApiException('微信虚拟支付处理失败：' . ($response['errmsg'] ?? (string)$errorCode));
        }
        return $response;
    }

    private function requireConfig(): array
    {
        if (!(bool)config('xpay.enabled', false)) {
            throw new ApiException('小程序虚拟支付尚未启用');
        }
        $environment = (int)config('xpay.env', 1);
        if (!in_array($environment, [0, 1], true)) {
            throw new ApiException('虚拟支付环境配置错误');
        }
        $offerId = trim((string)config('xpay.offer_id', ''));
        $productId = trim((string)config('xpay.training_camp_product_id', ''));
        $appKey = $this->appKeyForEnvironment($environment);
        if ($offerId === '' || $productId === '' || $appKey === '') {
            throw new ApiException('虚拟支付 OfferId、AppKey 或训练营会员权益商品 ID 未配置');
        }
        foreach ([$offerId, $productId, $appKey] as $value) {
            if (stripos($value, 'replace-with-') !== false) {
                throw new ApiException('虚拟支付仍在使用示例配置，禁止发起真实支付');
            }
        }
        return ['env' => $environment, 'offer_id' => $offerId, 'product_id' => $productId, 'app_key' => $appKey];
    }

    private function appKeyForEnvironment(int $environment): string
    {
        return trim((string)config('xpay.app_keys.' . $environment, ''));
    }

    private function paySignature(string $uri, string $signData, string $appKey): string
    {
        return hash_hmac('sha256', $uri . '&' . $signData, $appKey);
    }

    private function amountToFen($amount): int
    {
        return (int)round((float)$amount * 100);
    }

    private function encodeJson(array $payload): string
    {
        $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json === false) {
            throw new ApiException('虚拟支付参数编码失败');
        }
        return $json;
    }
}
