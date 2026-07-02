<?php

namespace app\initializer;

use think\App;
use think\initializer\Error;

class PhpErrorInitializer extends Error
{
    public function init(App $app)
    {
        $this->app = $app;

        $reporting = E_ALL & ~E_DEPRECATED;

        if (defined('E_USER_DEPRECATED')) {
            $reporting &= ~E_USER_DEPRECATED;
        }

        error_reporting($reporting);
        set_error_handler([$this, 'appError']);
        set_exception_handler([$this, 'appException']);
        register_shutdown_function([$this, 'appShutdown']);
    }
}
