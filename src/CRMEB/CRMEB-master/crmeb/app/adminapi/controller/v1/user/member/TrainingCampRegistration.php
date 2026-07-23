<?php

namespace app\adminapi\controller\v1\user\member;

use app\Request;
use app\services\miniapp\TrainingCampRegistrationServices;

class TrainingCampRegistration
{
    protected $services;

    public function __construct(TrainingCampRegistrationServices $services)
    {
        $this->services = $services;
    }

    public function index(Request $request)
    {
        $where = $request->getMore([
            ['keyword', ''],
            ['child_name', ''],
            ['contact_phone', ''],
            ['add_time', ''],
        ]);

        return app('json')->success($this->services->adminList($where));
    }

    public function delete($id)
    {
        $this->services->adminDelete((int)$id);
        return app('json')->success('报名记录已删除');
    }
}
