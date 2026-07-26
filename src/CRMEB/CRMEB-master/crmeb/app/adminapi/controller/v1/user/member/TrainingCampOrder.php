<?php

namespace app\adminapi\controller\v1\user\member;

use app\adminapi\controller\AuthController;
use app\Request;
use app\services\miniapp\TrainingCampOrderAdminServices;
use think\facade\App;

class TrainingCampOrder extends AuthController
{
    protected $services;

    public function __construct(App $app, TrainingCampOrderAdminServices $services)
    {
        parent::__construct($app);
        $this->services = $services;
    }

    public function index(Request $request)
    {
        $where = $request->getMore([
            ['keyword', ''],
            ['order_state', ''],
            ['delivery_state', ''],
            ['refund_state', ''],
            ['add_time', ''],
        ]);
        return app('json')->success($this->services->adminList($where));
    }

    public function detail($id)
    {
        return app('json')->success($this->services->detail((int)$id));
    }

    public function sync($id)
    {
        return app('json')->success($this->services->syncFromWechat((int)$id));
    }

    public function retryDelivery($id)
    {
        return app('json')->success($this->services->retryDelivery((int)$id));
    }

    public function registerOfflineRefund(Request $request, $id)
    {
        $data = $request->postMore([
            ['amount', 0],
            ['channel', ''],
            ['reference', ''],
            ['refund_time', ''],
            ['note', ''],
        ]);
        return app('json')->success($this->services->registerOfflineRefund(
            (int)$id,
            $data,
            (int)$this->adminId,
            (string)($this->adminInfo['real_name'] ?? $this->adminInfo['account'] ?? '')
        ));
    }

    public function reviewRefund(Request $request, $id)
    {
        [$decision, $note] = $request->postMore([
            ['decision', ''],
            ['note', ''],
        ], true);
        return app('json')->success($this->services->reviewRefund(
            (int)$id,
            (string)$decision,
            (string)$note,
            (int)$this->adminId,
            (string)($this->adminInfo['real_name'] ?? $this->adminInfo['account'] ?? '')
        ));
    }
}
