<?php

namespace app\adminapi\controller\v1\user\member;

use app\Request;
use app\services\miniapp\OfflineLocationServices;

class OfflineLocation
{
    protected $services;

    public function __construct(OfflineLocationServices $services)
    {
        $this->services = $services;
    }

    public function index(Request $request)
    {
        $where = $request->getMore([
            ['keyword', ''],
            ['is_show', ''],
        ]);
        return app('json')->success($this->services->adminList($where));
    }

    public function save(Request $request, $id = 0)
    {
        $data = $request->postMore([
            ['name', ''],
            ['city', ''],
            ['address', ''],
            ['phone', ''],
            ['business_hours', ''],
            ['service', ''],
            ['status_text', '营业中'],
            ['latitude', 0],
            ['longitude', 0],
            ['sort', 0],
            ['is_show', 1],
        ]);
        return app('json')->success('保存成功', $this->services->save((int)$id, $data));
    }

    public function delete($id)
    {
        $this->services->delete((int)$id);
        return app('json')->success('线下地址已删除');
    }
}
