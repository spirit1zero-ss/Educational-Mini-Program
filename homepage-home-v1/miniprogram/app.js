const { REFERRER_KEY } = require('./utils/request')
const { CLOUD_ENV_ID } = require('./config/api')

App({
  globalData: {
    menuButton: null,
    referrerUid: ''
  },

  onLaunch(options) {
    wx.cloud.init({
      env: CLOUD_ENV_ID,
      traceUser: true
    })

    if (wx.getMenuButtonBoundingClientRect) {
      this.globalData.menuButton = wx.getMenuButtonBoundingClientRect()
    }

    this.captureReferrer(options)
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
  }
})
