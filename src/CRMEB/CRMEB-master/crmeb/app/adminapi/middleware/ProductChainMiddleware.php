<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB ]
// +----------------------------------------------------------------------

namespace app\adminapi\middleware;

use app\Request;
use crmeb\interfaces\MiddlewareInterface;

class ProductChainMiddleware implements MiddlewareInterface
{
    public function handle(Request $request, \Closure $next)
    {
        if (!product_chain_enabled()) {
            return app('json')->make(403, 'Product chain is disabled');
        }

        return $next($request);
    }
}
