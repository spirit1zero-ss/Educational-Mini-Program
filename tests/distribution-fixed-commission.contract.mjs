import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const read = (path) => readFile(new URL(path, root), 'utf8')

const [
  distribution,
  orderService,
  miniService,
  refundService,
  financeController,
  financeRoutes,
  userService,
  minePage,
  teamPage,
  teamView,
  incomePage,
  agentLevelController,
  agentLevelPage,
  patch,
  distributionPatch,
  membershipApi,
  agentRoutes,
  commissionPage,
  virtualPaymentService,
  settingsPatch,
  quotaEffectiveTimePatch,
  configValidator,
] = await Promise.all([
  read('src/CRMEB/CRMEB-master/crmeb/app/services/user/DistributionServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/order/OtherOrderServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/miniapp/MiniappServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/miniapp/TrainingCampOrderAdminServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/controller/v1/finance/Finance.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/finance.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/user/UserServices.php'),
  read('homepage-home-v1/miniprogram/pages/mine/mine.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/invite-records/invite-records.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/invite-records/invite-records.wxml'),
  read('homepage-home-v1/miniprogram/packages/features/pages/my-income/my-income.js'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/controller/v1/agent/AgentLevel.php'),
  read('src/CRMEB/CRMEB-master/template/admin/src/pages/setting/membershipLevel/index.vue'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-24-release.sql'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-26-training-camp-distribution-refund.sql'),
  read('src/CRMEB/CRMEB-master/template/admin/src/api/membershipLevel.js'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/agent.php'),
  read('src/CRMEB/CRMEB-master/template/admin/src/pages/finance/commission/index.vue'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/pay/VirtualPaymentServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-26-training-camp-settings.sql'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-26-training-camp-quota-effective-time.sql'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/validate/setting/SystemConfigValidata.php'),
])

for (const amount of ['120.00', '150.00', '200.00', '300.00']) {
  assert.match(distribution, new RegExp(`'firstCommission'\\s*=>\\s*'${amount.replace('.', '\\.')}'`))
}
assert.match(distribution, /training_camp_second_commission/)
assert.match(distribution, /training_camp_fallback_commission/)
assert.match(distribution, /initialQuota'\s*=>\s*1/)
assert.match(distribution, /initialQuota'\s*=>\s*30/)
assert.match(distribution, /initialQuota'\s*=>\s*50/)
assert.match(distribution, /initialQuota'\s*=>\s*200/)
assert.match(distribution, /PENDING_SETTLEMENT_TIME\s*=\s*2147483647/)
assert.match(distribution, /training_camp_distribution_enabled/)
assert.match(distribution, /premiumQuotaUsed\(\$uid,\s*\$effectiveTime,\s*\$buyerUid\)\s*<\s*\(int\)\$profile\['initialQuota'\]/)
assert.match(distribution, /where\('spread_time',\s*'>=',\s*\$effectiveTime\)/)
assert.match(distribution, /isPremiumQuotaCandidate\(\$uid,\s*\$buyerUid,\s*\$effectiveTime\)/)
assert.match(distribution, /configuredMoney\(/)
assert.match(distribution, /configuredQuota\(/)
assert.match(distribution, /'quotaLimited'\s*=>\s*\$quotaLimited/)
assert.match(distribution, /'review_time'\s*=>\s*\$reviewTime/)

assert.match(orderService, /firstCommissionForUid/)
assert.match(orderService, /secondCommissionForUid/)
assert.match(orderService, /value\('spread_uid'\)/)
assert.doesNotMatch(orderService, /getSpreadUid/)
assert.doesNotMatch(orderService, /store_brokerage_ratio/)
assert.doesNotMatch(orderService, /store_brokerage_two/)
assert.match(orderService, /where\('link_id', \(string\)\$orderInfo\['id'\]\)/)
assert.match(orderService, /PENDING_SETTLEMENT_TIME/)
assert.match(orderService, /Db::transaction/)
assert.match(orderService, /where\('uid', \(int\)\$uid\)->lock\(true\)->find\(\)/)
assert.match(orderService, /firstCommissionForUid\(\s*\(int\)\$uid,\s*\(int\)\$orderInfo\['uid'\]\s*\)/)

assert.match(miniService, /'teamInitialQuota'/)
assert.match(miniService, /'pullNewCount'/)
assert.match(miniService, /'firstLevelCount'/)
assert.match(miniService, /'secondLevelCount'/)
assert.match(miniService, /'withdrawnAmount'/)
assert.match(miniService, /'distributionIdentity'\s*=>\s*\$isMember\s*\?\s*\$distributionServices->profile\(\$user\)\s*:\s*null/)
assert.match(miniService, /teamMemberUids\(\$uid, 1\)/)
assert.match(miniService, /teamMemberUids\(\$uid, 2\)/)
assert.doesNotMatch(
  miniService.slice(miniService.indexOf('public function getInviteRecords'), miniService.indexOf('public function getIncomeRecords')),
  /getPendingInviteRecords/
)
assert.match(refundService, /update\(\['status' => -1, 'frozen_time' => 0\]\)/)

assert.match(financeController, /function member_commission_list/)
assert.match(financeController, /function review_member_commission/)
assert.match(financeRoutes, /member_commission_list/)
assert.match(financeRoutes, /member_commission\/:id\/review/)
assert.match(userService, /分销合作身份/)
assert.match(userService, /agent_level_time/)
assert.match(userService, /if \(\$newAgentLevel > 0\)/)
assert.match(userService, /\$edit\['spread_open'\] = 1/)

assert.match(minePage, /label: '分销拉新人数'/)
assert.match(minePage, /label: '总收入'/)
assert.match(minePage, /label: '已提现'/)
assert.doesNotMatch(teamPage, /团队初始名额/)
assert.match(teamPage, /label: '一级团队'/)
assert.match(teamPage, /label: '二级团队'/)
assert.match(teamPage, /DEFAULT_TEAM_AVATAR/)
assert.match(teamPage, /item\.nickname \|\| item\.name/)
assert.match(teamPage, /onAvatarError/)
assert.match(teamView, /binderror="onAvatarError"/)
assert.match(incomePage, /label: '待结算'/)
assert.match(incomePage, /label: '可提现'/)
assert.match(incomePage, /label: '已到账'/)

assert.match(distribution, /function policyList\(\): array/)
assert.match(agentLevelController, /mode'\s*,\s*''/)
assert.match(agentLevelController, /policyList\(\)/)
assert.match(agentLevelController, /function distributionSwitch\(\)/)
assert.match(agentLevelController, /'enabled'\s*=>\s*\$distributionServices->isEnabled\(\)/)
assert.match(agentLevelPage, /mode: 'training_camp'/)
assert.match(agentLevelPage, /名额内一级返佣/)
assert.match(agentLevelPage, /名额用完后/)
assert.match(agentLevelPage, /C 身份固定显示 1 个名额/)
assert.match(agentLevelPage, /二级固定返佣/)
assert.match(agentLevelPage, /团队初始名额/)
assert.match(agentLevelPage, /不展示返佣名额/)
assert.match(agentLevelPage, /firstCommissionSummary/)
assert.doesNotMatch(agentLevelPage, /trainingCampDistributionSwitchApi/)
assert.match(agentLevelPage, /基础分销配置/)
assert.doesNotMatch(agentLevelPage, /one_brokerage_percent/)
assert.doesNotMatch(agentLevelPage, /two_brokerage_percent/)
assert.doesNotMatch(agentLevelPage, /一级分佣比例/)

assert.match(patch, /M 盟友/)
assert.match(patch, /D 代理/)
assert.match(patch, /H 合伙人/)
assert.match(distributionPatch, /review_time/)
assert.match(distributionPatch, /refund_account_frozen/)
assert.match(distributionPatch, /training_camp_distribution_enabled/)
assert.match(distributionPatch, /admin-user-grade-distribution-policy-switch/)
assert.match(distributionPatch, /menu_name`\s*=\s*'brokerage_func_status'/)
assert.match(distributionPatch, /SET `status`\s*=\s*0/)
assert.match(settingsPatch, /training_camp_distribution_enabled/)
assert.match(settingsPatch, /training_camp_withdraw_enabled/)
assert.match(quotaEffectiveTimePatch, /agent_level_time/)
assert.match(quotaEffectiveTimePatch, /SET `agent_level_time` = UNIX_TIMESTAMP\(\)/)
assert.match(quotaEffectiveTimePatch, /WHERE `agent_level` > 0/)
for (const key of [
  'training_camp_c_first_commission',
  'training_camp_m_initial_quota',
  'training_camp_m_first_commission',
  'training_camp_d_initial_quota',
  'training_camp_d_first_commission',
  'training_camp_h_initial_quota',
  'training_camp_h_first_commission',
  'training_camp_fallback_commission',
  'training_camp_second_commission',
]) {
  assert.match(settingsPatch, new RegExp(key))
  assert.match(configValidator, new RegExp(key))
}
assert.match(membershipApi, /agent\/level\/distribution-switch/)
assert.match(agentRoutes, /level\/distribution-switch/)
assert.match(commissionPage, /审核时间/)
assert.match(virtualPaymentService, /freezeRefundedAccount/)
assert.match(refundService, /'refund_account_frozen'\s*=>\s*0/)

console.log('distribution fixed commission contract checks passed')
