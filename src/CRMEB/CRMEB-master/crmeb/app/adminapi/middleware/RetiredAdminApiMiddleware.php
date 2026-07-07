<?php

namespace app\adminapi\middleware;

use app\Request;
use crmeb\interfaces\MiddlewareInterface;
use think\facade\Config;

class RetiredAdminApiMiddleware implements MiddlewareInterface
{
    public function handle(Request $request, \Closure $next)
    {
        $path = trim(strtolower(str_replace('\\', '/', $request->pathinfo())), '/');

        foreach ($this->patterns() as $pattern) {
            $pattern = trim(strtolower(str_replace('\\', '/', (string)$pattern)), '/');
            if ($pattern !== '' && strpos($path, $pattern) !== false) {
                return app('json')->make(403, 'This admin feature is disabled');
            }
        }

        return $next($request);
    }

    protected function patterns(): array
    {
        try {
            $patterns = Config::get('retired.admin_api_patterns', []);
        } catch (\Throwable $e) {
            $configFile = dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'retired.php';
            $config = is_file($configFile) ? include $configFile : [];
            $patterns = $config['admin_api_patterns'] ?? [];
        }

        return array_values(array_filter(array_unique(array_map('strval', (array)$patterns))));
    }
}
