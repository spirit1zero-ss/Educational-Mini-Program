const HOME_PATH = '/pages/home/home'
const MINE_PATH = '/pages/mine/mine'

Page({
  data: {
    navStyle: '',
    scrollStyle: '',
    heroIcon: '../../assets/mine/tab-offline-active.svg',
    stores: [
      {
        id: 'hangzhou',
        name: '杭州线下体验点',
        city: '杭州',
        address: '详细地址待后台配置',
        service: '训练营咨询 / 线下体验 / 家长沟通',
        status: '待开放'
      },
      {
        id: 'ningbo',
        name: '宁波线下体验点',
        city: '宁波',
        address: '详细地址待后台配置',
        service: '训练营咨询 / 学习规划',
        status: '筹备中'
      },
      {
        id: 'shaoxing',
        name: '绍兴线下体验点',
        city: '绍兴',
        address: '详细地址待后台配置',
        service: '训练营咨询 / 家长交流',
        status: '筹备中'
      }
    ],
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
    wx.showToast({
      title: item && item.address !== '详细地址待后台配置' ? '导航待接入' : '地址待后台配置',
      icon: 'none'
    })
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
