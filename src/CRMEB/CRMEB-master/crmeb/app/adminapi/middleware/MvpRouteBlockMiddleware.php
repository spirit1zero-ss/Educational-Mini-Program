<?php
// +----------------------------------------------------------------------
// | CRMEB
// +----------------------------------------------------------------------

namespace app\adminapi\middleware;

use app\Request;
use crmeb\interfaces\MiddlewareInterface;
use think\facade\Log;

class MvpRouteBlockMiddleware implements MiddlewareInterface
{
    /**
     * Block disabled MVP admin routes while keeping core route files intact.
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

        foreach ($this->patterns('admin_route_allow_patterns') as $pattern) {
            if ($this->matches($path, $pattern)) {
                return false;
            }
        }

        $rules = function_exists('mvp_config') ? mvp_config('admin_route_block_patterns', []) : [];
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
                    Log::info('[MVP] blocked admin route: ' . json_encode([
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

    protected function patterns(string $name): array
    {
        $patterns = function_exists('mvp_config') ? mvp_config($name, []) : [];
        if (!is_array($patterns)) {
            return [];
        }

        return array_values(array_filter(array_map('strval', $patterns)));
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
