const CAMP_PATH = '/pages/module-5-camp/module-5-camp'
const { getTrainingCampOrders } = require('../../api/mine')

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
    this.loadTrainingCampOrders()
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

  loadTrainingCampOrders() {
    wx.showNavigationBarLoading()

    getTrainingCampOrders()
      .then((response) => {
        const data = response && response.data ? response.data : {}
        const source = Array.isArray(data.list) ? data.list : []
        const orders = source.map((item, index) => ({
          id: String(item.id || index),
          title: item.title || '21天自主学习训练营',
          buyer: item.buyer || item.nickname || '',
          phone: item.phone || '',
          orderNo: item.orderNo || item.order_id || '',
          time: item.time || item.add_time || '',
          amount: item.amountText || (item.amount ? `${item.amount}元` : '0元'),
          status: item.status || 'pending',
          statusText: item.statusText || (item.status === 'paid' ? '已支付' : '待支付')
        }))
        const summary = data.summary || {}
        const paidCount = Number(summary.paidCount || orders.filter((item) => item.status === 'paid').length)
        const pendingCount = Number(summary.pendingCount || orders.filter((item) => item.status === 'pending').length)
        const closedCount = Number(summary.closedCount || orders.filter((item) => item.status === 'closed').length)
        const totalCount = Number(summary.totalCount || orders.length)
        const paidAmount = summary.paidAmount || orders
          .filter((item) => item.status === 'paid')
          .reduce((sum, item) => sum + Number(String(item.amount).replace('元', '') || 0), 0)
          .toFixed(2)

        this.setData({
          orders,
          summary: [
            { key: 'total', value: `${totalCount}单`, label: '累计订单' },
            { key: 'paid', value: `${paidCount}单`, label: '已支付' },
            { key: 'amount', value: `${paidAmount}元`, label: '实付金额' }
          ],
          statusTabs: [
            { key: 'all', text: '全部', count: totalCount },
            { key: 'paid', text: '已支付', count: paidCount },
            { key: 'pending', text: '待支付', count: pendingCount },
            { key: 'closed', text: '已关闭', count: closedCount }
          ]
        }, () => {
          this.updateFilteredOrders()
        })
      })
      .catch((error) => {
        console.warn('[camp-orders] load backend orders failed:', error)
        this.updateFilteredOrders()
      })
      .finally(() => {
        wx.hideNavigationBarLoading()
      })
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
