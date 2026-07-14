const {
  CLOUD_ENV_ID,
  CLOUD_SERVICE_NAME,
  getApiBaseUrl,
  TOKEN_KEY,
  USER_KEY,
  REFERRER_KEY
} = require('../config/api')

let loginTask = null

function buildUrl(url) {
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  const baseUrl = getApiBaseUrl().replace(/\/$/, '')
  const isLocalHttp = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(baseUrl)
  if (!baseUrl || (!/^https:\/\//i.test(baseUrl) && !isLocalHttp)) {
    throw new Error('请先配置 HTTPS API 地址')
  }
  const path = url.charAt(0) === '/' ? url : `/${url}`
  return `${baseUrl}${path}`
}

function rawRequest(options) {
  return new Promise((resolve, reject) => {
    const baseUrl = getApiBaseUrl()
    const requestOptions = {
      method: options.method || 'GET',
      data: options.data || {},
      header: options.header || {},
      success: (response) => {
        const body = response.data || {}
        const statusCode = response.statusCode
        const businessStatus = body.status || body.code

        if (statusCode >= 200 && statusCode < 300 && (businessStatus === undefined || Number(businessStatus) === 200)) {
          resolve(body)
          return
        }

        reject({
          statusCode,
          data: body,
          message: body.msg || body.message || '请求失败'
        })
      },
      fail: reject
    }

    if (baseUrl) {
      wx.request(Object.assign(requestOptions, {
        url: buildUrl(options.url)
      }))
      return
    }

    wx.cloud.callContainer(Object.assign(requestOptions, {
      config: {
        env: CLOUD_ENV_ID
      },
      path: options.url.charAt(0) === '/' ? options.url : `/${options.url}`,
      header: Object.assign({}, requestOptions.header, {
        'X-WX-SERVICE': CLOUD_SERVICE_NAME
      })
    }))
  })
}

function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (result) => {
        if (result.code) {
          resolve(result.code)
          return
        }

        reject(new Error('wx.login 未返回 code'))
      },
      fail: reject
    })
  })
}

function saveAuth(data) {
  const token = data && data.token
  const user = data && data.user

  if (token) {
    wx.setStorageSync(TOKEN_KEY, token)
  }

  if (user) {
    wx.setStorageSync(USER_KEY, user)
  }

  return data
}

function hasAuthToken() {
  return !!wx.getStorageSync(TOKEN_KEY)
}

function clearAuth() {
  wx.removeStorageSync(TOKEN_KEY)
  wx.removeStorageSync(USER_KEY)
}

function login(options) {
  const force = options && options.force
  const token = wx.getStorageSync(TOKEN_KEY)

  if (token && !force) {
    return Promise.resolve({
      token,
      user: wx.getStorageSync(USER_KEY) || null
    })
  }

  if (loginTask) {
    return loginTask
  }

  loginTask = wxLogin().then((code) => {
    const referrerUid = wx.getStorageSync(REFERRER_KEY) || ''

    return rawRequest({
      url: '/api/miniapp/auth/login',
      method: 'POST',
      data: {
        code,
        referrerUid
      },
      header: {
        'content-type': 'application/json',
        'Form-type': 'routine'
      }
    }).then((body) => saveAuth(body.data || {}))
  }).then((data) => {
    loginTask = null
    return data
  }).catch((error) => {
    loginTask = null
    throw error
  })

  return loginTask
}

function request(options) {
  const token = wx.getStorageSync(TOKEN_KEY)
  const noAuth = !!options.noAuth
  const header = Object.assign({
    'content-type': 'application/json',
    'Form-type': 'routine'
  }, options.header || {})

  if (token && !noAuth) {
    header.Authorization = token.indexOf('Bearer ') === 0 ? token : `Bearer ${token}`
  }

  const doRequest = () => rawRequest(Object.assign({}, options, { header }))

  if (!token && !noAuth) {
    return login().then(() => request(options))
  }

  return doRequest().catch((error) => {
    const unauthorized = error && (error.statusCode === 401 || error.statusCode === 403)

    if (!noAuth && unauthorized && options.retryAuth !== false) {
      wx.removeStorageSync(TOKEN_KEY)
      return login().then(() => request(Object.assign({}, options, { retryAuth: false })))
    }

    throw error
  })
}

function get(url, data, options) {
  return request(Object.assign({}, options || {}, {
    url,
    data,
    method: 'GET'
  }))
}

function post(url, data, options) {
  return request(Object.assign({}, options || {}, {
    url,
    data,
    method: 'POST'
  }))
}

module.exports = {
  request,
  get,
  post,
  login,
  hasAuthToken,
  clearAuth,
  TOKEN_KEY,
  USER_KEY,
  REFERRER_KEY
}
