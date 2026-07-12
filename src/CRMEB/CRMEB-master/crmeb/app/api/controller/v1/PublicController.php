<?php

namespace app\api\controller\v1;

/**
 * Public endpoints retained by the educational mini-program.
 */
class PublicController
{
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
}
