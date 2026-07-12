<?php

namespace app\adminapi\controller\v1\export;

use app\adminapi\controller\AuthController;
use app\services\agent\AgentManageServices;
use app\services\other\export\ExportServices;
use app\services\user\UserBillServices;
use think\facade\App;

/**
 * Exports retained by the reduced admin surface.
 */
class ExportExcel extends AuthController
{
    protected $service;

    public function __construct(App $app, ExportServices $services)
    {
        parent::__construct($app);
        $this->service = $services;
    }

    public function userList()
    {
        $where = $this->request->getMore([
            ['page', 1], ['limit', 20], ['nickname', ''], ['status', ''],
            ['pay_count', ''], ['is_promoter', ''], ['order', ''], ['data', ''],
            ['user_type', ''], ['country', ''], ['province', ''], ['city', ''],
            ['user_time_type', ''], ['user_time', ''], ['sex', ''],
            [['level', 0], 0], [['group_id', 'd'], 0], ['label_id', ''],
            ['now_money', 'normal'], ['field_key', ''], ['isMember', ''], ['ids', []],
        ]);
        return app('json')->success($this->service->exportUserList($where));
    }

    public function memberCardList($id)
    {
        return app('json')->success($this->service->exportMemberCard($id));
    }

    public function userFinance(UserBillServices $services)
    {
        $where = $this->request->getMore([
            ['start_time', ''], ['end_time', ''], ['nickname', ''], ['type', ''],
        ]);
        $data = $services->getBillList($where, '*', false);
        return app('json')->success($this->service->userFinance($data['data'] ?? []));
    }

    public function userCommission(UserBillServices $services)
    {
        $where = $this->request->getMore([
            ['page', 1], ['limit', 20], ['nickname', ''], ['price_max', ''],
            ['price_min', ''], ['excel', '1'], ['time', ''],
        ]);
        $data = $services->getCommissionList($where, false);
        return app('json')->success($this->service->userCommission($data['list'] ?? []));
    }

    public function userAgent(AgentManageServices $services)
    {
        $where = $this->request->getMore([
            ['nickname', ''], ['data', ''], ['excel', '1'],
        ]);
        $data = $services->agentSystemPage($where, false);
        return app('json')->success($this->service->userAgent($data['list']));
    }
}
