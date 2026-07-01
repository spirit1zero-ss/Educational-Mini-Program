<?php

namespace app\api\controller\v1\miniapp;

use app\Request;
use app\services\miniapp\MiniappServices;

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
            ['payType', 'weixin'],
        ], true);

        return app('json')->success($this->services->createTrainingCampMemberOrder((int)$request->uid(), (int)$mcId, $payType));
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

    public function orders(Request $request)
    {
        return app('json')->success($this->services->getTrainingCampOrders((int)$request->uid()));
    }
}
