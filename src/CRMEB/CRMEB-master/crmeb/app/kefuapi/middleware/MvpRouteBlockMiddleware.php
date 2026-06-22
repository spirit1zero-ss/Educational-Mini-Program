<?php
// +----------------------------------------------------------------------
// | CRMEB
// +----------------------------------------------------------------------

namespace app\kefuapi\middleware;

use app\Request;
use crmeb\interfaces\MiddlewareInterface;
use think\facade\Log;

class MvpRouteBlockMiddleware implements MiddlewareInterface
{
    /**
     * Block disabled MVP customer-service routes while keeping CRMEB routes intact.
     *
     * @param Request $request
     * @param \Closure $next
     * @return mixed
     */
    public function handle(Request $request, \Closure $next)
    {
        if ($this->isBlocked($request)) {
            return app('json')->fail('MVP module disabled');
        }

        return $next($request);
    }

    protected function isBlocked(Request $request): bool
    {
        $path = $this->normalizePath($request->pathinfo());
        $rules = function_exists('mvp_config') ? mvp_config('kefuapi_route_block_patterns', []) : [];

        if (!is_array($rules)) {
            return false;
        }

        foreach ($rules as $switch => $items) {
            $enabled = function_exists('mvp_enabled') ? mvp_enabled((string)$switch, false) : false;
            if ($enabled || !is_array($items)) {
                continue;
            }

            foreach ($items as $pattern) {
                if ($this->matches($path, (string)$pattern)) {
                    Log::info('[MVP] blocked kefuapi route: ' . json_encode([
                        'path' => $path,
                        'switch' => $switch,
                        'pattern' => (string)$pattern,
                    ]));
                    return true;
                }
            }
        }

        return false;
    }

    protected function normalizePath(string $path): string
    {
        return trim(strtolower(str_replace('\\', '/', $path)), '/');
    }

    protected function matches(string $path, string $pattern): bool
    {
        $pattern = $this->normalizePath($pattern);
        if ($pattern === '') {
            return false;
        }

        if (substr($pattern, -1) === '$') {
            $exact = rtrim($pattern, '$');
            return $path === $exact || substr($path, -strlen('/' . $exact)) === '/' . $exact;
        }

        return strpos($path, $pattern) !== false;
    }
}
