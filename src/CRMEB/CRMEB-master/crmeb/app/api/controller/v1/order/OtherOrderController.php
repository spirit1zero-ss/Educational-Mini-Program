<?php

namespace app\api\controller\v1\order;

use app\Request;
use app\services\order\OtherOrderServices;
use app\services\pay\OrderPayServices;
use app\services\pay\PayServices;
use app\services\pay\YuePayServices;
use app\services\user\member\MemberCardServices;
use app\services\user\UserServices;

/**
 * Minimal retained controller for paid membership orders.
 */
class OtherOrderController
{
    protected $services;

    public function __construct(OtherOrderServices $services)
    {
        $this->services = $services;
    }

    public function create(Request $request)
    {
        $uid = (int)$request->uid();
        [$payType, $type, $memberType, $price, $money, $quitUrl, $mcId] = $request->postMore([
            ['pay_type', 'weixin'],
            ['type', 0],
            ['member_type', ''],
            ['price', 0.00],
            ['money', 0.00],
            ['quitUrl', ''],
            ['mc_id', 0]
        ], true);

        if (!in_array((int)$type, [1, 2], true)) {
            return app('json')->fail('仅支持会员订单');
        }
        if ($money <= 0.00) {
            return app('json')->fail('支付金额不能为0元');
        }

        $payType = strtolower($payType);
        if ($payType === PayServices::OFFLINE_PAY) {
            return app('json')->fail('不支持线下支付');
        }

        /** @var MemberCardServices $memberCardService */
        $memberCardService = app()->make(MemberCardServices::class);
        if (!$memberCardService->isOpenMemberCard()) {
            return app('json')->fail('付费会员功能暂未开启');
        }

        /** @var UserServices $userServices */
        $userServices = app()->make(UserServices::class);
        $channelType = $userServices->getUserInfo($uid)['user_type'];
        $order = $this->services->createOrder($uid, $channelType, $memberType, $price, $payType, (int)$type, $money, (int)$mcId);
        if ($order === false) {
            return app('json')->fail('支付数据生成失败');
        }

        $order_id = $order['order_id'];
        $orderInfo = $this->services->getOne(['order_id' => $order_id]);
        if (!$orderInfo) {
            return app('json')->fail('支付订单不存在');
        }
        $orderInfo = $orderInfo->toArray();
        $info = compact('order_id');
        $payType = app()->make(OrderPayServices::class)->getPayType($payType);

        if (bcsub((string)$orderInfo['pay_price'], '0', 2) <= 0) {
            return $this->services->zeroYuanPayment($orderInfo)
                ? app('json')->status('success', '支付成功', $info)
                : app('json')->status('pay_error');
        }

        if ($payType === PayServices::YUE_PAY) {
            /** @var YuePayServices $yueServices */
            $yueServices = app()->make(YuePayServices::class);
            $pay = $yueServices->yueOrderPay($orderInfo, $uid);
            if ($pay['status'] === true) {
                return app('json')->status('success', '余额支付成功', $info);
            }
            return is_array($pay)
                ? app('json')->status($pay['status'], $pay['msg'], $info)
                : app('json')->status('pay_error', $pay);
        }

        $payInfo = app()->make(OrderPayServices::class)->beforePay($order->toArray(), $payType, ['quitUrl' => $quitUrl]);
        return app('json')->status($payInfo['status'], $payInfo['payInfo']);
    }
}
