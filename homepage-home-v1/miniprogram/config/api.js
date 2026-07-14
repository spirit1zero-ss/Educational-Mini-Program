const CLOUD_ENV_ID = 'prod-d0ge2jwpgc0db67eb'
const CLOUD_SERVICE_NAME = 'crmeb-api'
const DEFAULT_API_BASE_URL = ''

function getApiBaseUrl() {
  const storedUrl = wx.getStorageSync('miniapp_api_base_url')
  const isLegacyLocalUrl = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/i.test(storedUrl)

  if (isLegacyLocalUrl) {
    wx.removeStorageSync('miniapp_api_base_url')
    return DEFAULT_API_BASE_URL
  }

  return storedUrl || DEFAULT_API_BASE_URL
}

module.exports = {
  CLOUD_ENV_ID,
  CLOUD_SERVICE_NAME,
  DEFAULT_API_BASE_URL,
  getApiBaseUrl,
  TOKEN_KEY: 'miniapp_auth_token',
  USER_KEY: 'miniapp_auth_user',
  REFERRER_KEY: 'miniapp_referrer_uid'
}
