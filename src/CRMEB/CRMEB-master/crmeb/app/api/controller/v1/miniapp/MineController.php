<?php

namespace app\api\controller\v1\miniapp;

use app\Request;
use app\services\miniapp\MiniappServices;
use app\services\miniapp\TrainingCampRegistrationServices;

class MineController
{
    protected $services;

    public function __construct(MiniappServices $services)
    {
        $this->services = $services;
    }

    public function overview(Request $request)
    {
        return app('json')->success($this->services->getMineOverview((int)$request->uid()));
    }

    public function poster(Request $request)
    {
        [$page] = $request->postMore([
            ['page', 'pages/home/home'],
        ], true);

        return app('json')->success($this->services->createReferralPoster((int)$request->uid(), $page));
    }

    public function redeemCode(Request $request)
    {
        [$code] = $request->postMore([
            ['code', ''],
        ], true);

        return app('json')->success($this->services->useRedeemCode((int)$request->uid(), $code));
    }

    public function memberPlans(Request $request)
    {
        return app('json')->success($this->services->getMemberPlans());
    }

    public function createMemberOrder(Request $request)
    {
        [$mcId, $payType] = $request->postMore([
            ['mcId', 0],
            ['payType', 'virtual'],
        ], true);

        return app('json')->success($this->services->createTrainingCampMemberOrder((int)$request->uid(), (int)$mcId, $payType));
    }

    public function payMemberOrder(Request $request)
    {
        [$orderId, $payType, $code] = $request->postMore([
            ['orderId', ''],
            ['payType', 'virtual'],
            ['code', ''],
        ], true);

        return app('json')->success($this->services->payTrainingCampMemberOrder((int)$request->uid(), $orderId, $payType, $code));
    }

    public function confirmMemberOrder(Request $request)
    {
        [$orderId, $outTradeNo] = $request->postMore([
            ['orderId', ''],
            ['outTradeNo', ''],
        ], true);

        return app('json')->success($this->services->confirmTrainingCampMemberOrder(
            (int)$request->uid(),
            $orderId,
            $outTradeNo
        ));
    }

    public function cancelMemberOrder(Request $request)
    {
        [$orderId] = $request->postMore([
            ['orderId', ''],
        ], true);

        return app('json')->success('订单已取消', $this->services->cancelTrainingCampMemberOrder((int)$request->uid(), $orderId));
    }

    public function invites(Request $request)
    {
        [$grade, $sort, $keyword] = $request->getMore([
            ['grade', 0],
            ['sort', ''],
            ['keyword', ''],
        ], true);

        return app('json')->success($this->services->getInviteRecords((int)$request->uid(), (int)$grade, $sort, $keyword));
    }

    public function income(Request $request)
    {
        [$type] = $request->getMore([
            ['type', 3],
        ], true);

        return app('json')->success($this->services->getIncomeRecords((int)$request->uid(), (int)$type));
    }

    public function withdrawal(Request $request)
    {
        return app('json')->success($this->services->getWithdrawalOverview((int)$request->uid()));
    }

    public function applyWithdrawal(Request $request)
    {
        [$amount] = $request->postMore([['amount', '0']], true);
        return app('json')->success('提现申请已提交', $this->services->applyWithdrawal((int)$request->uid(), $amount));
    }

    public function orders(Request $request)
    {
        return app('json')->success($this->services->getTrainingCampOrders((int)$request->uid()));
    }

    public function registration(Request $request, TrainingCampRegistrationServices $services)
    {
        return app('json')->success($services->getForMiniapp((int)$request->uid()));
    }

    public function saveRegistration(Request $request, TrainingCampRegistrationServices $services)
    {
        $data = $request->postMore([
            ['child_name', ''],
            ['child_age', 0],
            ['child_gender', ''],
            ['problems', []],
            ['other_problem', ''],
            ['contact_phone', ''],
        ]);

        return app('json')->success('登记信息已保存', $services->saveForMiniapp((int)$request->uid(), $data));
    }
}
