const CAMP_PATH = '/packages/features/pages/module-5-camp/module-5-camp'
const PROMO_POSTER_PATH = '/packages/features/pages/promo-poster/promo-poster'
const INVITE_RECORDS_PATH = '/packages/features/pages/invite-records/invite-records'
const MY_INCOME_PATH = '/packages/features/pages/my-income/my-income'
const CAMP_ORDERS_PATH = '/packages/features/pages/camp-orders/camp-orders'
const CAMP_CHECKOUT_PATH = '/packages/features/pages/camp-checkout/camp-checkout'
const MEMBER_BENEFITS_PATH = '/packages/features/pages/member-benefits/member-benefits'
const MEMBER_REGISTRATION_PATH = '/packages/features/pages/member-registration/member-registration'
const REFERRAL_RULES_PATH = '/packages/features/pages/referral-rules/referral-rules'
const OFFLINE_PATH = '/pages/offline/offline'
const {
  getMineOverview,
  getMemberPlans,
  createReferralPoster,
  useRedeemCode
} = require('../../api/mine')
const { hasAuthToken, clearAuth } = require('../../utils/request')

Page({
  data: {
    navStyle: '',
    scrollStyle: '',
    overviewLoading: false,
    isMember: false,
    registrationCompleted: false,
    registrationCanOpen: false,
    memberStatusText: '当前未开通会员',
    memberUid: '',
    memberPlans: [],
    selectedMemberPlan: null,
    trainingCamp: {
      productId: '',
      title: '21天自主学习训练营',
      subtitle: '直播课 + 打卡陪跑 + 答疑服务',
      priceText: '价格加载中',
      ctaText: '立即报名'
    },
    benefitText: '报名后开通会员权益',
    posterCtaText: '开通后生成推广海报',
    referralIdentity: null,
    assetBase: '../../assets/mine/',
    heroImage: '../../assets/mine/mine-hero-training-camp.jpg',
    memberHeroImage: '../../assets/mine/mine-hero-member-active.jpg',
    showRedeemModal: false,
    redeemCode: '',
    redeemSubmitting: false,
    stats: [
      { key: 'invited', value: '0人', label: '分销拉新人数' },
      { key: 'reward', value: '0元', label: '总收入' },
      { key: 'withdraw', value: '0元', label: '已提现' }
    ],
    quickActions: [
      {
        key: 'poster',
        title: '推广海报',
        icon: '../../assets/mine/icon-promo-poster.svg'
      },
      {
        key: 'invite',
        title: '我的团队',
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
        key: 'registration',
        title: '会员登记表',
        desc: '填写孩子信息与主要问题',
        icon: '../../assets/mine/icon-member-status.svg'
      },
      {
        key: 'order',
        title: '训练营订单',
        desc: '查看报名与支付状态',
        icon: '../../assets/mine/icon-camp-order.svg'
      },
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
        path: OFFLINE_PATH
      }
    ]
  },

  onLoad() {
    this.setNavigationMetrics()
    this.loadPublicMemberPlan()
    this.loadMineOverviewIfAuthed()
  },

  onShow() {
    if (this.data.navStyle && hasAuthToken()) {
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
        scrollStyle: `height:calc(100vh - ${navHeight}px - 120rpx - env(safe-area-inset-bottom));`
      })
    } catch (error) {
      this.setData({
        navStyle: `height:${fallbackNavHeight}px;padding-top:44px;padding-right:110px;`,
        scrollStyle: `height:calc(100vh - ${fallbackNavHeight}px - 120rpx - env(safe-area-inset-bottom));`
      })
    }
  },

  loadPublicMemberPlan() {
    return getMemberPlans()
      .then((response) => {
        const plans = Array.isArray(response.data) ? response.data : []
        const plan = plans.find((item) => item && item.type === 'ever' && !item.isFree && item.mcId)

        if (!plan) {
          this.setData({
            trainingCamp: Object.assign({}, this.data.trainingCamp, {
              priceText: '暂未开放'
            }),
            memberPlans: [],
            selectedMemberPlan: null
          })
          return
        }

        this.setData({
          trainingCamp: Object.assign({}, this.data.trainingCamp, {
            productId: `member-card-${plan.mcId}`,
            memberPlan: plan,
            memberPlans: plans,
            priceText: plan.priceText || `${plan.price}元`
          }),
          memberPlans: plans,
          selectedMemberPlan: plan
        })
      })
      .catch((error) => {
        console.warn('[mine] load member price failed:', error)
        if (!hasAuthToken()) {
          this.setData({
            trainingCamp: Object.assign({}, this.data.trainingCamp, {
              priceText: '价格暂不可用'
            })
          })
        }
      })
  },

  onHeroActionTap() {
    if (this.data.isMember) {
      this.onPosterTap()
      return
    }

    wx.navigateTo({
      url: CAMP_CHECKOUT_PATH,
      fail: () => {
        wx.showToast({
          title: '支付页面打开失败',
          icon: 'none'
        })
      }
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
        if (!poster.codeUrl) {
          wx.showToast({
            title: '报名码生成失败',
            icon: 'none'
          })
          return
        }

        const query = [
          `uid=${encodeURIComponent(this.data.memberUid)}`,
          poster.posterUrl ? `posterUrl=${encodeURIComponent(poster.posterUrl)}` : '',
          poster.codeUrl ? `codeUrl=${encodeURIComponent(poster.codeUrl)}` : '',
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
      invite: '我的团队',
      income: '我的收益',
      order: '训练营订单'
    }

    if (!this.data.isMember && ['poster', 'invite', 'income'].indexOf(key) >= 0) {
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

    if (key === 'registration') {
      if (!hasAuthToken() || !this.data.registrationCanOpen) {
        wx.showToast({
          title: '支付成功后填写登记表',
          icon: 'none'
        })
        wx.navigateTo({
          url: CAMP_CHECKOUT_PATH,
          fail: () => this.showComingSoon('报名支付')
        })
        return
      }

      wx.navigateTo({
        url: MEMBER_REGISTRATION_PATH,
        fail: () => this.showComingSoon('会员登记表')
      })
      return
    }

    if (key === 'order') {
      wx.navigateTo({
        url: CAMP_ORDERS_PATH,
        fail: () => this.showComingSoon('训练营订单')
      })
      return
    }

    if (key === 'redeem') {
      this.openRedeemModal()
      return
    }

    if (key === 'benefit') {
      wx.navigateTo({
        url: MEMBER_BENEFITS_PATH,
        fail: () => this.showComingSoon(labels[key])
      })
      return
    }

    if (key === 'rules') {
      wx.navigateTo({
        url: REFERRAL_RULES_PATH,
        fail: () => this.showComingSoon(labels[key])
      })
    }
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
    if (this.data.redeemSubmitting) return

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
        const payload = response.data || {}
        const member = payload.member

        this.setData({
          redeemSubmitting: false,
          showRedeemModal: false,
          redeemCode: ''
        })

        if (payload.overview) {
          this.applyOverviewData(payload.overview)
        } else if (member) {
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

  loadMineOverviewIfAuthed(options) {
    if (!hasAuthToken()) {
      return Promise.resolve()
    }

    return this.loadMineOverview(options)
  },

  loadMineOverview(options) {
    const silent = options && options.silent

    if (this.data.overviewLoading) {
      return Promise.resolve()
    }

    this.setData({ overviewLoading: true })

    if (!silent) {
      wx.showNavigationBarLoading && wx.showNavigationBarLoading()
    }

    return getMineOverview()
      .then((response) => {
        this.applyOverviewData(response.data || {})
      })
      .catch((error) => {
        const httpStatus = Number(error && error.statusCode)
        const businessStatus = Number(error && error.businessStatus)
        if (httpStatus === 401 || httpStatus === 403 || businessStatus === 401 || businessStatus === 403) {
          clearAuth()
          return
        }

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
    const registration = data.registration || {}

    this.applyMemberData(member, {
      trainingCamp,
      referral,
      benefitText: data.benefitText,
      registration
    })
  },

  applyMemberData(member, extra) {
    const isMember = !!member.isMember
    const trainingCamp = (extra && extra.trainingCamp) || this.data.trainingCamp
    const referral = (extra && extra.referral) || {}
    const benefitText = (extra && extra.benefitText) || ''
    const registration = (extra && extra.registration) || {}
    const memberPlans = Array.isArray(trainingCamp.memberPlans) ? trainingCamp.memberPlans : this.data.memberPlans
    const selectedMemberPlan = trainingCamp.memberPlan && trainingCamp.memberPlan.mcId && trainingCamp.memberPlan.type === 'ever'
      ? trainingCamp.memberPlan
      : (memberPlans.find((item) => item && item.type === 'ever' && !item.isFree) || null)
    const invitedCount = referral.invitedCount !== undefined ? referral.invitedCount : (referral.inviteCount || 0)
    const incomeAmount = referral.incomeAmount ? `${referral.incomeAmount}元` : '0元'
    const withdrawnAmount = referral.withdrawnAmount ? `${referral.withdrawnAmount}元` : '0元'
    const referralIdentity = referral.identity || member.distributionIdentity || null

    this.setData({
      isMember,
      registrationCompleted: !!registration.completed,
      registrationCanOpen: !!registration.canRegister,
      memberUid: member.uid || '',
      memberPlans,
      selectedMemberPlan,
      memberStatusText: member.statusText || (isMember ? '训练营会员' : '当前未开通会员'),
      benefitText: member.benefitText || benefitText || trainingCamp.benefitText || (isMember ? '会员权益已生效' : '报名后开通会员权益'),
      trainingCamp,
      referralIdentity,
      posterCtaText: referral.posterCtaText || (isMember ? '生成推广海报' : '开通后生成推广海报'),
      stats: [
        { key: 'invited', value: `${invitedCount}人`, label: '分销拉新人数' },
        { key: 'reward', value: incomeAmount, label: '总收入' },
        { key: 'withdraw', value: withdrawnAmount, label: '已提现' }
      ]
    })
  }
})
