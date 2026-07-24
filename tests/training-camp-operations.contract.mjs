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

assert.match(cancelService, /'is_del'\s*=>\s*1/)
assert.match(cancelService, /'is_promoter'\s*=>\s*0/)
assert.match(cancelService, /未完成的提现/)
assert.match(userController, /function delete\(\$id\)/)

assert.match(registrationService, /function adminDelete/)
assert.match(adminRoutes, /member\/registration\/:id/)
assert.match(adminApi, /trainingCampRegistrationDelete/)
assert.match(registrationPage, /deleteRegistration/)

assert.match(callbackService, /\$userExtract = is_array\(\$userExtractInfo\)/)
assert.match(menuPatch, /user-user-level/)
assert.match(menuPatch, /admin-user-training-camp-registration-delete/)

console.log('training camp operations contract checks passed')
