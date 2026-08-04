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

        if ($request->isPost() && $this->isAllowedPath($path)) {
            return $next($request);
        }

        foreach ($this->patterns() as $pattern) {
            $pattern = trim(strtolower(str_replace('\\', '/', (string)$pattern)), '/');
            if ($pattern !== '' && strpos($path, $pattern) !== false) {
                return app('json')->make(403, 'This admin feature is disabled');
            }
        }

        return $next($request);
    }

    protected function isAllowedPath(string $path): bool
    {
        foreach ($this->configValues('admin_api_allow_paths') as $allowedPath) {
            $allowedPath = trim(strtolower(str_replace('\\', '/', $allowedPath)), '/');
            if ($allowedPath === '') {
                continue;
            }
            if ($path === $allowedPath || substr($path, -strlen('/' . $allowedPath)) === '/' . $allowedPath) {
                return true;
            }
        }
        return false;
    }

    protected function patterns(): array
    {
        return $this->configValues('admin_api_patterns');
    }

    protected function configValues(string $key): array
    {
        try {
            $values = Config::get('retired.' . $key, []);
        } catch (\Throwable $e) {
            $configFile = dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'retired.php';
            $config = is_file($configFile) ? include $configFile : [];
            $values = $config[$key] ?? [];
        }

        return array_values(array_filter(array_unique(array_map('strval', (array)$values))));
    }
}
