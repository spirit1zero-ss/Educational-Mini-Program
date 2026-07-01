const CAMP_PATH = '/pages/module-5-camp/module-5-camp'
const PROMO_POSTER_PATH = '/pages/promo-poster/promo-poster'
const INVITE_RECORDS_PATH = '/pages/invite-records/invite-records'
const MY_INCOME_PATH = '/pages/my-income/my-income'
const CAMP_ORDERS_PATH = '/pages/camp-orders/camp-orders'
const {
  getMineOverview,
  createReferralPoster,
  useRedeemCode
} = require('../../api/mine')

Page({
  data: {
    navStyle: '',
    scrollStyle: '',
    overviewLoading: false,
    isMember: false,
    memberStatusText: '当前未开通会员',
    memberUid: '',
    trainingCamp: {
      productId: '',
      title: '21天自主学习训练营',
      subtitle: '直播课 + 打卡陪跑 + 答疑服务',
      priceText: '399元',
      ctaText: '立即报名'
    },
    benefitText: '报名后开通会员权益',
    posterCtaText: '开通后生成推广海报',
    assetBase: '../../assets/mine/',
    heroImage: '../../assets/mine/mine-hero-training-camp.png',
    memberHeroImage: '../../assets/mine/mine-hero-member-active.png',
    showRedeemModal: false,
    redeemCode: '',
    redeemSubmitting: false,
    stats: [
      { key: 'invited', value: '0人', label: '已邀请' },
      { key: 'reward', value: '0元', label: '预计奖励' },
      { key: 'withdraw', value: '0元', label: '可提现' }
    ],
    quickActions: [
      {
        key: 'poster',
        title: '推广海报',
        icon: '../../assets/mine/icon-promo-poster.svg'
      },
      {
        key: 'invite',
        title: '邀请记录',
        icon: '../../assets/mine/icon-invite-record.svg'
      },
      {
        key: 'income',
        title: '我的收益',
        icon: '../../assets/mine/icon-income.svg'
      },
      {
        key: 'order',
        title: '训练营订单',
        icon: '../../assets/mine/icon-camp-order.svg'
      }
    ],
    listItems: [
      {
        key: 'redeem',
        title: '兑换码',
        desc: '输入兑换码开通权益',
        icon: '../../assets/mine/icon-redeem-code.svg'
      },
      {
        key: 'benefit',
        title: '会员权益',
        desc: '查看训练营会员服务',
        icon: '../../assets/mine/icon-member-benefit.svg'
      },
      {
        key: 'rules',
        title: '分销规则',
        desc: '了解邀请奖励说明',
        icon: '../../assets/mine/icon-referral.svg'
      }
    ],
    tabs: [
      {
        key: 'home',
        text: '首页',
        icon: '../../assets/mine/tab-home.svg',
        activeIcon: '../../assets/mine/tab-home-active.svg',
        path: '/pages/home/home'
      },
      {
        key: 'mine',
        text: '我的',
        icon: '../../assets/mine/tab-mine.svg',
        activeIcon: '../../assets/mine/tab-mine-active.svg',
        path: '/pages/mine/mine'
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
    this.loadMineOverview()
  },

  onShow() {
    if (this.data.navStyle) {
      this.loadMineOverview({ silent: true })
    }
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
        scrollStyle: `height:calc(100vh - ${navHeight}px - 120rpx);`
      })
    } catch (error) {
      this.setData({
        navStyle: `height:${fallbackNavHeight}px;padding-top:44px;padding-right:110px;`,
        scrollStyle: `height:calc(100vh - ${fallbackNavHeight}px - 120rpx);`
      })
    }
  },

  onHeroActionTap() {
    if (this.data.isMember) {
      this.onPosterTap()
      return
    }

    wx.navigateTo({
      url: CAMP_PATH,
      fail: () => this.showComingSoon('训练营报名')
    })
  },

  onPosterTap() {
    if (!this.data.isMember) {
      wx.showToast({
        title: '报名后可生成海报',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '生成中' })
    createReferralPoster({
      page: 'pages/home/home'
    })
      .then((response) => {
        wx.hideLoading()
        const poster = response.data || {}
        const query = [
          `uid=${encodeURIComponent(this.data.memberUid)}`,
          poster.posterUrl ? `posterUrl=${encodeURIComponent(poster.posterUrl)}` : '',
          poster.sharePath ? `sharePath=${encodeURIComponent(poster.sharePath)}` : ''
        ].filter(Boolean).join('&')

        wx.navigateTo({
          url: `${PROMO_POSTER_PATH}?${query}`,
          fail: () => this.showComingSoon('推广海报')
        })
      })
      .catch((error) => {
        wx.hideLoading()
        wx.showToast({
          title: (error && error.message) || '海报生成失败',
          icon: 'none'
        })
      })
  },

  onActionTap(e) {
    const key = e.currentTarget.dataset.key
    const labels = {
      poster: '推广海报',
      invite: '邀请记录',
      income: '我的收益',
      order: '训练营订单'
    }

    if (!this.data.isMember && ['poster', 'invite', 'income', 'order'].indexOf(key) >= 0) {
      wx.showToast({
        title: '开通会员后可使用',
        icon: 'none'
      })
      return
    }

    if (key === 'poster') {
      this.onPosterTap()
      return
    }

    if (key === 'invite') {
      wx.navigateTo({
        url: `${INVITE_RECORDS_PATH}?uid=${this.data.memberUid}`,
        fail: () => this.showComingSoon(labels[key])
      })
      return
    }

    if (key === 'income') {
      wx.navigateTo({
        url: `${MY_INCOME_PATH}?uid=${this.data.memberUid}`,
        fail: () => this.showComingSoon(labels[key])
      })
      return
    }

    if (key === 'order') {
      wx.navigateTo({
        url: CAMP_ORDERS_PATH,
        fail: () => this.showComingSoon(labels[key])
      })
      return
    }

    this.showComingSoon(labels[key])
  },

  onListTap(e) {
    const key = e.currentTarget.dataset.key
    const labels = {
      redeem: '兑换码',
      benefit: '会员权益',
      rules: '分销规则'
    }

    if (key === 'redeem') {
      this.openRedeemModal()
      return
    }

    this.showComingSoon(labels[key])
  },

  openRedeemModal() {
    this.setData({
      showRedeemModal: true,
      redeemCode: '',
      redeemSubmitting: false
    })
  },

  closeRedeemModal() {
    if (this.data.redeemSubmitting) return

    this.setData({
      showRedeemModal: false,
      redeemCode: ''
    })
  },

  stopModalClose() {},

  onRedeemInput(e) {
    this.setData({
      redeemCode: (e.detail.value || '').trim().toUpperCase()
    })
  },

  onRedeemSubmit() {
    const code = this.data.redeemCode

    if (!code) {
      wx.showToast({
        title: '请输入兑换码',
        icon: 'none'
      })
      return
    }

    this.setData({ redeemSubmitting: true })

    useRedeemCode(code)
      .then((response) => {
        const member = response.data && response.data.member

        this.setData({
          redeemSubmitting: false,
          showRedeemModal: false,
          redeemCode: ''
        })

        if (member) {
          this.applyMemberData(member)
        }

        wx.showToast({
          title: response.msg || '兑换成功',
          icon: 'success'
        })
        this.loadMineOverview({ silent: true })
      })
      .catch((error) => {
        this.setData({ redeemSubmitting: false })
        wx.showToast({
          title: (error && error.message) || '兑换失败',
          icon: 'none'
        })
      })
  },

  onTabTap(e) {
    const item = e.currentTarget.dataset.item
    if (!item || item.key === 'mine') return

    if (!item.path) {
      this.showComingSoon('线下服务')
      return
    }

    wx.redirectTo({
      url: item.path,
      fail: () => this.showComingSoon(item.text)
    })
  },

  showComingSoon(title) {
    wx.showToast({
      title: `${title}建设中`,
      icon: 'none'
    })
  },

  loadMineOverview(options) {
    const silent = options && options.silent

    if (this.data.overviewLoading) {
      return
    }

    this.setData({ overviewLoading: true })

    if (!silent) {
      wx.showNavigationBarLoading && wx.showNavigationBarLoading()
    }

    getMineOverview()
      .then((response) => {
        this.applyOverviewData(response.data || {})
      })
      .catch((error) => {
        wx.showToast({
          title: (error && error.message) || '会员状态获取失败',
          icon: 'none'
        })
      })
      .then(() => {
        this.setData({ overviewLoading: false })
        wx.hideNavigationBarLoading && wx.hideNavigationBarLoading()
      })
  },

  applyOverviewData(data) {
    const member = data.member || {}
    const trainingCamp = Object.assign({}, this.data.trainingCamp, data.trainingCamp || {})
    const referral = data.referral || {}

    this.applyMemberData(member, {
      trainingCamp,
      referral
    })
  },

  applyMemberData(member, extra) {
    const isMember = !!member.isMember
    const trainingCamp = (extra && extra.trainingCamp) || this.data.trainingCamp
    const referral = (extra && extra.referral) || {}

    this.setData({
      isMember,
      memberUid: member.uid || '',
      memberStatusText: member.statusText || (isMember ? '训练营会员' : '当前未开通会员'),
      benefitText: member.benefitText || trainingCamp.benefitText || (isMember ? '会员权益已生效' : '报名后开通会员权益'),
      trainingCamp,
      posterCtaText: referral.posterCtaText || (isMember ? '生成推广海报' : '开通后生成推广海报'),
      stats: [
        { key: 'invited', value: `${referral.invitedCount || 0}人`, label: '已邀请' },
        { key: 'reward', value: referral.estimatedRewardText || '0元', label: '预计奖励' },
        { key: 'withdraw', value: referral.withdrawableAmountText || '0元', label: '可提现' }
      ]
    })
  }
})
