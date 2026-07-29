const {
  getMemberPlans,
  saveMiniappProfile,
  createTrainingCampMemberOrder
} = require('../../../../api/mine')
const { USER_KEY } = require('../../../../utils/request')
const {
  validateAvatarImage,
  uploadAvatarToCloud,
  removeCloudAvatar
} = require('../../../../utils/profile-avatar')
const {
  requestTrainingCampVirtualPayment,
  virtualPaymentErrorMessage
} = require('../../../../utils/virtual-payment')
const CAMP_ORDERS_PATH = '/packages/features/pages/camp-orders/camp-orders'
const MEMBER_REGISTRATION_PATH = '/packages/features/pages/member-registration/member-registration'

Page({
  data: {
    submitting: false,
    profileVisible: false,
    profileSubmitting: false,
    profile: {
      nickname: '',
      phone: '',
      avatarUrl: '',
      originalAvatar: '',
      avatarChanged: false
    },
    planLoading: true,
    planLoadError: false,
    selectedPlanId: 0,
    showOriginPrice: false,
    agreed: false,
    product: {
      title: "21天线上特训营",
      subtitle: "直播课 + 打卡陪跑 + 答疑服务",
      price: "--",
      originPrice: ""
    },
    benefits: [
      {
        title: "三次直播",
        desc: "每周一次",
        icon: "../../assets/module-2-logic/icons/calculation.png"
      },
      {
        title: "21天陪跑",
        desc: "打卡督导",
        icon: "../../assets/module-2-logic/icons/equation-function.png"
      },
      {
        title: "答疑支持",
        desc: "3个月答疑",
        icon: "../../assets/module-2-logic/icons/callout-star.png"
      }
    ],
    notices: [
      "支付完成后，系统将记录您的训练营报名状态。",
      "后续由助教老师联系入群，并安排开营学习。",
      "如支付失败或取消，可返回本页重新发起支付。",
      "如遇重复扣款、支付成功未开通或需要申请退款，请联系客服，由工作人员核实后人工处理。"
    ]
  },

  onLoad() {
    this.loadMemberPlan()
  },

  loadMemberPlan() {
    if (this.data.planLoading && this.data.selectedPlanId) return

    this.setData({
      planLoading: true,
      planLoadError: false
    })

    return getMemberPlans()
      .then((response) => {
        const plans = Array.isArray(response.data) ? response.data : []
        const plan = plans.find((item) => item && item.type === 'ever' && !item.isFree && item.mcId)

        if (!plan) {
          throw new Error('暂无可购买的会员方案')
        }

        const price = String(plan.price || '')
        const originPrice = String(plan.originalPrice || '')

        if (!price) {
          throw new Error('会员价格暂未配置')
        }

        this.setData({
          planLoading: false,
          planLoadError: false,
          selectedPlanId: Number(plan.mcId),
          showOriginPrice: !!originPrice && originPrice !== price,
          product: Object.assign({}, this.data.product, {
            title: plan.title || this.data.product.title,
            price,
            originPrice
          })
        })
      })
      .catch((error) => {
        this.setData({
          planLoading: false,
          planLoadError: true,
          selectedPlanId: 0
        })
        wx.showToast({
          title: (error && error.message) || '价格加载失败',
          icon: 'none'
        })
      })
  },

  onToggleAgreement() {
    this.setData({
      agreed: !this.data.agreed
    });
  },

  onPayTap() {
    if (!this.data.agreed || this.data.submitting) return;

    if (this.data.planLoading) return

    if (this.data.planLoadError || !this.data.selectedPlanId) {
      this.loadMemberPlan()
      return
    }

    this.openProfileModal()
  },

  openProfileModal() {
    const user = wx.getStorageSync(USER_KEY) || {}
    const storedNickname = String(user.nickname || '')
    const nickname = /^wx\d{6}$/i.test(storedNickname) ? '' : storedNickname

    this.setData({
      profileVisible: true,
      profile: {
        nickname,
        phone: String(user.phone || ''),
        avatarUrl: String(user.avatar || ''),
        originalAvatar: String(user.avatar || ''),
        avatarChanged: false
      }
    })
  },

  closeProfileModal() {
    if (this.data.profileSubmitting) return
    this.setData({ profileVisible: false })
  },

  preventProfileMaskMove() {},

  onProfileInput(e) {
    const field = e.currentTarget.dataset.field
    if (!field) return
    this.setData({
      [`profile.${field}`]: e.detail.value
    })
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail && e.detail.avatarUrl
    if (!avatarUrl) return

    validateAvatarImage(avatarUrl)
      .then(() => {
        this.setData({
          'profile.avatarUrl': avatarUrl,
          'profile.avatarChanged': true
        })
      })
      .catch((error) => {
        wx.showToast({
          title: (error && error.message) || '头像图片无效',
          icon: 'none'
        })
      })
  },

  uploadSelectedAvatar() {
    const profile = this.data.profile || {}
    if (!profile.avatarChanged || !profile.avatarUrl) {
      return Promise.resolve('')
    }
    return uploadAvatarToCloud(profile.avatarUrl)
  },

  submitProfileAndPay() {
    if (this.data.profileSubmitting) return

    const profile = this.data.profile || {}
    const nickname = String(profile.nickname || '').trim()
    const phone = String(profile.phone || '').replace(/\s+/g, '')

    if (!nickname) {
      wx.showToast({ title: '请填写昵称', icon: 'none' })
      return
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '请填写真实有效的11位手机号', icon: 'none' })
      return
    }

    this.setData({ profileSubmitting: true })
    wx.showLoading({ title: '保存会员资料' })

    let uploadedAvatar = ''
    const originalAvatar = String(profile.originalAvatar || '')

    this.uploadSelectedAvatar()
      .then((avatarFileId) => {
        uploadedAvatar = avatarFileId
        return saveMiniappProfile({
          nickname,
          phone,
          avatar_file_id: avatarFileId
        })
      })
      .then((response) => {
        if (response && response.data) {
          wx.setStorageSync(USER_KEY, response.data)
        }
        if (uploadedAvatar && originalAvatar && originalAvatar !== uploadedAvatar) {
          removeCloudAvatar(originalAvatar)
        }
        wx.hideLoading()
        this.setData({
          profileVisible: false,
          profileSubmitting: false
        })
        this.startPayment()
      })
      .catch((error) => {
        if (uploadedAvatar) {
          removeCloudAvatar(uploadedAvatar)
        }
        wx.hideLoading()
        this.setData({ profileSubmitting: false })
        wx.showToast({
          title: (error && error.message) || '会员资料保存失败',
          icon: 'none'
        })
      })
  },

  startPayment() {
    this.setData({ submitting: true });
    wx.showLoading({ title: "创建订单中" });

    createTrainingCampMemberOrder({
      mcId: this.data.selectedPlanId,
      payType: 'virtual'
    })
      .then((response) => {
        const order = response.data || {};
        if (!order.orderId) {
          throw new Error('会员订单创建成功，但未返回订单号')
        }

        wx.hideLoading()
        return requestTrainingCampVirtualPayment(order.orderId)
      })
      .then((confirmation) => {
        if (!confirmation || !confirmation.confirmed) {
          wx.showModal({
            title: '支付结果确认中',
            content: '微信支付结果仍在同步，请稍后到订单页查看。会员权益会在到账确认后自动开通。',
            showCancel: false,
            confirmText: '查看订单',
            success: () => {
              wx.navigateTo({ url: CAMP_ORDERS_PATH })
            }
          })
          return
        }

        this.onPaymentSuccess()
      })
      .catch((error) => {
        wx.hideLoading();
        wx.showToast({
          title: virtualPaymentErrorMessage(error),
          icon: "none"
        });
      })
      .then(() => {
        this.setData({ submitting: false });
      });
  },

  onOpenAgreement(e) {
    const key = e.currentTarget.dataset.key || 'service'
    wx.navigateTo({
      url: `/packages/features/pages/legal-document/legal-document?key=${key}`
    })
  },

  onPaymentSuccess() {
    wx.showModal({
      title: "报名成功",
      content: "请完善会员登记信息，方便老师后续跟进。",
      confirmText: "去填写",
      cancelText: "稍后",
      success: (result) => {
        if (result.confirm) {
          wx.navigateTo({
            url: `${MEMBER_REGISTRATION_PATH}?from=pay_success`
          });
        }
      }
    });
  }
});
