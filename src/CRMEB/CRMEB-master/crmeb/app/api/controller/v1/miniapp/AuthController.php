<?php

namespace app\api\controller\v1\miniapp;

use app\Request;
use app\services\miniapp\MiniappServices;

class AuthController
{
    protected $services;

    public function __construct(MiniappServices $services)
    {
        $this->services = $services;
    }

    public function login(Request $request)
    {
        [$code, $referrerUid] = $request->postMore([
            ['code', ''],
            ['referrerUid', ''],
        ], true);

        return app('json')->success($this->services->login($code, $referrerUid));
    }
}
