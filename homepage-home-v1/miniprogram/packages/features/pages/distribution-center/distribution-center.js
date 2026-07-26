const PROMO_POSTER_PATH = '/packages/features/pages/promo-poster/promo-poster'
const INVITE_RECORDS_PATH = '/packages/features/pages/invite-records/invite-records'
const MY_INCOME_PATH = '/packages/features/pages/my-income/my-income'
const REFERRAL_RULES_PATH = '/packages/features/pages/referral-rules/referral-rules'
const {
  getMineOverview,
  getIncomeRecords,
  getWithdrawalOverview,
  createReferralPoster
} = require('../../../../api/mine')

Page({
  data: {
    navStyle: '',
    scrollStyle: '',
    loading: true,
    memberUid: '',
    identity: null,
    canPromote: false,
    money: {
      totalAmount: '0.00',
      availableAmount: '0.00',
      pendingAmount: '0.00',
      withdrawnAmount: '0.00',
      refundAmount: '0.00',
      debtAmount: '0.00'
    },
    debtActive: false,
    quota: {
      initial: 1,
      used: 0,
      remaining: 1,
      limited: false,
      percent: 0
    },
    team: {
      total: 0,
      first: 0,
      second: 0
    },
    actions: [
      { key: 'poster', title: '推广海报', desc: '生成专属邀请海报', icon: '/assets/mine/icon-promo-poster.svg' },
      { key: 'team', title: '我的团队', desc: '查看一、二级成员', icon: '/assets/mine/icon-invite-record.svg' },
      { key: 'income', title: '收益与提现', desc: '查看账单及申请提现', icon: '/assets/mine/icon-income.svg' },
      { key: 'rules', title: '分销规则', desc: '了解返佣和退款规则', icon: '/assets/mine/icon-referral.svg' }
    ],
    recentRecords: []
  },

  onLoad() {
    this.setNavigationMetrics()
  },

  onShow() {
    this.loadCenter()
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

  loadCenter() {
    if (this._centerRequest) return this._centerRequest
    this.setData({ loading: true })
    wx.showNavigationBarLoading && wx.showNavigationBarLoading()

    this._centerRequest = Promise.all([
      getMineOverview(),
      getIncomeRecords({ type: 3, page: 1, limit: 20 }),
      getWithdrawalOverview()
    ])
      .then(([overviewResponse, incomeResponse, withdrawalResponse]) => {
        const overview = (overviewResponse && overviewResponse.data) || {}
        const member = overview.member || {}
        const referral = overview.referral || {}
        const income = (incomeResponse && incomeResponse.data) || {}
        const withdrawal = (withdrawalResponse && withdrawalResponse.data) || {}
        const summary = income.summary || {}
        const identity = referral.identity || member.distributionIdentity || null
        const initial = Number(referral.teamInitialQuota || (identity && identity.initialQuota) || 1)
        const used = Number(referral.usedQuota || 0)
        const remaining = Number(
          referral.remainingQuota === undefined ? Math.max(0, initial - used) : referral.remainingQuota
        )
        const limited = !!referral.quotaLimited
        const debtAmount = Number(withdrawal.debtAmount || summary.debtAmount || 0)
        const records = (Array.isArray(income.list) ? income.list : []).slice(0, 5).map((item, index) => {
          const pm = Number(item.pm === undefined ? 1 : item.pm)
          const amount = Number(item.amount || item.number || 0)
          const status = item.statusKey || 'available'
          return {
            id: String(item.id || index),
            title: item.title || item.typeText || '返佣记录',
            desc: item.desc || item.mark || '',
            time: item.time || item.add_time || '',
            amountText: `${pm === 0 ? '-' : '+'}${amount.toFixed(2)}`,
            tone: pm === 0 ? 'danger' : (status === 'rejected' ? 'muted' : 'positive'),
            statusText: item.statusText || ''
          }
        })

        this.setData({
          memberUid: member.uid || '',
          identity,
          canPromote: !!referral.canPromote,
          money: {
            totalAmount: summary.totalAmount || referral.incomeAmount || '0.00',
            availableAmount: withdrawal.availableAmount || summary.availableAmount || '0.00',
            pendingAmount: summary.pendingAmount || '0.00',
            withdrawnAmount: summary.withdrawnAmount || referral.withdrawnAmount || '0.00',
            refundAmount: summary.refundAmount || '0.00',
            debtAmount: debtAmount.toFixed(2)
          },
          debtActive: debtAmount > 0,
          quota: {
            initial,
            used,
            remaining,
            limited,
            percent: limited && initial > 0 ? Math.min(100, Math.round((used / initial) * 100)) : 0
          },
          team: {
            total: Number(referral.invitedCount || referral.inviteCount || 0),
            first: Number(referral.firstLevelCount || 0),
            second: Number(referral.secondLevelCount || 0)
          },
          recentRecords: records
        })
      })
      .catch((error) => {
        wx.showToast({
          title: (error && (error.message || error.msg)) || '分销中心加载失败',
          icon: 'none'
        })
      })
      .finally(() => {
        this._centerRequest = null
        this.setData({ loading: false })
        wx.hideNavigationBarLoading && wx.hideNavigationBarLoading()
      })

    return this._centerRequest
  },

  onBackTap() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: '/pages/mine/mine' })
    })
  },

  onActionTap(e) {
    const key = e.currentTarget.dataset.key
    if (key === 'poster') {
      this.createPoster()
      return
    }
    const paths = {
      team: `${INVITE_RECORDS_PATH}?uid=${encodeURIComponent(this.data.memberUid)}`,
      income: `${MY_INCOME_PATH}?uid=${encodeURIComponent(this.data.memberUid)}`,
      rules: REFERRAL_RULES_PATH
    }
    if (paths[key]) {
      wx.navigateTo({ url: paths[key] })
    }
  },

  onViewAllRecords() {
    wx.navigateTo({
      url: `${MY_INCOME_PATH}?uid=${encodeURIComponent(this.data.memberUid)}`
    })
  },

  createPoster() {
    if (!this.data.canPromote) {
      wx.showToast({ title: '当前推广资格不可用', icon: 'none' })
      return
    }
    wx.showLoading({ title: '生成中' })
    createReferralPoster({ page: 'pages/home/home' })
      .then((response) => {
        const poster = (response && response.data) || {}
        if (!poster.codeUrl) {
          throw new Error('报名码生成失败')
        }
        const query = [
          `uid=${encodeURIComponent(this.data.memberUid)}`,
          poster.posterUrl ? `posterUrl=${encodeURIComponent(poster.posterUrl)}` : '',
          `codeUrl=${encodeURIComponent(poster.codeUrl)}`,
          poster.sharePath ? `sharePath=${encodeURIComponent(poster.sharePath)}` : ''
        ].filter(Boolean).join('&')
        wx.navigateTo({ url: `${PROMO_POSTER_PATH}?${query}` })
      })
      .catch((error) => {
        wx.showToast({ title: (error && error.message) || '海报生成失败', icon: 'none' })
      })
      .finally(() => wx.hideLoading())
  }
})
