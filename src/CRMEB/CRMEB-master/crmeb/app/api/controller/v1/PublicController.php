<?php

namespace app\api\controller\v1;

use app\services\miniapp\OfflineLocationServices;
use app\services\other\AgreementServices;

/**
 * Public endpoints retained by the educational mini-program.
 */
class PublicController
{
    protected $offlineLocationServices;
    protected $agreementServices;

    public function __construct(
        OfflineLocationServices $offlineLocationServices,
        AgreementServices $agreementServices
    )
    {
        $this->offlineLocationServices = $offlineLocationServices;
        $this->agreementServices = $agreementServices;
    }

    /**
     * Lightweight service health check.
     */
    public function index()
    {
        return app('json')->success([
            'service' => 'educational-mini-program',
            'time' => time(),
        ]);
    }

    /**
     * Public filing information used by clients when needed.
     */
    public function getSiteConfig()
    {
        return app('json')->success([
            'record_No' => sys_config('record_No'),
            'icp_url' => sys_config('icp_url'),
            'network_security' => sys_config('network_security'),
            'network_security_url' => sys_config('network_security_url'),
        ]);
    }

    public function offlineLocations()
    {
        return app('json')->success($this->offlineLocationServices->publicList());
    }

    public function miniappAgreements()
    {
        $types = [
            'service' => 1,
            'privacy' => 3,
            'registration' => 9,
        ];
        $agreements = [];
        foreach ($types as $key => $type) {
            $row = $this->agreementServices->getAgreementBytype($type);
            $agreements[$key] = [
                'key' => $key,
                'title' => (string)($row['title'] ?? ''),
                'content' => !empty($row['status']) ? (string)($row['content'] ?? '') : '',
                'configured' => !empty($row['status']) && !empty($row['content']),
            ];
        }

        return app('json')->success($agreements);
    }
}
