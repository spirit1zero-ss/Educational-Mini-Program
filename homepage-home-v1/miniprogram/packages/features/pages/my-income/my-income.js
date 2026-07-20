const INVITE_RECORDS_PATH = '/packages/features/pages/invite-records/invite-records'
const { getIncomeRecords } = require('../../../../api/mine')

Page({
  data: {
    navStyle: '',
    scrollStyle: '',
    memberUid: 'A10293',
    activeStatus: 'all',
    summary: [
      { key: 'available', value: '0元', label: '可提现' },
      { key: 'pending', value: '120元', label: '待结算' },
      { key: 'settled', value: '60元', label: '已到账' }
    ],
    statusTabs: [
      { key: 'all', text: '全部', count: 5 },
      { key: 'pending', text: '待结算', count: 2 },
      { key: 'settled', text: '已到账', count: 1 },
      { key: 'withdraw', text: '提现', count: 2 }
    ],
    records: [
      {
        id: 'I2026063001',
        title: '陈同学家长报名奖励',
        desc: '训练营订单完成后结算',
        time: '2026-06-30 10:18',
        amount: '+60元',
        status: 'pending',
        statusText: '待结算'
      },
      {
        id: 'I2026062902',
        title: '周同学家长报名奖励',
        desc: '训练营订单完成后结算',
        time: '2026-06-29 21:04',
        amount: '+60元',
        status: 'pending',
        statusText: '待结算'
      },
      {
        id: 'I2026062103',
        title: '赵同学家长报名奖励',
        desc: '推广奖励已到账',
        time: '2026-06-21 19:30',
        amount: '+60元',
        status: 'settled',
        statusText: '已到账'
      },
      {
        id: 'W2026062001',
        title: '提现申请',
        desc: '后台审核中',
        time: '2026-06-20 11:12',
        amount: '-60元',
        status: 'withdraw',
        statusText: '审核中'
      },
      {
        id: 'W2026061801',
        title: '提现到账',
        desc: '已打款至绑定账户',
        time: '2026-06-18 15:40',
        amount: '-80元',
        status: 'withdraw',
        statusText: '已完成'
      }
    ],
    filteredRecords: []
  },

  onLoad(options) {
    this.setNavigationMetrics()

    if (options && options.uid) {
      this.setData({ memberUid: options.uid })
    }

    this.loadIncomeRecords()
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

  loadIncomeRecords() {
    wx.showNavigationBarLoading()

    getIncomeRecords({ type: 3 })
      .then((response) => {
        const data = response && response.data ? response.data : {}
        const source = Array.isArray(data.list) ? data.list : []
        if (!source.length) {
          this.updateFilteredRecords()
          return
        }

        const records = source.map((item, index) => {
          const pm = Number(item.pm || 1)
          const amount = Number(item.number || item.amount || 0)
          const status = item.statusKey || (item.type === 'extract' ? 'withdraw' : 'settled')

          return {
            id: String(item.id || index),
            title: item.title || '',
            desc: item.mark || item.desc || '',
            time: item.add_time || item.time || '',
            amount: (pm === 0 ? '-' : '+') + amount.toFixed(2),
            status,
            statusText: item.statusText || (status === 'withdraw' ? '\u63d0\u73b0' : '\u5df2\u5230\u8d26')
          }
        })

        const available = records
          .filter((item) => item.status !== 'withdraw')
          .reduce((sum, item) => sum + Number(String(item.amount).replace('+', '')), 0)

        const statusTabs = this.data.statusTabs.map((item) => {
          const count = item.key === 'all'
            ? records.length
            : records.filter((record) => record.status === item.key).length
          return Object.assign({}, item, { count })
        })

        this.setData({
          records,
          statusTabs,
          summary: this.data.summary.map((item) => {
            const backendSummary = data.summary || {}
            if (item.key === 'available') return Object.assign({}, item, { value: `${backendSummary.availableAmount || available.toFixed(2)}元` })
            if (item.key === 'pending') return Object.assign({}, item, { value: `${backendSummary.pendingAmount || '0.00'}元` })
            if (item.key === 'settled') return Object.assign({}, item, { value: `${backendSummary.settledAmount || backendSummary.totalAmount || '0.00'}元` })
            return item
          })
        }, () => {
          this.updateFilteredRecords()
        })
      })
      .catch((error) => {
        console.warn('[my-income] load backend records failed:', error)
        this.updateFilteredRecords()
      })
      .finally(() => {
        wx.hideNavigationBarLoading()
      })
  },

  updateFilteredRecords() {
    const { activeStatus, records } = this.data
    const filteredRecords = activeStatus === 'all'
      ? records
      : records.filter((item) => item.status === activeStatus)

    this.setData({ filteredRecords })
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
      this.updateFilteredRecords()
    })
  },

  onWithdrawTap() {
    wx.showToast({
      title: '提现接口待接入',
      icon: 'none'
    })
  },

  onInviteTap() {
    wx.navigateTo({
      url: `${INVITE_RECORDS_PATH}?uid=${this.data.memberUid}`,
      fail: () => {
        wx.showToast({
          title: '邀请记录打开失败',
          icon: 'none'
        })
      }
    })
  }
})
