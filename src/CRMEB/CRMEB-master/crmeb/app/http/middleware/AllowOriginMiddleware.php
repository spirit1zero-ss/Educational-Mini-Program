<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

namespace app\http\middleware;


use app\Request;
use crmeb\interfaces\MiddlewareInterface;
use think\facade\Config;
use think\Response;

/**
 * 跨域中间件
 * Class AllowOriginMiddleware
 * @package app\http\middleware
 */
class AllowOriginMiddleware implements MiddlewareInterface
{
    /**
     * @param Request $request
     * @param \Closure $next
     * @return Response
     */
    public function handle(Request $request, \Closure $next)
    {
        $header = Config::get('cookie.header', []);
        $origin = trim((string)$request->header('origin', ''));

        if ($origin !== '') {
            if (!$this->isAllowedOrigin($request, $origin)) {
                return Response::create('Forbidden')->code(403);
            }
            $header['Access-Control-Allow-Origin'] = $origin;
            $header['Access-Control-Allow-Credentials'] = 'true';
            $header['Vary'] = 'Origin';
        }
        if ($request->method(true) == 'OPTIONS') {
            $response = Response::create('ok')->code(200)->header($header);
        } else {
            $response = $next($request)->header($header);
        }
//        $request->filter(['strip_tags', 'addslashes', 'trim']);
        return $response;
    }

    /**
     * 浏览器同域请求自动放行，跨域请求只接受环境变量中的完整 Origin。
     */
    protected function isAllowedOrigin(Request $request, string $origin): bool
    {
        $origin = $this->normalizeOrigin($origin);
        if ($origin === '') {
            return false;
        }

        $requestOrigin = $this->normalizeOrigin((string)$request->domain());
        if ($requestOrigin !== '' && $origin === $requestOrigin) {
            return true;
        }

        $allowedOrigins = Config::get('cookie.cors_allowed_origins', []);
        foreach ((array)$allowedOrigins as $allowedOrigin) {
            if ($origin === $this->normalizeOrigin((string)$allowedOrigin)) {
                return true;
            }
        }
        return false;
    }

    protected function normalizeOrigin(string $origin): string
    {
        $parts = parse_url(trim($origin));
        if (!is_array($parts)
            || empty($parts['scheme'])
            || empty($parts['host'])
            || !in_array(strtolower($parts['scheme']), ['http', 'https'], true)) {
            return '';
        }

        $normalized = strtolower($parts['scheme']) . '://' . strtolower($parts['host']);
        if (isset($parts['port'])) {
            $normalized .= ':' . (int)$parts['port'];
        }
        return $normalized;
    }
}
