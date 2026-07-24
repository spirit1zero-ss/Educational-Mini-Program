const PROMO_POSTER_PATH = '/packages/features/pages/promo-poster/promo-poster'
const { getInviteRecords } = require('../../../../api/mine')

Page({
  data: {
    navStyle: '',
    scrollStyle: '',
    memberUid: '',
    identity: null,
    activeStatus: 'first',
    summary: [
      { key: 'quota', value: '1', label: '团队初始名额' },
      { key: 'pullNew', value: '0人', label: '分销拉新人数' },
      { key: 'first', value: '0人', label: '一级团队' },
      { key: 'second', value: '0人', label: '二级团队' }
    ],
    statusTabs: [
      { key: 'first', text: '一级团队', count: 0 },
      { key: 'second', text: '二级团队', count: 0 }
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

    const grade = this.data.activeStatus === 'second' ? 1 : 0
    getInviteRecords({ grade })
      .then((response) => {
        const data = response && response.data ? response.data : {}
        const source = Array.isArray(data.list) ? data.list : []
        const records = source.map((item, index) => {
          const orderCount = Number(item.orderCount || item.order_count || 0)
          const status = item.status || (orderCount > 0 ? 'registered' : 'pending')
          const name = item.nickname || item.name || ''

          return {
            id: String(item.uid || item.id || index),
            avatar: item.avatar || '',
            avatarText: name ? name.slice(0, 1) : '友',
            name,
            phone: item.phone || '',
            time: item.time || item.add_time || '',
            source: item.source || '',
            status,
            statusText: item.statusText || (status === 'registered' ? '\u5df2\u62a5\u540d' : '\u5f85\u8f6c\u5316'),
            reward: item.reward || item.number || '',
            rewardState: item.rewardState || ''
          }
        })

        const backendSummary = data.summary || {}
        const firstLevelCount = Number(backendSummary.firstLevelCount || 0)
        const secondLevelCount = Number(backendSummary.secondLevelCount || 0)
        const statusTabs = this.data.statusTabs.map((item) => {
          const countMap = { first: firstLevelCount, second: secondLevelCount }
          return Object.assign({}, item, { count: countMap[item.key] || 0 })
        })

        this.setData({
          identity: data.identity || null,
          records,
          filteredRecords: records,
          statusTabs,
          summary: this.data.summary.map((item) => {
            if (item.key === 'quota') return Object.assign({}, item, { value: String(backendSummary.teamInitialQuota || 1) })
            if (item.key === 'pullNew') return Object.assign({}, item, { value: `${Number(backendSummary.pullNewCount || 0)}人` })
            if (item.key === 'first') return Object.assign({}, item, { value: `${firstLevelCount}人` })
            if (item.key === 'second') return Object.assign({}, item, { value: `${secondLevelCount}人` })
            return item
          })
        })
      })
      .catch((error) => {
        console.warn('[invite-records] load backend records failed:', error)
        this.setData({
          records: [],
          filteredRecords: [],
          summary: this.data.summary.map((item) => Object.assign({}, item, {
            value: item.key === 'quota' ? '1' : '0\u4eba'
          })),
          statusTabs: this.data.statusTabs.map((item) => Object.assign({}, item, { count: 0 }))
        })
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

    this.setData({ activeStatus: key, records: [], filteredRecords: [] }, () => this.loadInviteRecords())
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
