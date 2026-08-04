const {
  hasLoginConsent,
  acceptLoginConsent,
  cancelLoginConsent,
  withdrawLoginConsent
} = require('../../../../utils/login-consent')

const LEGAL_DOCUMENT_PATH = '/packages/features/pages/legal-document/legal-document'

Page({
  data: {
    mode: 'login',
    agreed: false,
    hasConsent: false,
    needPrivacyAuthorization: false,
    privacyContractName: '用户隐私保护指引',
    privacyChecking: true,
    submitting: false,
    accepted: false
  },

  onLoad(options) {
    const mode = options && options.mode === 'settings' ? 'settings' : 'login'
    const hasConsent = hasLoginConsent()

    this.setData({
      mode,
      hasConsent,
      agreed: mode === 'settings' && hasConsent
    })
    this.loadPrivacySetting()
  },

  onUnload() {
    if (this.data.mode === 'login' && !this.data.accepted) {
      cancelLoginConsent()
    }
  },

  loadPrivacySetting() {
    if (!wx.getPrivacySetting) {
      this.setData({ privacyChecking: false })
      return
    }

    wx.getPrivacySetting({
      success: (result) => {
        this.setData({
          needPrivacyAuthorization: !!result.needAuthorization,
          privacyContractName: result.privacyContractName || '用户隐私保护指引',
          privacyChecking: false
        })
      },
      fail: () => {
        this.setData({ privacyChecking: false })
      }
    })
  },

  onToggleAgreement() {
    if (this.data.submitting) return
    this.setData({ agreed: !this.data.agreed })
  },

  onOpenUserAgreement() {
    wx.navigateTo({
      url: `${LEGAL_DOCUMENT_PATH}?key=user`
    })
  },

  onOpenPrivacyGuide() {
    if (!wx.openPrivacyContract) {
      this.openLocalPrivacyPolicy()
      return
    }

    wx.openPrivacyContract({
      fail: () => this.openLocalPrivacyPolicy()
    })
  },

  openLocalPrivacyPolicy() {
    wx.navigateTo({
      url: `${LEGAL_DOCUMENT_PATH}?key=privacy`
    })
  },

  onAgreePrivacyAuthorization() {
    this.completeConsent()
  },

  onAgreeAndContinue() {
    this.completeConsent()
  },

  onDeclineAndBack() {
    cancelLoginConsent()
    wx.navigateBack({
      delta: 1,
      fail: () => wx.reLaunch({ url: '/pages/home/home' })
    })
  },

  completeConsent() {
    if (!this.data.agreed || this.data.submitting) return

    this.setData({
      submitting: true,
      accepted: true,
      hasConsent: true
    })
    acceptLoginConsent({
      privacyContractName: this.data.privacyContractName
    })

    wx.showToast({
      title: this.data.mode === 'settings' ? '授权已确认' : '正在登录',
      icon: 'success',
      duration: 900
    })

    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
        fail: () => wx.reLaunch({ url: '/pages/home/home' })
      })
    }, 260)
  },

  onWithdrawConsent() {
    wx.showModal({
      title: '撤回登录授权',
      content: '撤回后将退出当前账号，受保护功能需要重新阅读并同意协议后才能使用。',
      confirmText: '确认撤回',
      confirmColor: '#b14f3f',
      success: (result) => {
        if (!result.confirm) return

        withdrawLoginConsent()
        this.setData({
          hasConsent: false,
          agreed: false,
          accepted: false
        })
        wx.showToast({ title: '授权已撤回', icon: 'success' })
      }
    })
  }
})
