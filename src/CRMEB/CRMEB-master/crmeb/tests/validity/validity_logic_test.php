<?php
/**
 * 商品有效期逻辑 行为 + 安全 测试（独立运行，无框架依赖）
 *
 * 本文件复刻了 StoreProductServices 中以下方法的核心逻辑，用于在不启动整套框架的
 * 情况下验证行为与安全约束：
 *   - normalizeValidity()      保存时归一化/校验
 *   - isProductExpired()       过期判断
 *   - getValidityName()        类型名称解析
 *   - attachValidityInfo()     输出注入
 *
 * 运行：php validity_logic_test.php
 * 任一断言失败将以非 0 退出码结束。
 */

final class ValidityLogic
{
    public $validityTypeNames = ['长期有效商品', '有限期商品'];

    /** 复刻 normalizeValidity；校验失败抛 \InvalidArgumentException（对应业务里的 AdminException） */
    public function normalizeValidity(array &$data): void
    {
        $validityType = (int)($data['validity_type'] ?? 0);
        if (!in_array($validityType, [0, 1], true)) {
            throw new \InvalidArgumentException('商品有效期类型有误');
        }
        $validityName = trim((string)($data['validity_name'] ?? ''));
        $validityName = str_replace(['<', '>'], '', strip_tags($validityName));
        if (mb_strlen($validityName) > 64) {
            throw new \InvalidArgumentException('商品类型名称不能超过64个字符');
        }
        if ($validityType === 0) {
            $data['validity_type'] = 0;
            $data['validity_name'] = $validityName;
            $data['expire_mode'] = 0;
            $data['valid_end_time'] = 0;
            $data['valid_days'] = 0;
            unset($data['valid_end_date']);
            return;
        }
        $expireMode = (int)($data['expire_mode'] ?? 0);
        if (!in_array($expireMode, [1, 2], true)) {
            throw new \InvalidArgumentException('请选择有限期商品的失效方式');
        }
        $validEndTime = 0;
        $validDays = 0;
        if ($expireMode === 1) {
            if (isset($data['valid_end_date']) && $data['valid_end_date'] !== '') {
                $validEndTime = is_numeric($data['valid_end_date'])
                    ? (int)$data['valid_end_date']
                    : (int)strtotime((string)$data['valid_end_date']);
            } elseif (!empty($data['valid_end_time'])) {
                $validEndTime = is_numeric($data['valid_end_time'])
                    ? (int)$data['valid_end_time']
                    : (int)strtotime((string)$data['valid_end_time']);
            }
            if ($validEndTime <= 0) {
                throw new \InvalidArgumentException('请配置有效期截止日期');
            }
        } else {
            $validDays = (int)($data['valid_days'] ?? 0);
            if ($validDays <= 0) {
                throw new \InvalidArgumentException('请配置购买后有效天数');
            }
        }
        $data['validity_type'] = 1;
        $data['validity_name'] = $validityName;
        $data['expire_mode'] = $expireMode;
        $data['valid_end_time'] = $validEndTime;
        $data['valid_days'] = $validDays;
        unset($data['valid_end_date']);
    }

    public function getValidityName($info): string
    {
        $name = trim((string)($info['validity_name'] ?? ''));
        if ($name !== '') {
            return $name;
        }
        $type = (int)($info['validity_type'] ?? 0);
        return $this->validityTypeNames[$type] ?? $this->validityTypeNames[0];
    }

    public function isProductExpired($info): bool
    {
        if ((int)($info['validity_type'] ?? 0) !== 1) {
            return false;
        }
        if ((int)($info['expire_mode'] ?? 0) === 1) {
            $end = (int)($info['valid_end_time'] ?? 0);
            return $end > 0 && time() > $end;
        }
        return false;
    }

    public function attachValidityInfo($info): array
    {
        $validityType = (int)($info['validity_type'] ?? 0);
        $expireMode = (int)($info['expire_mode'] ?? 0);
        $validEndTime = (int)($info['valid_end_time'] ?? 0);
        $validDays = (int)($info['valid_days'] ?? 0);
        $isExpired = $this->isProductExpired($info);
        $info['validity_type'] = $validityType;
        $info['validity_name'] = $this->getValidityName($info);
        $info['expire_mode'] = $expireMode;
        $info['valid_end_time'] = $validEndTime;
        $info['valid_end_date'] = $validEndTime > 0 ? date('Y-m-d H:i:s', $validEndTime) : '';
        $info['valid_days'] = $validDays;
        $info['is_expired'] = $isExpired ? 1 : 0;
        return $info;
    }
}

/* ----------------------------- 迷你断言框架 ----------------------------- */
$passed = 0; $failed = 0;
function check($label, $cond) {
    global $passed, $failed;
    if ($cond) { $passed++; echo "  [PASS] $label\n"; }
    else { $failed++; echo "  [FAIL] $label\n"; }
}
function expectThrow($label, callable $fn) {
    global $passed, $failed;
    try { $fn(); $failed++; echo "  [FAIL] $label (未抛出异常)\n"; }
    catch (\Throwable $e) { $passed++; echo "  [PASS] $label (拦截: {$e->getMessage()})\n"; }
}

