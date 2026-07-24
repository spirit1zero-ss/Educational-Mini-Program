import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const read = (path) => readFile(new URL(path, root), 'utf8')

const [
  publicController,
  apiRoutes,
  offlineService,
  adminRoutes,
  adminApi,
  adminRouter,
  offlinePage,
  mineApi,
  appConfig,
  checkout,
  checkoutView,
  registrationView,
  incomePage,
  incomeView,
  miniService,
  configValidator,
  timerPatch,
  offlinePatch,
  agreementPatch,
  withdrawalWindowPatch,
  releasePatch,
] = await Promise.all([
  read('src/CRMEB/CRMEB-master/crmeb/app/api/controller/v1/PublicController.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/miniapp/OfflineLocationServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/user.php'),
  read('src/CRMEB/CRMEB-master/template/admin/src/api/user.js'),
  read('src/CRMEB/CRMEB-master/template/admin/src/router/modules/user.js'),
  read('homepage-home-v1/miniprogram/pages/offline/offline.js'),
  read('homepage-home-v1/miniprogram/api/mine.js'),
  read('homepage-home-v1/miniprogram/app.json'),
  read('homepage-home-v1/miniprogram/packages/features/pages/camp-checkout/camp-checkout.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/camp-checkout/camp-checkout.wxml'),
  read('homepage-home-v1/miniprogram/packages/features/pages/member-registration/member-registration.wxml'),
  read('homepage-home-v1/miniprogram/packages/features/pages/my-income/my-income.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/my-income/my-income.wxml'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/miniapp/MiniappServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/validate/setting/SystemConfigValidata.php'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-23-disable-virtual-payment-reconcile-timer.sql'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-23-miniapp-offline-locations.sql'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-23-miniapp-agreements.sql'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-23-miniapp-withdrawal-window.sql'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-24-release.sql'),
])

assert.match(apiRoutes, /miniapp\/offline-locations/)
assert.match(apiRoutes, /miniapp\/agreements/)
assert.match(publicController, /function offlineLocations/)
assert.match(publicController, /function miniappAgreements/)
assert.match(offlineService, /where\('is_show', 1\)/)
assert.match(offlineService, /function save/)
assert.match(offlineService, /function delete/)
assert.match(adminRoutes, /member\/offline_location/)
assert.match(adminApi, /offlineLocationList/)
assert.match(adminApi, /offlineLocationSave/)
assert.match(adminRouter, /admin-user-grade-offline-locations/)
assert.match(offlinePage, /getOfflineLocations/)
assert.doesNotMatch(offlinePage, /详细地址待后台配置/)
assert.match(mineApi, /getMiniappAgreements/)

const parsedAppConfig = JSON.parse(appConfig)
const featurePackage = parsedAppConfig.subPackages.find((item) => item.root === 'packages/features')
assert.ok(featurePackage.pages.includes('pages/legal-document/legal-document'))
assert.match(checkout, /agreed:\s*false/)
assert.match(checkoutView, /训练营服务协议/)
assert.match(checkoutView, /隐私政策/)
assert.match(registrationView, /报名信息使用说明/)

assert.doesNotMatch(incomePage, /loadWithdrawalOverview\(\)\.then\(\(\) => this\.onWithdrawTap\(\)\)/)
assert.match(incomePage, /openWithdrawalPanel/)
assert.match(incomePage, /withdrawal\.windowOpen/)
assert.match(incomeView, /withdrawal\.windowNotice/)
assert.match(miniService, /function getWithdrawalWindow/)
assert.match(miniService, /Asia\/Shanghai/)
assert.match(miniService, /miniapp_withdraw_start_day/)
assert.match(miniService, /miniapp_withdraw_end_day/)
assert.match(configValidator, /miniapp_withdraw_start_day/)
assert.match(configValidator, /miniapp_withdraw_end_day/)
assert.match(timerPatch, /SET\s+`is_open`\s*=\s*0/)
assert.match(offlinePatch, /CREATE TABLE IF NOT EXISTS `eb_miniapp_offline_location`/)
assert.match(agreementPatch, /报名信息使用说明/)
assert.match(withdrawalWindowPatch, /miniapp_withdraw_start_day/)
assert.match(withdrawalWindowPatch, /miniapp_withdraw_end_day/)
assert.match(withdrawalWindowPatch, /WHERE\s+`menu_name`\s*=\s*'extract_time'/)
assert.match(releasePatch, /virtualPaymentReconcile/)
assert.match(releasePatch, /eb_miniapp_offline_location/)
assert.match(releasePatch, /报名信息使用说明/)
assert.match(releasePatch, /miniapp_withdraw_start_day/)

console.log('configurable miniapp content contract checks passed')
