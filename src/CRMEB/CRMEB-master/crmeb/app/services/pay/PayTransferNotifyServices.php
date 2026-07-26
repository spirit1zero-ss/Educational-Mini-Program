<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\services\pay;

use app\services\activity\lottery\LuckLotteryRecordServices;
use app\services\statistic\CapitalFlowServices;
use app\services\user\UserExtractServices;
use app\services\user\UserServices;
use think\facade\Db;

class PayTransferNotifyServices
{
    /**
     * 提现
     * @param string|null $order_id 订单id
     * @return bool
     */
    public function wechatTx(string $order_id = null, string $trade_no = null, string $state = null, string $fail_reason = null)
    {
        try {
            $state = strtoupper((string)$state);
            Db::transaction(function () use ($order_id, $trade_no, $state, $fail_reason) {
                $query = Db::name('user_extract');
                if ($trade_no) {
                    $query->where('transfer_bill_no', $trade_no);
                } else {
                    $query->where('out_bill_no', $order_id);
                }
                $userExtractInfo = $query->lock(true)->find();
                if (!$userExtractInfo && $order_id && $trade_no) {
                    $userExtractInfo = Db::name('user_extract')
                        ->where('out_bill_no', $order_id)
                        ->lock(true)
                        ->find();
                }
                if (!$userExtractInfo) {
                    return;
                }

                $currentState = strtoupper((string)($userExtractInfo['state'] ?? ''));
                $terminalFailures = ['FAIL', 'CANCELLED'];
                if ($currentState === $state
                    && ($state === 'SUCCESS' || in_array($state, $terminalFailures, true))) {
                    return;
                }

                $infoData = ['state' => $state];
                if ($trade_no) {
                    $infoData['transfer_bill_no'] = $trade_no;
                }
                if ($fail_reason) {
                    $infoData['fail_reason'] = $fail_reason;
                }
                Db::name('user_extract')->where('id', $userExtractInfo['id'])->update($infoData);

                if ($state === 'SUCCESS') {
                    /** @var UserServices $userService */
                    $userService = app()->make(UserServices::class);
                    $user = $userService->getUserInfo($userExtractInfo['uid']);
                    $extractNumber = bcsub($userExtractInfo['extract_price'], $userExtractInfo['extract_fee'], 2);
                    /** @var CapitalFlowServices $capitalFlowServices */
                    $capitalFlowServices = app()->make(CapitalFlowServices::class);
                    $capitalFlowServices->setFlow([
                        'order_id' => $order_id ?: $userExtractInfo['out_bill_no'],
                        'uid' => $userExtractInfo['uid'],
                        'price' => bcmul('-1', $extractNumber, 2),
                        'pay_type' => $userExtractInfo['extract_type'],
                        'nickname' => $user['nickname'],
                        'phone' => $user['phone']
                    ], 'extract');

                    event('NoticeListener', [['uid' => $userExtractInfo['uid'], 'userType' => strtolower($user['user_type']), 'extractNumber' => $extractNumber, 'nickname' => $user['nickname']], 'user_extract']);

                    //自定义通知-用户提现成功
                    $userExtract = $userExtractInfo;
                    $userExtract['nickname'] = $user['nickname'];
                    $userExtract['phone'] = $user['phone'];
                    $userExtract['time'] = date('Y-m-d H:i:s');
                    $userExtract['price'] = $extractNumber;
                    event('CustomNoticeListener', [$userExtract['uid'], $userExtract, 'extract_success']);

                    //自定义事件-用户提现成功
                    event('CustomEventListener', ['admin_extract_success', [
                        'uid' => $userExtract['uid'],
                        'price' => $extractNumber,
                        'pay_type' => $userExtract['extract_type'],
                        'nickname' => $user['nickname'],
                        'phone' => $user['phone'],
                        'success_time' => date('Y-m-d H:i:s')
                    ]]);
                } elseif (in_array($state, $terminalFailures, true)
                    && (int)$userExtractInfo['status'] !== -1) {
                    /** @var UserExtractServices $userExtractServices */
                    $userExtractServices = app()->make(UserExtractServices::class);
                    $reason = $fail_reason ?: '微信商家转账失败或已取消';
                    $userExtractServices->changeFail(
                        (int)$userExtractInfo['id'],
                        $userExtractInfo,
                        '提现失败，原因：' . $reason
                    );
                }
            });
        } catch (\Throwable $e) {
            return false;
        }
        return true;
    }

    /**
     * 红包
     * @param string|null $order_id 订单id
     * @return bool
     */
    public function wechatHb(string $order_id = null, string $trade_no = null, string $state = null, string $fail_reason = null)
    {
        try {
            $info = app()->make(LuckLotteryRecordServices::class)->getOne(['transfer_bill_no' => $trade_no]);
            if (!$info) {
                return true;
            }
            $info->state = $state;
            if ($fail_reason) {
                $info->fail_reason = $fail_reason;
            }
            $info->save();
        } catch (\Exception $e) {
            return false;
        }
    }
}
