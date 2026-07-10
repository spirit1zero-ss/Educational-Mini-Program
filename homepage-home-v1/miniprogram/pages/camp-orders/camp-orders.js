const CAMP_PATH = '/pages/module-5-camp/module-5-camp'
const REGISTRATION_PATH = '/pages/member-registration/member-registration'
const { hasAuthToken } = require('../../utils/request')
const {
  getTrainingCampOrders,
  payTrainingCampMemberOrder,
  cancelTrainingCampMemberOrder
} = require('../../api/mine')

Page({
  data: {
    navStyle: '',
    scrollStyle: '',
    activeStatus: 'all',
    actionLoadingOrderNo: '',
    isAuthed: false,
    summary: [
      { key: 'total', value: '0单', label: '累计订单' },
      { key: 'paid', value: '0单', label: '已支付' },
      { key: 'amount', value: '0元', label: '实付金额' }
    ],
    statusTabs: [
      { key: 'all', text: '全部', count: 0 },
      { key: 'paid', text: '已支付', count: 0 },
      { key: 'pending', text: '待支付', count: 0 },
      { key: 'closed', text: '已关闭', count: 0 }
    ],
    orders: [],
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
    if (!hasAuthToken()) {
      this.setData({
        isAuthed: false,
        orders: [],
        filteredOrders: [],
        summary: [
          { key: 'total', value: '0单', label: '累计订单' },
          { key: 'paid', value: '0单', label: '已支付' },
          { key: 'amount', value: '0元', label: '实付金额' }
        ],
        statusTabs: [
          { key: 'all', text: '全部', count: 0 },
          { key: 'paid', text: '已支付', count: 0 },
          { key: 'pending', text: '待支付', count: 0 },
          { key: 'closed', text: '已关闭', count: 0 }
        ]
      })
      return
    }

    this.setData({ isAuthed: true })
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
          statusText: item.statusText || (item.status === 'paid' ? '已支付' : '待支付'),
          canPay: !!item.canPay || item.status === 'pending',
          canCancel: !!item.canCancel || item.status === 'pending'
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
  },

  onRegistrationTap() {
    wx.navigateTo({
      url: REGISTRATION_PATH,
      fail: () => {
        wx.showToast({
          title: '登记表打开失败',
          icon: 'none'
        })
      }
    })
  },

  onPayTap(e) {
    const orderNo = e.currentTarget.dataset.orderNo
    if (!orderNo || this.data.actionLoadingOrderNo) return

    this.setData({ actionLoadingOrderNo: orderNo })
    wx.showLoading({ title: '发起支付中' })

    payTrainingCampMemberOrder({
      orderId: orderNo,
      payType: 'weixin'
    })
      .then((response) => {
        wx.hideLoading()
        const payment = response.data && response.data.payment
        const payInfo = payment && payment.payInfo
        const jsConfig = payInfo && payInfo.jsConfig

        if (!jsConfig || typeof wx.requestPayment !== 'function') {
          wx.showToast({
            title: '支付接口待接入',
            icon: 'none'
          })
          return
        }

        wx.requestPayment(Object.assign({}, jsConfig, {
          success: () => {
            wx.showModal({
              title: '支付成功',
              content: '请完善会员登记信息，方便老师后续跟进。',
              confirmText: '去填写',
              cancelText: '稍后',
              success: (result) => {
                this.loadTrainingCampOrders()
                if (result.confirm) {
                  wx.navigateTo({ url: `${REGISTRATION_PATH}?from=pay_success` })
                }
              }
            })
          },
          fail: () => {
            wx.showToast({
              title: '支付未完成',
              icon: 'none'
            })
          }
        }))
      })
      .catch((error) => {
        wx.hideLoading()
        wx.showToast({
          title: (error && error.message) || '支付暂不可用',
          icon: 'none'
        })
      })
      .then(() => {
        this.setData({ actionLoadingOrderNo: '' })
      })
  },

  onCancelTap(e) {
    const orderNo = e.currentTarget.dataset.orderNo
    if (!orderNo || this.data.actionLoadingOrderNo) return

    wx.showModal({
      title: '取消订单',
      content: '确认取消这笔待支付订单吗？',
      confirmText: '取消订单',
      confirmColor: '#b45309',
      success: (result) => {
        if (!result.confirm) return

        this.setData({ actionLoadingOrderNo: orderNo })
        cancelTrainingCampMemberOrder({ orderId: orderNo })
          .then(() => {
            wx.showToast({
              title: '订单已取消',
              icon: 'success'
            })
            this.loadTrainingCampOrders()
          })
          .catch((error) => {
            wx.showToast({
              title: (error && error.message) || '取消失败',
              icon: 'none'
            })
          })
          .then(() => {
            this.setData({ actionLoadingOrderNo: '' })
          })
      }
    })
  }
})
