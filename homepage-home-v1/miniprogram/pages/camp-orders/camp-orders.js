const CAMP_PATH = '/pages/module-5-camp/module-5-camp'

Page({
  data: {
    navStyle: '',
    scrollStyle: '',
    activeStatus: 'all',
    summary: [
      { key: 'total', value: '3单', label: '累计订单' },
      { key: 'paid', value: '2单', label: '已支付' },
      { key: 'amount', value: '798元', label: '实付金额' }
    ],
    statusTabs: [
      { key: 'all', text: '全部', count: 3 },
      { key: 'paid', text: '已支付', count: 2 },
      { key: 'pending', text: '待支付', count: 1 },
      { key: 'closed', text: '已关闭', count: 0 }
    ],
    orders: [
      {
        id: 'O2026063001',
        title: '21天自主学习训练营',
        buyer: '陈同学家长',
        phone: '138****9261',
        orderNo: 'MP202606301018',
        time: '2026-06-30 10:18',
        amount: '399元',
        status: 'paid',
        statusText: '已支付'
      },
      {
        id: 'O2026062902',
        title: '21天自主学习训练营',
        buyer: '周同学家长',
        phone: '186****4308',
        orderNo: 'MP202606292104',
        time: '2026-06-29 21:04',
        amount: '399元',
        status: 'paid',
        statusText: '已支付'
      },
      {
        id: 'O2026062803',
        title: '21天自主学习训练营',
        buyer: '林同学家长',
        phone: '159****7812',
        orderNo: 'MP202606281642',
        time: '2026-06-28 16:42',
        amount: '399元',
        status: 'pending',
        statusText: '待支付'
      }
    ],
    filteredOrders: []
  },

  onLoad() {
    this.setNavigationMetrics()
    this.updateFilteredOrders()
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
        scrollStyle: `height:calc(100vh - ${navHeight}px);`
      })
    } catch (error) {
      this.setData({
        navStyle: `height:${fallbackNavHeight}px;padding-top:44px;padding-right:110px;`,
        scrollStyle: `height:calc(100vh - ${fallbackNavHeight}px);`
      })
    }
  },

  updateFilteredOrders() {
    const { activeStatus, orders } = this.data
    const filteredOrders = activeStatus === 'all'
      ? orders
      : orders.filter((item) => item.status === activeStatus)

    this.setData({ filteredOrders })
  },

  onBackTap() {
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({ url: '/pages/mine/mine' })
      }
    })
  },

  onStatusTap(e) {
    const key = e.currentTarget.dataset.key
    if (!key || key === this.data.activeStatus) return

    this.setData({ activeStatus: key }, () => {
      this.updateFilteredOrders()
    })
  },

  onCampTap() {
    wx.navigateTo({
      url: CAMP_PATH,
      fail: () => {
        wx.showToast({
          title: '训练营页面打开失败',
          icon: 'none'
        })
      }
    })
  }
})