$v = new ValidityLogic();
$DAY = 86400;
$future = time() + 30 * $DAY;
$past = time() - $DAY;

echo "== 行为测试 ==\n";

$d = ['validity_type' => 0];
$v->normalizeValidity($d);
check('长期有效商品归一化', $d['validity_type'] === 0 && $d['expire_mode'] === 0 && $d['valid_end_time'] === 0 && $d['valid_days'] === 0);

$d = ['validity_type' => 0, 'validity_name' => '  终身课程  '];
$v->normalizeValidity($d);
check('自定义名称去空格保留', $d['validity_name'] === '终身课程');
check('自定义名称优先于默认', $v->getValidityName($d) === '终身课程');
$d2 = ['validity_type' => 0, 'validity_name' => ''];
check('空名回退默认(长期)', $v->getValidityName($d2) === '长期有效商品');
check('空名回退默认(有限)', $v->getValidityName(['validity_type' => 1]) === '有限期商品');

$d = ['validity_type' => 1, 'expire_mode' => 1, 'valid_end_date' => date('Y-m-d H:i:s', $future)];
$v->normalizeValidity($d);
check('固定到期日字符串转时间戳', $d['valid_end_time'] === $future && $d['expire_mode'] === 1);
check('未来固定到期未过期', $v->isProductExpired($d) === false);

$expired = ['validity_type' => 1, 'expire_mode' => 1, 'valid_end_time' => $past];
check('过去固定到期已过期', $v->isProductExpired($expired) === true);

$d = ['validity_type' => 1, 'expire_mode' => 2, 'valid_days' => 30];
$v->normalizeValidity($d);
check('购买后N天归一化', $d['valid_days'] === 30 && $d['valid_end_time'] === 0);
check('购买后N天商品本身永不"过期"(按用户算)', $v->isProductExpired($d) === false);

$info = $v->attachValidityInfo(['validity_type' => 1, 'expire_mode' => 1, 'valid_end_time' => $past]);
check('输出注入 is_expired=1', $info['is_expired'] === 1);
check('输出注入 valid_end_date 已格式化', $info['valid_end_date'] === date('Y-m-d H:i:s', $past));

echo "== 安全测试 ==\n";

// 1. 越权/非法类型必须被拒（防止构造请求绕过前端）
expectThrow('拒绝非法 validity_type=2', function () use ($v) { $d = ['validity_type' => 2]; $v->normalizeValidity($d); });
expectThrow('拒绝非法 validity_type=99', function () use ($v) { $d = ['validity_type' => 99]; $v->normalizeValidity($d); });
expectThrow('有限期缺失失效方式被拒', function () use ($v) { $d = ['validity_type' => 1, 'expire_mode' => 0]; $v->normalizeValidity($d); });
expectThrow('固定到期日缺失日期被拒', function () use ($v) { $d = ['validity_type' => 1, 'expire_mode' => 1]; $v->normalizeValidity($d); });
expectThrow('购买后N天=0 被拒', function () use ($v) { $d = ['validity_type' => 1, 'expire_mode' => 2, 'valid_days' => 0]; $v->normalizeValidity($d); });
expectThrow('购买后N天=负数 被拒', function () use ($v) { $d = ['validity_type' => 1, 'expire_mode' => 2, 'valid_days' => -5]; $v->normalizeValidity($d); });

// 2. 存储型 XSS：脚本标签必须被剥离
$d = ['validity_type' => 0, 'validity_name' => '<script>alert(1)</script>会员'];
$v->normalizeValidity($d);
check('XSS<script>标签被剥离', stripos($d['validity_name'], 'script') === false);
check('XSS无尖括号残留', strpos($d['validity_name'], '<') === false && strpos($d['validity_name'], '>') === false);
check('XSS后保留正常文本', strpos($d['validity_name'], '会员') !== false);

// 3. SQL注入字符串：归一化不解析SQL，仅作为普通字符串透传（实际写库走ORM参数绑定）
$payload = "'; DROP TABLE eb_store_product;-- ";
$d = ['validity_type' => 0, 'validity_name' => $payload];
$v->normalizeValidity($d);
check('SQLi串按普通文本透传(交由ORM绑定)', is_string($d['validity_name']) && strpos($d['validity_name'], 'DROP') !== false);

// 4. 超长名称被拒（DoS/越界防护）
expectThrow('超长名称(>64)被拒', function () use ($v) {
    $d = ['validity_type' => 0, 'validity_name' => str_repeat('长', 65)];
    $v->normalizeValidity($d);
});

// 5. 非数字到期日不会变成有效时间戳
expectThrow('非法到期日字符串被拒', function () use ($v) {
    $d = ['validity_type' => 1, 'expire_mode' => 1, 'valid_end_date' => 'not-a-date'];
    $v->normalizeValidity($d);
});

echo "\n==== 结果: PASS={$passed} FAIL={$failed} ====\n";
exit($failed === 0 ? 0 : 1);
