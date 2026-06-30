<?php
// +----------------------------------------------------------------------
// | 会员等级（按累计购买商品件数升级）本地验证脚本
// | 用法（在 PHP 容器内）：php /var/www/level_verify.php [--keep]
// |   --keep  保留测试数据（默认运行结束后清理测试订单与等级记录）
// | 说明：脚本会创建/复用一个测试用户，注入"已支付未退款"订单来模拟
// |       累计购买件数，调用 UserLevelServices::detection 验证自动升级/降级。
// +----------------------------------------------------------------------
namespace think;

use think\facade\Db;

require __DIR__ . '/vendor/autoload.php';

// 初始化 ThinkPHP 容器（使其可使用 app()->make / Db / sys_config）
(new App())->initialize();

$KEEP = in_array('--keep', $argv ?? [], true);
$TEST_NICK = 'LVL自动化测试用户';
$ORDER_TAG = 'LVLTEST';

function line($s = '') { echo $s . PHP_EOL; }

function getLevels(): array
{
    return Db::name('system_user_level')
        ->where('is_del', 0)->where('is_show', 1)
        ->order('exp_num asc')
        ->column('name,exp_num,grade', 'id');
}

function expectedName(array $levels, int $num): string
{
    $best = null;
    foreach ($levels as $lv) {
        if ((int)$lv['exp_num'] <= $num) {
            if ($best === null || (int)$lv['exp_num'] > (int)$best['exp_num']) {
                $best = $lv;
            }
        }
    }
    return $best ? $best['name'] : '无';
}

function setBuyNum(int $uid, int $num, string $tag): void
{
    Db::name('store_order')->where('uid', $uid)->where('order_id', 'like', $tag . '%')->delete();
    if ($num > 0) {
        Db::name('store_order')->insert([
            'order_id'      => $tag . $uid . '_' . time() . mt_rand(100, 999),
            'uid'           => $uid,
            'real_name'     => 'level_test',
            'user_phone'    => '',
            'user_address'  => '',
            'total_num'     => $num,
            'total_price'   => '0.01',
            'pay_price'     => '0.01',
            'paid'          => 1,
            'refund_status' => 0,
            'status'        => 2,
            'is_del'        => 0,
            'is_system_del' => 0,
            'add_time'      => time(),
            'pay_time'      => time(),
        ]);
    }
}

function currentLevelName(int $uid): array
{
    $levelId = (int)Db::name('user')->where('uid', $uid)->value('level');
    $name = $levelId ? (string)Db::name('system_user_level')->where('id', $levelId)->value('name') : '无';
    $activeGrade = (int)(Db::name('user_level')
        ->where('uid', $uid)->where('status', 1)->where('is_del', 0)
        ->order('grade desc')->value('grade') ?? 0);
    return [$levelId, $name, $activeGrade];
}

line('=== 会员等级自动升级 本地验证 ===');

// 0) 前置检查：会员功能开关与升级指标
if (!sys_config('member_func_status')) {
    line('[警告] member_func_status 未开启，detection 不会执行。请先执行迁移脚本并清理缓存。');
    exit(1);
}
$metric = sys_config('member_level_metric', 'order_num');
line('升级指标 member_level_metric = ' . $metric . ($metric === 'order_num' ? '（按购买商品件数）' : '（按经验值）'));

$levels = getLevels();
if (!$levels) {
    line('[失败] 未查询到有效的会员等级（system_user_level）。请确认迁移脚本已执行。');
    exit(1);
}
line('当前生效等级（按门槛升序）：');
foreach ($levels as $id => $lv) {
    line(sprintf('  id=%-3d %-8s grade=%d 门槛(件数)=%d', $id, $lv['name'], $lv['grade'], $lv['exp_num']));
}
line('');

// 1) 准备测试用户
$uid = (int)Db::name('user')->where('nickname', $TEST_NICK)->value('uid');
if (!$uid) {
    $uid = (int)Db::name('user')->insertGetId([
        'nickname' => $TEST_NICK,
        'account'  => 'lvl_test_' . time(),
        'add_time' => time(),
        'status'   => 1,
    ]);
    line('已创建测试用户 uid=' . $uid);
} else {
    line('复用已存在测试用户 uid=' . $uid);
}

// 重置状态
Db::name('store_order')->where('uid', $uid)->where('order_id', 'like', $ORDER_TAG . '%')->delete();
Db::name('user_level')->where('uid', $uid)->delete();
Db::name('user')->where('uid', $uid)->update(['level' => 0, 'exp' => 0]);
line('');

// 2) 场景：累计购买件数 -> 期望等级（含退款回落降级）
$steps = [
    ['首次购买 1 件',       1],
    ['累计 20 件',          20],
    ['累计 50 件',          50],
    ['累计 100 件',         100],
    ['退款回落到 50 件',     50],
    ['退款回落到 0 件',      0],
];

/** @var \app\services\user\UserLevelServices $levelSrv */
$levelSrv = app()->make(\app\services\user\UserLevelServices::class);
/** @var \app\services\order\StoreOrderServices $orderSrv */
$orderSrv = app()->make(\app\services\order\StoreOrderServices::class);

$pass = 0; $fail = 0;
line(sprintf('%-18s %-8s %-8s %-10s %-6s', '场景', '件数', '期望', '实际', '结果'));
line(str_repeat('-', 56));
foreach ($steps as [$label, $num]) {
    setBuyNum($uid, $num, $ORDER_TAG);
    $counted = (int)$orderSrv->getUserPayProductNum($uid);
    $levelSrv->detection($uid);
    [$lid, $name, $grade] = currentLevelName($uid);
    $exp = expectedName($levels, $num);
    $ok = ($name === $exp) && ($counted === $num);
    $ok ? $pass++ : $fail++;
    line(sprintf('%-18s %-8d %-8s %-10s %-6s', $label, $num, $exp, $name, $ok ? 'PASS' : 'FAIL'));
    if ($counted !== $num) {
        line(sprintf('    [注意] 统计件数=%d 与注入件数=%d 不一致', $counted, $num));
    }
}
line(str_repeat('-', 56));
line(sprintf('结果：PASS=%d  FAIL=%d', $pass, $fail));

// 3) 清理
if (!$KEEP) {
    Db::name('store_order')->where('uid', $uid)->where('order_id', 'like', $ORDER_TAG . '%')->delete();
    Db::name('user_level')->where('uid', $uid)->delete();
    Db::name('user')->where('uid', $uid)->update(['level' => 0, 'exp' => 0]);
    line('已清理测试订单与等级记录（测试用户 uid=' . $uid . ' 保留，可手动删除）。');
} else {
    line('已保留测试数据（--keep）。');
}

exit($fail === 0 ? 0 : 2);
