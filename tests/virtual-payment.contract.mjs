import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const read = (path) => readFile(new URL(path, root), 'utf8')

const [client, page, checkout, checkoutView, api, service, lockService, miniappService, mineController, qrcodeService, wechatMiniProgramService, easyWechatQrCode, crontabService, routes, config, schema, easyWechatCollection, profilePage, profileView, miniappManifest, minePage, profileAvatar] = await Promise.all([
  read('homepage-home-v1/miniprogram/packages/features/utils/virtual-payment.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/camp-orders/camp-orders.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/camp-checkout/camp-checkout.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/camp-checkout/camp-checkout.wxml'),
  read('homepage-home-v1/miniprogram/api/mine.js'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/pay/VirtualPaymentServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/pay/PaymentLockService.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/miniapp/MiniappServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/api/controller/v1/miniapp/MineController.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/other/QrcodeServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/crmeb/services/app/MiniProgramService.php'),
  read('src/CRMEB/CRMEB-master/crmeb/vendor/overtrue/wechat/src/MiniProgram/QRCode/QRCode.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/system/crontab/CrontabRunServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php'),
  read('src/CRMEB/CRMEB-master/crmeb/config/xpay.php'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-16-miniapp-virtual-payment.sql'),
  read('src/CRMEB/CRMEB-master/crmeb/vendor/overtrue/wechat/src/Support/Collection.php'),
  read('homepage-home-v1/miniprogram/packages/features/pages/profile-editor/profile-editor.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/profile-editor/profile-editor.wxml'),
  read('homepage-home-v1/miniprogram/app.json'),
  read('homepage-home-v1/miniprogram/pages/mine/mine.js'),
  read('homepage-home-v1/miniprogram/packages/features/utils/profile-avatar.js')
])

const permanentPlanClients = await Promise.all([
  read('homepage-home-v1/miniprogram/pages/mine/mine.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/camp-checkout/camp-checkout.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/member-benefits/member-benefits.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/module-5-camp/module-5-camp.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/promo-poster/promo-poster.js'),
])

assert.match(client, /wx\.requestVirtualPayment\s*\(/)
assert.doesNotMatch(page, /wx\.requestPayment\s*\(/)
assert.doesNotMatch(checkout, /wx\.requestPayment\s*\(/)
assert.match(checkout, /requestTrainingCampVirtualPayment\(order\.orderId\)/)
assert.doesNotMatch(checkout, /请到订单页继续支付/)
assert.match(checkout, /saveMiniappProfile/)
assert.match(checkout, /submitProfileAndPay/)
assert.match(checkout, /startPayment\(\)/)
assert.match(checkoutView, /请填写真实手机号，方便助教老师联系。/)
assert.match(checkoutView, /open-type="chooseAvatar"/)
assert.match(checkoutView, /type="nickname"/)
assert.match(client, /payType:\s*'virtual'/)
assert.match(client, /wx\.login\s*\(/)
assert.match(client, /confirmTrainingCampMemberOrder/)
assert.match(client, /payment\.alreadyConfirmed/)
assert.match(api, /member-order\/confirm/)
assert.match(api, /miniapp\/profile/)
assert.match(api, /function getMiniappProfile/)
assert.match(routes, /member-order\/confirm/)
assert.match(routes, /miniapp\/profile/)
assert.match(routes, /Route::get\('miniapp\/profile'/)
assert.match(routes, /Route::post\('miniapp\/profile'/)
assert.match(mineController, /function profile/)
assert.match(mineController, /function updateProfile/)
assert.match(miniappService, /function getProfile/)
assert.match(miniappService, /function updateProfile/)
assert.match(miniappService, /请填写真实有效的11位手机号/)
assert.match(mineController, /avatar_file_id/)
assert.match(miniappService, /validateCloudAvatarFileId/)
assert.match(miniappService, /member-avatars/)
assert.match(miniappService, /getimagesizefromstring/)
assert.match(miniappService, /image\/jpeg/)
assert.match(miniappService, /image\/png/)
assert.match(miniappService, /image\/webp/)
assert.match(miniappService, /\$width > 4096 \|\| \$height > 4096/)
assert.match(profilePage, /getMiniappProfile/)
assert.match(profilePage, /saveMiniappProfile/)
assert.match(profilePage, /uploadAvatarToCloud/)
assert.match(profilePage, /avatar_file_id/)
assert.doesNotMatch(profilePage, /avatar_base64/)
assert.match(checkout, /uploadAvatarToCloud/)
assert.match(checkout, /avatar_file_id/)
assert.doesNotMatch(checkout, /avatar_base64/)
assert.match(profileAvatar, /wx\.getFileInfo/)
assert.match(profileAvatar, /wx\.cloud\.uploadFile/)
assert.match(profileAvatar, /wx\.cloud\.deleteFile/)
assert.match(profileAvatar, /member-avatars/)
assert.match(profileAvatar, /0x89[\s\S]*0x50[\s\S]*0x4e[\s\S]*0x47/)
assert.match(profileAvatar, /0x57[\s\S]*0x45[\s\S]*0x42[\s\S]*0x50/)
assert.match(profileView, /open-type="chooseAvatar"/)
assert.match(profileView, /仅支持 JPG、PNG、WebP 图片/)
assert.match(miniappManifest, /pages\/profile-editor\/profile-editor/)
assert.match(minePage, /PROFILE_EDITOR_PATH/)
assert.match(minePage, /key:\s*'profile'[\s\S]*memberOnly:\s*true/)
assert.match(minePage, /if\s*\(!this\.data\.isMember\)\s*\{\s*return\s*\}/)

assert.match(service, /hash_hmac\('sha256',\s*\$uri\s*\.\s*'&'\s*\.\s*\$signData/)
assert.match(service, /hash_hmac\('sha256',\s*\$signData,\s*\$sessionKey\)/)
assert.match(service, /short_series_goods/)
assert.match(service, /goodsPrice/)
assert.match(service, /query_order/)
assert.match(service, /notify_provide_goods/)
assert.match(service, /PayServices::VIRTUAL_PAY/)
assert.match(service, /assertTrainingCampOrderClosable/)
assert.match(service, /reconcilePendingPayments/)
assert.match(service, /active_order_key/)
assert.match(service, /lock->run\('camp:order:'/)
assert.match(service, /if \(\$wxOrderId !== ''\)[\s\S]*\$payload\['wx_order_id'\][\s\S]*else[\s\S]*\$payload\['order_id'\]/)
assert.match(service, /private function notifyEntitlementDelivered[\s\S]*paySignature\(self::NOTIFY_ENTITLEMENT_URI,\s*\$body,\s*\$appKey\)[\s\S]*\['pay_sig'\s*=>\s*\$paySig\]/)
assert.match(lockService, /bin2hex\(random_bytes\(16\)\)/)
assert.match(lockService, /config\('cache\.default',\s*'file'\)[\s\S]*!==\s*'redis'[\s\S]*return \$callback\(\)/, 'file-cache deployments must bypass Redis payment locks')
assert.match(lockService, /redis\.call\('get', KEYS\[1\]\) == ARGV\[1\]/)
assert.match(lockService, /microtime\(true\) < \$deadline/)
assert.match(miniappService, /miniapp_training_camp_order/)
assert.match(miniappService, /TRAINING_CAMP_MEMBER_TYPE\s*=\s*'ever'/)
assert.match(miniappService, /\(string\)\(\$item\['type'\]\s*\?\?\s*''\)\s*===\s*self::TRAINING_CAMP_MEMBER_TYPE/)
assert.match(miniappService, /Training camp only supports permanent membership/)
assert.match(miniappService, /getMiniappMemberInviteCode\(\$memberUid,\s*\$page,\s*false\)/, 'CloudBase referral posters must not depend on container-local image URLs')
assert.match(qrcodeService, /data:image\/jpeg;base64,[\s\S]*base64_encode\(\$body\)/, 'referral codes must support inline image delivery')
assert.match(miniappService, /teamMemberUids\(\$uid,\s*1\)/, 'invite list must use effective paid first-level members')
assert.doesNotMatch(
  miniappService.slice(miniappService.indexOf('public function getInviteRecords'), miniappService.indexOf('public function getIncomeRecords')),
  /getPendingInviteRecords/,
  'team list must not expose pending or unpaid invitations'
)
assert.match(wechatMiniProgramService, /Env::get\('miniapp\.app_id'/, 'mini-program AppID must support cloud environment configuration')
assert.match(wechatMiniProgramService, /Env::get\('miniapp\.app_secret'/, 'mini-program AppSecret must support cloud environment configuration')
assert.match(qrcodeService, /Env::get\('miniapp\.code_env_version',\s*'release'\)/, 'mini-program codes must default to the release version')
assert.match(qrcodeService, /Env::get\('miniapp\.code_check_path',\s*'true'\)/, 'mini-program code path validation must default to enabled')
assert.match(qrcodeService, /\$cacheVariant\s*=\s*\$page\s*\.\s*'\|'\s*\.\s*\$envVersion/, 'development and release QR-code caches must be isolated')
assert.match(qrcodeService, /\$wechatPage\s*=\s*\$page\s*===\s*'pages\/home\/home'\s*\?\s*null\s*:\s*\$page/, 'home referral codes must use the version default page to avoid WeChat 41030')
assert.match(easyWechatQrCode, /if\s*\(\$page\s*!==\s*null\s*&&\s*\$page\s*!==\s*''\)[\s\S]*\$params\['page'\]\s*=\s*\$page/, 'empty QR-code pages must be omitted from the WeChat payload')
assert.match(easyWechatQrCode, /'check_path'\]\s*=\s*\(bool\)\$checkPath/)
assert.match(easyWechatQrCode, /'env_version'\]\s*=\s*\$envVersion/)
assert.match(checkout, /item\.type\s*===\s*'ever'/)
for (const permanentPlanClient of permanentPlanClients) {
  assert.match(permanentPlanClient, /item\.type\s*===\s*'ever'/)
}
assert.match(miniappService, /whereIn\('c\.order_state', \['pending', 'paying'\]\)/)
assert.match(miniappService, /expireStaleTrainingCampOrders/)
assert.match(crontabService, /virtualPaymentReconcile/)
assert.match(crontabService, /expireStaleTrainingCampOrders/)

assert.match(config, /sandbox_app_key/)
assert.match(config, /production_app_key/)
assert.match(config, /Env::get\('xpay\.env',\s*0\)/)
assert.doesNotMatch(config, /app_key'\s*=>\s*'[A-Za-z0-9]{16,}'/)
assert.match(service, /replace-with-/)
assert.match(schema, /UNIQUE KEY `uniq_out_trade_no`/)
assert.match(schema, /CREATE TABLE IF NOT EXISTS `eb_miniapp_training_camp_order`/)
assert.match(schema, /UNIQUE KEY `uniq_active_order_key`/)
assert.match(schema, /WHERE NOT EXISTS/)
assert.match(easyWechatCollection, /public static function __set_state\(array \$state\)/)

// Official XPay signing example from the WeChat virtual-payment documentation.
const body = '{"openid": "xxx", "user_ip": "127.0.0.1", "env": 0}'
const signature = createHmac('sha256', '12345')
  .update(`/xpay/query_user_balance&${body}`)
  .digest('hex')
assert.equal(signature, 'c37809f27c6d7fd1837ad2500a04512b66b34fd793a39a385fade56dca89a4b5')

console.log('virtual payment contract checks passed')
