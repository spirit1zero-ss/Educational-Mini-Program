const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8011'

function getApiBaseUrl() {
  return wx.getStorageSync('miniapp_api_base_url') || DEFAULT_API_BASE_URL
}

module.exports = {
  DEFAULT_API_BASE_URL,
  getApiBaseUrl,
  TOKEN_KEY: 'miniapp_auth_token',
  USER_KEY: 'miniapp_auth_user',
  REFERRER_KEY: 'miniapp_referrer_uid'
}
