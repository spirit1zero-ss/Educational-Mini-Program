import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const [
  distribution,
  controller,
  routes,
  api,
  userList,
  details,
  policy,
  miniService,
  patch,
  distributionPatch,
  membershipApi,
  agentRoutes,
] = await Promise.all([
  read('src/CRMEB/CRMEB-master/crmeb/app/services/user/DistributionServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/controller/v1/user/User.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/user.php'),
  read('src/CRMEB/CRMEB-master/template/admin/src/api/user.js'),
  read('src/CRMEB/CRMEB-master/template/admin/src/pages/user/list/index.vue'),
  read('src/CRMEB/CRMEB-master/template/admin/src/pages/user/list/handle/distributionDetails.vue'),
  read('src/CRMEB/CRMEB-master/template/admin/src/pages/setting/membershipLevel/index.vue'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/miniapp/MiniappServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-24-admin-distribution-ui-merged.sql'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-26-training-camp-distribution-refund.sql'),
  read('src/CRMEB/CRMEB-master/template/admin/src/api/membershipLevel.js'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/agent.php'),
]);

assert.match(distribution, /function adminOverview\(int \$uid\): array/);
assert.match(distribution, /function adminTeamMembers\(int \$uid, int \$grade/);
assert.match(distribution, /function teamMemberUids\(int \$uid, int \$grade = 1\): array/);
assert.match(distribution, /where\('order_state', 'paid'\)/);
assert.match(distribution, /where\('refund_state', '<>', 'refunded'\)/);
assert.match(distribution, /'usedQuota'\s*=>\s*\$usedQuota/);
assert.match(distribution, /'remainingQuota'/);
for (const metric of [
  'totalAmount',
  'pendingAmount',
  'availableAmount',
  'withdrawingAmount',
  'withdrawnAmount',
  'firstAmount',
  'secondAmount',
  'revokedAmount',
]) {
  assert.match(distribution, new RegExp(`'${metric}'`));
}

assert.match(controller, /function distributionOverview\(\$uid\)/);
assert.match(controller, /function distributionTeam\(\$uid\)/);
assert.match(routes, /user\/:uid\/distribution'/);
assert.match(routes, /user\/:uid\/distribution\/team'/);
assert.match(api, /userDistributionOverviewApi/);
assert.match(api, /userDistributionTeamApi/);
assert.match(userList, /分销详情/);
assert.match(userList, /distributionDetails/);
assert.match(userList, /scope\.row\.is_ever_level/);

for (const label of [
  '团队初始名额',
  '已使用名额',
  '剩余名额',
  '分销拉新人数',
  '一级团队',
  '二级团队',
  '总收入',
  '待结算',
  '可提现',
  '提现中',
  '已提现',
  '一级收入',
  '二级收入',
]) {
  assert.match(details, new RegExp(label));
}

assert.match(policy, /¥399订单款全部进入公司账户/);
assert.match(policy, /allyFirstCommission \* 3/);
assert.match(policy, /secondCommission \* 2/);
assert.match(policy, /firstCommissionSummary/);
assert.doesNotMatch(policy, /实际到账 ¥487\.06/);
assert.match(policy, /第一版不做自动升级/);
assert.match(policy, /团队初始名额/);
assert.match(policy, /名额用完后/);
assert.match(policy, /训练营分销/);
assert.match(policy, /不展示返佣名额/);

assert.match(miniService, /teamMemberUids\(\$uid, 1\)/);
assert.match(miniService, /teamMemberUids\(\$uid, 2\)/);
assert.match(patch, /admin-user-distribution-overview/);
assert.match(patch, /admin-user-distribution-team/);
assert.match(patch, /admin-user-grade-distribution-policy-read/);
assert.match(distributionPatch, /admin-user-grade-distribution-policy-switch/);
assert.match(membershipApi, /trainingCampDistributionSwitchApi/);
assert.match(agentRoutes, /trainingCampDistributionSwitch/);

console.log('admin distribution details contract passed');
