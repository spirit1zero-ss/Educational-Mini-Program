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
  incomePage,
  patch,
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
  read('homepage-home-v1/miniprogram/packages/features/pages/my-income/my-income.js'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-24-release.sql'),
])

for (const amount of ['120.00', '150.00', '200.00', '300.00']) {
  assert.match(distribution, new RegExp(`'firstCommission'\\s*=>\\s*'${amount.replace('.', '\\.')}'`))
}
assert.match(distribution, /SECOND_COMMISSION\s*=\s*'20\.00'/)
assert.match(distribution, /initialQuota'\s*=>\s*1/)
assert.match(distribution, /initialQuota'\s*=>\s*30/)
assert.match(distribution, /initialQuota'\s*=>\s*50/)
assert.match(distribution, /initialQuota'\s*=>\s*200/)
assert.match(distribution, /PENDING_SETTLEMENT_TIME\s*=\s*2147483647/)

assert.match(orderService, /firstCommissionForUid/)
assert.match(orderService, /secondCommissionForUid/)
assert.doesNotMatch(orderService, /store_brokerage_ratio/)
assert.doesNotMatch(orderService, /store_brokerage_two/)
assert.match(orderService, /where\('link_id', \(string\)\$orderInfo\['id'\]\)/)
assert.match(orderService, /PENDING_SETTLEMENT_TIME/)
assert.match(orderService, /Db::transaction/)
assert.match(orderService, /where\('uid', \(int\)\$uid\)->lock\(true\)->find\(\)/)

assert.match(miniService, /'teamInitialQuota'/)
assert.match(miniService, /'pullNewCount'/)
assert.match(miniService, /'firstLevelCount'/)
assert.match(miniService, /'secondLevelCount'/)
assert.match(miniService, /'withdrawnAmount'/)
assert.match(miniService, /where\('is_ever_level', 1\)/)
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
assert.match(userService, /if \(\$edit\['agent_level'\] > 0\)/)
assert.match(userService, /\$edit\['spread_open'\] = 1/)

assert.match(minePage, /label: '分销拉新人数'/)
assert.match(minePage, /label: '总收入'/)
assert.match(minePage, /label: '已提现'/)
assert.match(teamPage, /label: '团队初始名额'/)
assert.match(teamPage, /label: '一级团队'/)
assert.match(teamPage, /label: '二级团队'/)
assert.match(incomePage, /label: '待结算'/)
assert.match(incomePage, /label: '可提现'/)
assert.match(incomePage, /label: '已到账'/)

assert.match(patch, /M 盟友/)
assert.match(patch, /D 代理/)
assert.match(patch, /H 合伙人/)

console.log('distribution fixed commission contract checks passed')
