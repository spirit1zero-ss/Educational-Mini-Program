const PROMO_POSTER_PATH = '/packages/features/pages/promo-poster/promo-poster'
const { getInviteRecords } = require('../../../../api/mine')

Page({
  data: {
    navStyle: '',
    scrollStyle: '',
    memberUid: '',
    activeStatus: 'all',
    summary: [
      { key: 'invited', value: '0人', label: '累计邀请' },
      { key: 'registered', value: '0人', label: '已报名' },
      { key: 'reward', value: '0元', label: '预计奖励' }
    ],
    statusTabs: [
      { key: 'all', text: '全部', count: 0 },
      { key: 'registered', text: '已报名', count: 0 },
      { key: 'pending', text: '待转化', count: 0 },
      { key: 'settled', text: '已结算', count: 0 }
    ],
    records: [],
    filteredRecords: []
  },

  onLoad(options) {
    this.setNavigationMetrics()

    if (options && options.uid) {
      this.setData({ memberUid: options.uid })
    }

    this.loadInviteRecords()
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

  loadInviteRecords() {
    wx.showNavigationBarLoading()

    getInviteRecords({ grade: 0 })
      .then((response) => {
        const data = response && response.data ? response.data : {}
        const source = Array.isArray(data.list) ? data.list : []
        const records = source.map((item, index) => {
          const orderCount = Number(item.orderCount || item.order_count || 0)
          const status = item.status || (orderCount > 0 ? 'registered' : 'pending')

          return {
            id: String(item.uid || item.id || index),
            avatar: item.avatar || '',
            name: item.nickname || item.name || '',
            phone: item.phone || '',
            time: item.time || item.add_time || '',
            source: item.source || '',
            status,
            statusText: item.statusText || (status === 'registered' ? '\u5df2\u62a5\u540d' : '\u5f85\u8f6c\u5316'),
            reward: item.reward || item.number || '',
            rewardState: item.rewardState || ''
          }
        })

        const registeredCount = records.filter((item) => item.status === 'registered').length
        const pendingCount = records.filter((item) => item.status === 'pending').length
        const rewardAmount = records.reduce((sum, item) => {
          const value = Number(String(item.reward || 0).replace(/[^0-9.-]/g, ''))
          return sum + (Number.isFinite(value) ? value : 0)
        }, 0)
        const backendSummary = data.summary || {}
        const invitedCount = backendSummary.invitedCount !== undefined
          ? Number(backendSummary.invitedCount)
          : records.length
        const backendRegisteredCount = backendSummary.registeredCount !== undefined
          ? Number(backendSummary.registeredCount)
          : registeredCount
        const statusTabs = this.data.statusTabs.map((item) => {
          const countMap = {
            all: records.length,
            registered: registeredCount,
            pending: pendingCount,
            settled: records.filter((record) => record.status === 'settled').length
          }
          return Object.assign({}, item, { count: countMap[item.key] || 0 })
        })

        this.setData({
          records,
          statusTabs,
          summary: this.data.summary.map((item) => {
            if (item.key === 'invited') return Object.assign({}, item, { value: invitedCount + '\u4eba' })
            if (item.key === 'registered') return Object.assign({}, item, { value: backendRegisteredCount + '\u4eba' })
            if (item.key === 'reward') return Object.assign({}, item, { value: rewardAmount.toFixed(2) + '\u5143' })
            return item
          })
        }, () => {
          this.updateFilteredRecords()
        })
      })
      .catch((error) => {
        console.warn('[invite-records] load backend records failed:', error)
        this.setData({
          records: [],
          filteredRecords: [],
          summary: this.data.summary.map((item) => Object.assign({}, item, {
            value: item.key === 'reward' ? '0\u5143' : '0\u4eba'
          })),
          statusTabs: this.data.statusTabs.map((item) => Object.assign({}, item, { count: 0 }))
        })
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

  onPosterTap() {
    wx.navigateTo({
      url: `${PROMO_POSTER_PATH}?uid=${this.data.memberUid}`,
      fail: () => {
        wx.showToast({
          title: '推广海报打开失败',
          icon: 'none'
        })
      }
    })
  }
})
