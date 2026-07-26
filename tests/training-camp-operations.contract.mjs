import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const read = (path) => readFile(new URL(path, root), 'utf8')

const [
  miniService,
  mineController,
  apiRoutes,
  cancelService,
  userController,
  registrationService,
  adminRoutes,
  adminApi,
  registrationPage,
  miniApi,
  incomePage,
  callbackService,
  menuPatch,
  virtualPaymentService,
  orderAdminService,
  distributionPatch,
  userExtractService,
  payClient,
  settingsPatch,
] = await Promise.all([
  read('src/CRMEB/CRMEB-master/crmeb/app/services/miniapp/MiniappServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/api/controller/v1/miniapp/MineController.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/user/UserCancelServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/controller/v1/user/User.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/miniapp/TrainingCampRegistrationServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/user.php'),
  read('src/CRMEB/CRMEB-master/template/admin/src/api/user.js'),
  read('src/CRMEB/CRMEB-master/template/admin/src/pages/user/grade/registration/index.vue'),
  read('homepage-home-v1/miniprogram/api/mine.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/my-income/my-income.js'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/pay/PayTransferNotifyServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-22-training-camp-admin-cleanup.sql'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/pay/VirtualPaymentServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/miniapp/TrainingCampOrderAdminServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-26-training-camp-distribution-refund.sql'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/user/UserExtractServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/crmeb/services/easywechat/v3pay/PayClient.php'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-26-training-camp-settings.sql'),
])

assert.doesNotMatch(miniService, /\|\| \(int\)\(\$user\['level'\]/, 'legacy user level must not grant training-camp access')
assert.match(miniService, /function getWithdrawalOverview/)
assert.match(miniService, /function applyWithdrawal/)
assert.match(miniService, /if \(!\$window\['open'\]\)/)
assert.match(miniService, /提现申请时间为/)
assert.match(miniService, /where\('status', 0\)/)
assert.match(miniService, /Db::transaction\(function \(\) use \(\$uid, \$amount, \$user\)/)
assert.match(mineController, /function withdrawal/)
assert.match(mineController, /function applyWithdrawal/)
assert.match(apiRoutes, /miniapp\/referral\/withdrawal/)
assert.match(miniApi, /getWithdrawalOverview/)
assert.match(miniApi, /applyWithdrawal/)
assert.match(incomePage, /wx\.requestMerchantTransfer/)
assert.match(incomePage, /withdrawalSubmitting/)
assert.match(incomePage, /已打开收款确认页/)
assert.doesNotMatch(incomePage, /已确认收款/)

assert.match(cancelService, /'is_del'\s*=>\s*1/)
assert.match(cancelService, /'is_promoter'\s*=>\s*0/)
assert.match(cancelService, /未完成的提现/)
assert.match(userController, /function delete\(\$id\)/)

assert.match(registrationService, /function adminDelete/)
assert.match(adminRoutes, /member\/registration\/:id/)
assert.match(adminApi, /trainingCampRegistrationDelete/)
assert.match(registrationPage, /deleteRegistration/)

assert.match(miniService, /training_camp_withdraw_enabled/)
assert.doesNotMatch(
  miniService.slice(miniService.indexOf('public function getWithdrawalOverview'), miniService.indexOf('private function getWithdrawalWindow')),
  /weixin_extract_type/
)
assert.match(userExtractService, /v3_transfer_scene_id', '1000'/)
assert.match(userExtractService, /'现金奖励'/)
assert.match(userExtractService, /'info_type'\s*=>\s*'活动名称'/)
assert.match(userExtractService, /'info_type'\s*=>\s*'奖励说明'/)
assert.doesNotMatch(
  userExtractService.slice(userExtractService.indexOf('public function changeSuccess'), userExtractService.indexOf("if (sys_config('alipay_extract_type")),
  /'劳务报酬'|'岗位类型'|'报酬说明'/
)
assert.match(userExtractService, /function syncMerchantTransfer/)
assert.match(userExtractService, /queryTransferBills/)
assert.match(payClient, /商家转账查询失败/)
assert.match(callbackService, /Db::transaction/)
assert.match(callbackService, /lock\(true\)/)
assert.match(callbackService, /in_array\(\$state, \$terminalFailures, true\)/)
assert.match(settingsPatch, /training_camp_withdraw_enabled/)
assert.match(menuPatch, /user-user-level/)
assert.match(menuPatch, /admin-user-training-camp-registration-delete/)
assert.match(virtualPaymentService, /private function freezeRefundedAccount/)
assert.match(virtualPaymentService, /'status'\s*=>\s*0/)
assert.match(virtualPaymentService, /'refund_account_frozen'\s*=>\s*1/)
assert.match(orderAdminService, /'refund_account_frozen'\s*=>\s*0/)
assert.match(orderAdminService, /\$userUpdate\['status'\]\s*=\s*1/)
assert.match(distributionPatch, /refund_account_frozen/)

console.log('training camp operations contract checks passed')
