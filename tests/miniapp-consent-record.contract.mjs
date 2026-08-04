import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const read = (path) => readFile(new URL(path, root), 'utf8')

const [
  apiRoutes,
  authController,
  consentService,
  consentPatch,
  requestSource,
  consentSource,
  consentComponent,
  consentView,
  appConfig,
  mineConfig,
] = await Promise.all([
  read('src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/api/controller/v1/miniapp/AuthController.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/miniapp/MiniappConsentServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-08-04-miniapp-user-consent.sql'),
  read('homepage-home-v1/miniprogram/utils/request.js'),
  read('homepage-home-v1/miniprogram/utils/login-consent.js'),
  read('homepage-home-v1/miniprogram/components/login-consent-modal/login-consent-modal.js'),
  read('homepage-home-v1/miniprogram/components/login-consent-modal/login-consent-modal.wxml'),
  read('homepage-home-v1/miniprogram/app.json'),
  read('homepage-home-v1/miniprogram/pages/mine/mine.json'),
])

const protectedGroupStart = apiRoutes.indexOf("Route::post('miniapp/auth/consent'")
const authMiddleware = apiRoutes.indexOf('AuthTokenMiddleware::class, true', protectedGroupStart)
assert.ok(protectedGroupStart >= 0, 'consent route must exist')
assert.ok(authMiddleware > protectedGroupStart, 'consent route must use the authenticated miniapp route group')

assert.match(authController, /function consent\(Request \$request, MiniappConsentServices \$services\)/)
assert.match(authController, /\(int\)\$request->uid\(\)/, 'server must bind consent to the authenticated user')
assert.match(consentService, /Db::transaction/)
assert.match(consentService, /lock\(true\)/, 'per-user row lock must serialize concurrent consent writes')
assert.match(consentService, /'agreed_at'\s*=>\s*\$now/, 'server time must be authoritative')
assert.match(consentPatch, /UNIQUE KEY `uniq_user_consent_version` \(`uid`, `agreement_type`, `agreement_version`\)/)

assert.match(requestSource, /url: '\/api\/miniapp\/auth\/consent'/)
assert.match(requestSource, /Authorization: authorization/)
assert.match(requestSource, /agreementVersion: record\.version/)
assert.match(consentSource, /serverRecordedVersion: LOGIN_CONSENT_VERSION/)
assert.match(consentSource, /subscribeLoginConsent/)
assert.match(consentComponent, /privacyContractName: this\.data\.privacyContractName/)
assert.match(consentView, /open-type="agreePrivacyAuthorization"/)
assert.match(consentView, /《用户服务协议》/)
assert.doesNotMatch(appConfig, /"login-consent-modal"/, 'consent component must not be loaded globally by public pages')
assert.match(mineConfig, /"login-consent-modal"/)
assert.doesNotMatch(appConfig, /pages\/auth-consent\/auth-consent/)

for (const source of [requestSource, consentSource, consentComponent, consentView]) {
  assert.doesNotMatch(source, /getPhoneNumber|phoneCode|手机号一键登录/, 'consent flow must not request a phone number')
}

console.log('miniapp consent record contract passed')
