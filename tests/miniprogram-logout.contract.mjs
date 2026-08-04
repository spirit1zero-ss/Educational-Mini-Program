import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const read = (path) => readFile(new URL(path, root), 'utf8')

const [mineSource, mineView, requestSource, consentSource] = await Promise.all([
  read('homepage-home-v1/miniprogram/pages/mine/mine.js'),
  read('homepage-home-v1/miniprogram/pages/mine/mine.wxml'),
  read('homepage-home-v1/miniprogram/utils/request.js'),
  read('homepage-home-v1/miniprogram/utils/login-consent.js'),
])

assert.match(mineView, /wx:if="\{\{isLoggedIn\}\}"/)
assert.match(mineView, /bindtap="onLogoutTap"/)
assert.match(mineSource, /onLogoutTap\(\)/)
assert.match(mineSource, /clearAuth\(\)\s*\n\s*this\.resetLoggedOutState\(\)/)
assert.match(mineSource, /if \(!hasAuthToken\(\)\) \{\s*this\.resetLoggedOutState\(\)/)

const clearAuthBody = requestSource.match(/function clearAuth\(\) \{([\s\S]*?)\n\}/)
assert.ok(clearAuthBody, 'clearAuth must exist')
assert.match(clearAuthBody[1], /wx\.removeStorageSync\(TOKEN_KEY\)/)
assert.match(clearAuthBody[1], /wx\.removeStorageSync\(USER_KEY\)/)
assert.doesNotMatch(clearAuthBody[1], /LOGIN_CONSENT_KEY/, 'ordinary logout must preserve consent')
assert.match(consentSource, /function withdrawLoginConsent\(\)/, 'consent withdrawal must remain a separate action')

console.log('miniprogram logout contract passed')
