<?php

namespace app\adminapi\controller\v1\education;

use app\adminapi\controller\AuthController;
use app\services\education\EducationAssessmentRecordServices;
use think\facade\App;

class AssessmentRecord extends AuthController
{
    protected $services;

    public function __construct(App $app, EducationAssessmentRecordServices $services)
    {
        parent::__construct($app);
        $this->services = $services;
    }

    public function index()
    {
        $where = $this->request->getMore([
            ['uid', ''],
            ['nickname', ''],
            ['mobile', ''],
            ['data', []],
        ]);

        return app('json')->success($this->services->getAdminList($where));
    }

    public function read($id)
    {
        return app('json')->success($this->services->getAdminDetail((int)$id));
    }
}
