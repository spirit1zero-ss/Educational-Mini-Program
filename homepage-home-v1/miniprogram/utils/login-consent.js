const {
  TOKEN_KEY,
  USER_KEY
} = require('../config/api')

const LOGIN_CONSENT_KEY = 'education_login_consent'
const LOGIN_CONSENT_VERSION = '2026-08-04-v1'
const LOGIN_CONSENT_PAGE = '/packages/features/pages/auth-consent/auth-consent'

let consentTask = null
let resolveConsentTask = null
let rejectConsentTask = null

function getConsentRecord() {
  const record = wx.getStorageSync(LOGIN_CONSENT_KEY)
  return record && typeof record === 'object' ? record : null
}

function hasLoginConsent() {
  const record = getConsentRecord()
  return !!(record && record.agreed && record.version === LOGIN_CONSENT_VERSION)
}

function hasRecordedLoginConsent() {
  const record = getConsentRecord()
  return !!(record && record.serverRecordedVersion === LOGIN_CONSENT_VERSION)
}

function createConsentError(message) {
  const error = new Error(message || '需要同意用户协议和隐私保护指引后才能继续')
  error.code = 'LOGIN_CONSENT_REQUIRED'
  return error
}

function settleConsentTask(accepted, error) {
  const resolve = resolveConsentTask
  const reject = rejectConsentTask

  consentTask = null
  resolveConsentTask = null
  rejectConsentTask = null

  if (accepted && resolve) {
    resolve(getConsentRecord())
    return
  }

  if (!accepted && reject) {
    reject(error || createConsentError())
  }
}

function ensureLoginConsent() {
  if (hasLoginConsent()) {
    return Promise.resolve(getConsentRecord())
  }

  if (consentTask) {
    return consentTask
  }

  const task = new Promise((resolve, reject) => {
    resolveConsentTask = resolve
    rejectConsentTask = reject
  })
  consentTask = task

  wx.navigateTo({
    url: LOGIN_CONSENT_PAGE,
    fail: () => {
      settleConsentTask(false, createConsentError('登录授权页面打开失败，请稍后重试'))
    }
  })

  return task
}

function acceptLoginConsent(options) {
  const metadata = options || {}
  wx.setStorageSync(LOGIN_CONSENT_KEY, {
    agreed: true,
    version: LOGIN_CONSENT_VERSION,
    agreedAt: Date.now(),
    privacyContractName: metadata.privacyContractName || ''
  })
  settleConsentTask(true)
}

function markLoginConsentRecorded(result) {
  const record = getConsentRecord()
  if (!record || record.version !== LOGIN_CONSENT_VERSION) return

  wx.setStorageSync(LOGIN_CONSENT_KEY, Object.assign({}, record, {
    serverRecordedVersion: LOGIN_CONSENT_VERSION,
    serverRecordedAt: Number(result && result.agreedAt) || 0,
    serverConsentId: Number(result && result.id) || 0
  }))
}

function cancelLoginConsent() {
  settleConsentTask(false, createConsentError())
}

function withdrawLoginConsent() {
  wx.removeStorageSync(LOGIN_CONSENT_KEY)
  wx.removeStorageSync(TOKEN_KEY)
  wx.removeStorageSync(USER_KEY)
  settleConsentTask(false, createConsentError('登录授权已撤回'))
}

module.exports = {
  LOGIN_CONSENT_KEY,
  LOGIN_CONSENT_VERSION,
  LOGIN_CONSENT_PAGE,
  getConsentRecord,
  hasLoginConsent,
  hasRecordedLoginConsent,
  ensureLoginConsent,
  acceptLoginConsent,
  markLoginConsentRecorded,
  cancelLoginConsent,
  withdrawLoginConsent
}
