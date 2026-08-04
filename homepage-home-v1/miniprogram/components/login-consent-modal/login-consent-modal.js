const {
  hasLoginConsent,
  subscribeLoginConsent,
  acceptLoginConsent,
  cancelLoginConsent,
  closeLoginConsentSettings,
  withdrawLoginConsent
} = require('../../utils/login-consent')

const LEGAL_DOCUMENT_PATH = '/packages/features/pages/legal-document/legal-document'

Component({
  data: {
    visible: false,
    mode: 'login',
    agreed: false,
    hasConsent: false,
    needPrivacyAuthorization: false,
    privacyContractName: '用户隐私保护指引',
    privacyChecking: false,
    submitting: false
  },

  lifetimes: {
    attached() {
      this.unsubscribeConsent = subscribeLoginConsent((state) => {
        const visible = !!state.visible
        const mode = state.mode === 'settings' ? 'settings' : 'login'
        const hasConsent = hasLoginConsent()

        this.setData({
          visible,
          mode,
          hasConsent,
          agreed: mode === 'settings' && hasConsent,
          submitting: false
        })

        if (visible) this.loadPrivacySetting()
      })
    },

    detached() {
      if (this.unsubscribeConsent) this.unsubscribeConsent()
    }
  },

  methods: {
    onPreventTouch() {},
    onPreventTap() {},

    loadPrivacySetting() {
      if (!wx.getPrivacySetting) {
        this.setData({ privacyChecking: false })
        return
      }

      this.setData({ privacyChecking: true })
      wx.getPrivacySetting({
        success: (result) => {
          this.setData({
            needPrivacyAuthorization: !!result.needAuthorization,
            privacyContractName: result.privacyContractName || '用户隐私保护指引'
          })
        },
        complete: () => this.setData({ privacyChecking: false })
      })
    },

    onToggleAgreement() {
      if (this.data.submitting || this.data.hasConsent) return
      this.setData({ agreed: !this.data.agreed })
    },

    onOpenUserAgreement() {
      wx.navigateTo({ url: `${LEGAL_DOCUMENT_PATH}?key=user` })
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
      wx.navigateTo({ url: `${LEGAL_DOCUMENT_PATH}?key=privacy` })
    },

    onAgreePrivacyAuthorization() {
      this.completeConsent()
    },

    onAgreeAndContinue() {
      this.completeConsent()
    },

    completeConsent() {
      if (!this.data.agreed || this.data.submitting) return

      this.setData({ submitting: true })
      acceptLoginConsent({
        privacyContractName: this.data.privacyContractName
      })
      wx.showToast({ title: '已同意并继续', icon: 'success' })
    },

    onClose() {
      if (this.data.mode === 'login') {
        cancelLoginConsent()
        return
      }
      closeLoginConsentSettings()
    },

    onWithdrawConsent() {
      wx.showModal({
        title: '撤回登录授权',
        content: '撤回后将退出当前账号，再次使用账号功能时需要重新确认协议。',
        confirmText: '确认撤回',
        confirmColor: '#b14f3f',
        success: (result) => {
          if (!result.confirm) return
          withdrawLoginConsent()
          wx.showToast({ title: '授权已撤回', icon: 'success' })
        }
      })
    }
  }
})
