<?php

namespace app\services\pay;

use crmeb\exceptions\ApiException;
use think\facade\Cache;
use think\facade\Log;

/**
 * Short-lived distributed lock for payment mutations.
 *
 * Correctness is still enforced by database row locks and unique keys. Redis is
 * the fast first barrier which keeps duplicate taps and concurrent requests from
 * reaching those database constraints at the same time.
 */
class PaymentLockService
{
    private const PREFIX = 'payment_lock:';

    public function run(string $key, callable $callback, int $ttlSeconds = 20, int $waitMilliseconds = 1500)
    {
        $token = bin2hex(random_bytes(16));
        $redis = null;

        try {
            $redis = Cache::store('redis')->handler();
        } catch (\Throwable $exception) {
            Log::warning('payment_lock_redis_unavailable', ['message' => $exception->getMessage()]);
            return $callback();
        }

        $redisKey = self::PREFIX . $key;
        $deadline = microtime(true) + max(0, $waitMilliseconds) / 1000;
        do {
            try {
                if ($redis->set($redisKey, $token, ['NX', 'EX' => max(1, $ttlSeconds)])) {
                    try {
                        return $callback();
                    } finally {
                        $this->release($redis, $redisKey, $token);
                    }
                }
            } catch (\Throwable $exception) {
                Log::warning('payment_lock_redis_failed', ['message' => $exception->getMessage()]);
                return $callback();
            }
            usleep(50000);
        } while (microtime(true) < $deadline);

        throw new ApiException('操作正在处理中，请勿重复提交');
    }

    private function release($redis, string $key, string $token): void
    {
        $script = <<<'LUA'
if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1])
end
return 0
LUA;
        try {
            $redis->eval($script, [$key, $token], 1);
        } catch (\Throwable $exception) {
            Log::warning('payment_lock_release_failed', ['message' => $exception->getMessage()]);
        }
    }
}
