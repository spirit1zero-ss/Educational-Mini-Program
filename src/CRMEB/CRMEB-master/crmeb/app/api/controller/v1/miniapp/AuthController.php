<?php

namespace app\api\controller\v1\miniapp;

use app\Request;
use app\services\miniapp\MiniappConsentServices;
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

    public function consent(Request $request, MiniappConsentServices $services)
    {
        [$agreementVersion, $privacyContractName] = $request->postMore([
            ['agreementVersion', ''],
            ['privacyContractName', ''],
        ], true);

        return app('json')->success('协议同意记录已保存', $services->recordLoginConsent(
            (int)$request->uid(),
            (string)$agreementVersion,
            (string)$privacyContractName
        ));
    }
}
