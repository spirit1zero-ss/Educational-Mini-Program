const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8011'
const MOCK_ENABLED_KEY = 'miniapp_frontend_mock_enabled'
const DEFAULT_FRONTEND_MOCK_ENABLED = true

function getApiBaseUrl() {
  return wx.getStorageSync('miniapp_api_base_url') || DEFAULT_API_BASE_URL
}

function isMiniappFrontendMockEnabled() {
  try {
    const stored = wx.getStorageSync(MOCK_ENABLED_KEY)
    if (stored === '' || stored === undefined || stored === null) {
      return DEFAULT_FRONTEND_MOCK_ENABLED
    }
    return stored === true || stored === 'true' || stored === 1 || stored === '1'
  } catch (error) {
    return DEFAULT_FRONTEND_MOCK_ENABLED
  }
}

module.exports = {
  DEFAULT_API_BASE_URL,
  getApiBaseUrl,
  isMiniappFrontendMockEnabled,
  TOKEN_KEY: 'miniapp_auth_token',
  USER_KEY: 'miniapp_auth_user',
  REFERRER_KEY: 'miniapp_referrer_uid',
  MOCK_ENABLED_KEY
}
