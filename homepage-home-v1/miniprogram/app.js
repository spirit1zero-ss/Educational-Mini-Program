const { REFERRER_KEY, login } = require('./utils/request')
const { isMiniappFrontendMockEnabled } = require('./config/api')
const {
  ensureMockLogin,
  shouldUseMockFallback
} = require('./utils/mock-miniapp')

App({
  globalData: {
    menuButton: null,
    referrerUid: '',
    authReady: null
  },

  onLaunch(options) {
    if (wx.getMenuButtonBoundingClientRect) {
      this.globalData.menuButton = wx.getMenuButtonBoundingClientRect()
    }

    this.captureReferrer(options)
    this.silentLogin()
  },

  onShow(options) {
    this.captureReferrer(options)
  },

  captureReferrer(options) {
    const query = (options && options.query) || {}
    const scene = query.scene ? decodeURIComponent(query.scene) : ''
    const refFromScene = scene.split('&').reduce((target, part) => {
      const pair = part.split('=')
      return pair[0] === 'ref' ? pair[1] : target
    }, '')
    const referrerUid = query.ref || query.referrerUid || refFromScene

    if (!referrerUid) {
      return
    }

    this.globalData.referrerUid = referrerUid
    wx.setStorageSync(REFERRER_KEY, referrerUid)
  },

  silentLogin() {
    if (isMiniappFrontendMockEnabled()) {
      this.globalData.authReady = ensureMockLogin()
      return this.globalData.authReady
    }

    this.globalData.authReady = login({
      force: true
    }).catch((error) => {
      console.warn('miniapp silent login failed', error)
      if (shouldUseMockFallback(error)) {
        return ensureMockLogin()
      }
      return null
    })

    return this.globalData.authReady
  }
})
