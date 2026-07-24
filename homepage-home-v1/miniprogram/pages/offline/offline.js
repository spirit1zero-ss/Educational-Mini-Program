const HOME_PATH = '/pages/home/home'
const MINE_PATH = '/pages/mine/mine'
const { getOfflineLocations } = require('../../api/mine')

Page({
  data: {
    navStyle: '',
    scrollStyle: '',
    heroIcon: '../../assets/mine/tab-offline-active.svg',
    stores: [],
    loading: true,
    tabs: [
      {
        key: 'home',
        text: '首页',
        icon: '../../assets/mine/tab-home.svg',
        activeIcon: '../../assets/mine/tab-home-active.svg',
        path: HOME_PATH
      },
      {
        key: 'mine',
        text: '我的',
        icon: '../../assets/mine/tab-mine.svg',
        activeIcon: '../../assets/mine/tab-mine-active.svg',
        path: MINE_PATH
      },
      {
        key: 'offline',
        text: '线下',
        icon: '../../assets/mine/tab-offline.svg',
        activeIcon: '../../assets/mine/tab-offline-active.svg',
        path: ''
      }
    ]
  },

  onLoad() {
    this.setNavigationMetrics()
    this.loadStores()
  },

  loadStores() {
    this.setData({ loading: true })
    return getOfflineLocations()
      .then((response) => {
        this.setData({
          stores: Array.isArray(response && response.data) ? response.data : []
        })
      })
      .catch((error) => {
        console.warn('[offline] load locations failed:', error)
        wx.showToast({
          title: error.message || error.errMsg || error.msg || '线下地址加载失败',
          icon: 'none'
        })
      })
      .finally(() => this.setData({ loading: false }))
  },

  setNavigationMetrics() {
    const fallbackNavHeight = 88
    try {
      const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
      const menu = wx.getMenuButtonBoundingClientRect()
      const navHeight = menu.bottom + 12
      const rightPadding = Math.max(windowInfo.windowWidth - menu.left + 12, 96)

      this.setData({
        navStyle: `height:${navHeight}px;padding-top:${menu.top}px;padding-right:${rightPadding}px;`,
        scrollStyle: `height:calc(100vh - ${navHeight}px - 112rpx - env(safe-area-inset-bottom));`
      })
    } catch (error) {
      this.setData({
        navStyle: `height:${fallbackNavHeight}px;padding-top:44px;padding-right:110px;`,
        scrollStyle: `height:calc(100vh - ${fallbackNavHeight}px - 112rpx - env(safe-area-inset-bottom));`
      })
    }
  },

  onStoreTap(e) {
    const item = e.currentTarget.dataset.item
    if (!item || !item.address) {
      wx.showToast({ title: '暂无可导航地址', icon: 'none' })
      return
    }
    const latitude = Number(item.latitude)
    const longitude = Number(item.longitude)
    if (Number.isFinite(latitude) && Number.isFinite(longitude) && latitude && longitude) {
      wx.openLocation({
        latitude,
        longitude,
        name: item.name || '线下体验点',
        address: item.address,
        scale: 16
      })
      return
    }
    wx.setClipboardData({
      data: item.address,
      success: () => wx.showToast({ title: '地址已复制', icon: 'success' })
    })
  },

  onCallPhone(e) {
    const phone = String(e.currentTarget.dataset.phone || '').trim()
    if (!phone) return
    wx.makePhoneCall({ phoneNumber: phone })
  },

  onTabTap(e) {
    const item = e.currentTarget.dataset.item
    if (!item || item.key === 'offline') return

    wx.redirectTo({
      url: item.path,
      fail: () => {
        wx.showToast({
          title: '页面打开失败',
          icon: 'none'
        })
      }
    })
  }
})
