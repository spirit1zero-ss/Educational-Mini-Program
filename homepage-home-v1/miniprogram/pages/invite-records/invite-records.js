const PROMO_POSTER_PATH = '/pages/promo-poster/promo-poster'
const { getInviteRecords } = require('../../api/mine')

Page({
  data: {
    navStyle: '',
    scrollStyle: '',
    memberUid: 'A10293',
    activeStatus: 'all',
    summary: [
      { key: 'invited', value: '6人', label: '累计邀请' },
      { key: 'registered', value: '2人', label: '已报名' },
      { key: 'reward', value: '120元', label: '预计奖励' }
    ],
    statusTabs: [
      { key: 'all', text: '全部', count: 6 },
      { key: 'registered', text: '已报名', count: 2 },
      { key: 'pending', text: '待转化', count: 3 },
      { key: 'settled', text: '已结算', count: 1 }
    ],
    records: [
      {
        id: 'R2026063001',
        avatar: '陈',
        name: '陈同学家长',
        phone: '138****9261',
        time: '2026-06-30 10:18',
        source: '推广海报扫码',
        status: 'registered',
        statusText: '已报名',
        reward: '60元',
        rewardState: '待结算'
      },
      {
        id: 'R2026062902',
        avatar: '周',
        name: '周同学家长',
        phone: '186****4308',
        time: '2026-06-29 21:04',
        source: '好友分享进入',
        status: 'registered',
        statusText: '已报名',
        reward: '60元',
        rewardState: '待结算'
      },
      {
        id: 'R2026062803',
        avatar: '林',
        name: '林同学家长',
        phone: '159****7812',
        time: '2026-06-28 16:42',
        source: '推广海报扫码',
        status: 'pending',
        statusText: '待转化',
        reward: '0元',
        rewardState: '报名后计奖'
      },
      {
        id: 'R2026062604',
        avatar: '王',
        name: '王同学家长',
        phone: '177****5920',
        time: '2026-06-26 09:36',
        source: '好友分享进入',
        status: 'pending',
        statusText: '待转化',
        reward: '0元',
        rewardState: '报名后计奖'
      },
      {
        id: 'R2026062505',
        avatar: '刘',
        name: '刘同学家长',
        phone: '135****2049',
        time: '2026-06-25 14:12',
        source: '推广海报扫码',
        status: 'pending',
        statusText: '待转化',
        reward: '0元',
        rewardState: '报名后计奖'
      },
      {
        id: 'R2026062106',
        avatar: '赵',
        name: '赵同学家长',
        phone: '189****6735',
        time: '2026-06-21 19:30',
        source: '推广海报扫码',
        status: 'settled',
        statusText: '已结算',
        reward: '60元',
        rewardState: '已到账'
      }
    ],
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
      .then((data) => {
        const source = Array.isArray(data && data.list) ? data.list : []
        if (!source.length) {
          this.updateFilteredRecords()
          return
        }

        const records = source.map((item, index) => {
          const orderCount = Number(item.orderCount || item.order_count || 0)
          const status = orderCount > 0 ? 'registered' : 'pending'

          return {
            id: String(item.uid || item.id || index),
            avatar: item.avatar || '',
            name: item.nickname || item.name || '',
            phone: item.phone || '',
            time: item.time || item.add_time || '',
            source: item.source || '',
            status,
            statusText: status === 'registered' ? '\u5df2\u62a5\u540d' : '\u5f85\u8f6c\u5316',
            reward: item.reward || item.number || '',
            rewardState: item.rewardState || ''
          }
        })

        const registeredCount = records.filter((item) => item.status === 'registered').length
        const pendingCount = records.filter((item) => item.status === 'pending').length
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
            if (item.key === 'invited') return Object.assign({}, item, { value: records.length + '\u4eba' })
            if (item.key === 'registered') return Object.assign({}, item, { value: registeredCount + '\u4eba' })
            return item
          })
        }, () => {
          this.updateFilteredRecords()
        })
      })
      .catch((error) => {
        console.warn('[invite-records] load backend records failed:', error)
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
