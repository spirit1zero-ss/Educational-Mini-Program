const INVITE_RECORDS_PATH = '/packages/features/pages/invite-records/invite-records'
const { getIncomeRecords, getWithdrawalOverview, applyWithdrawal } = require('../../../../api/mine')

Page({
  data: {
    navStyle: '',
    scrollStyle: '',
    memberUid: '',
    activeStatus: 'all',
    summary: [
      { key: 'pending', value: '0元', label: '待结算' },
      { key: 'available', value: '0元', label: '可提现' },
      { key: 'withdrawn', value: '0元', label: '已到账' }
    ],
    statusTabs: [
      { key: 'all', text: '全部', count: 0 },
      { key: 'pending', text: '待结算', count: 0 },
      { key: 'available', text: '可提现', count: 0 },
      { key: 'withdraw', text: '提现', count: 0 }
    ],
    records: [],
    filteredRecords: [],
    withdrawal: null,
    withdrawalVisible: false,
    withdrawalAmount: '',
    withdrawalLoading: false,
    withdrawalSubmitting: false
  },

  onLoad(options) {
    this.setNavigationMetrics()

    if (options && options.uid) {
      this.setData({ memberUid: options.uid })
    }

    this.loadIncomeRecords().then(() => this.loadWithdrawalOverview())
  },

  loadWithdrawalOverview() {
    if (this._withdrawalRequest) return this._withdrawalRequest

    this.setData({ withdrawalLoading: true })
    this._withdrawalRequest = getWithdrawalOverview()
      .then((response) => {
        const withdrawal = response && response.data ? response.data : null
        if (!withdrawal) return null
        const withdrawalRecords = (withdrawal.list || []).map((item) => ({
          id: `withdraw-${item.id}`,
          title: '微信提现',
          desc: item.failReason || item.statusText,
          time: item.addTime || '',
          amount: `-${Number(item.amount || 0).toFixed(2)}`,
          status: 'withdraw',
          statusText: item.statusText || '提现'
        }))
        const incomeRecords = this.data.records.filter((item) => String(item.id).indexOf('withdraw-') !== 0)
        const records = incomeRecords.concat(withdrawalRecords)
        this.setData({
          withdrawal,
          records,
          summary: this.data.summary.map((item) => item.key === 'available'
            ? Object.assign({}, item, { value: `${withdrawal.availableAmount || '0.00'}元` })
            : item)
        }, () => {
          const statusTabs = this.data.statusTabs.map((item) => Object.assign({}, item, {
            count: item.key === 'all' ? records.length : records.filter((record) => record.status === item.key).length
          }))
          this.setData({ statusTabs })
          this.updateFilteredRecords()
        })
        return withdrawal
      })
      .catch((error) => {
        console.warn('[my-income] load withdrawal overview failed:', error)
        return null
      })
      .finally(() => {
        this._withdrawalRequest = null
        this.setData({ withdrawalLoading: false })
      })

    return this._withdrawalRequest
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

    return getIncomeRecords({ type: 3 })
      .then((response) => {
        const data = response && response.data ? response.data : {}
        const source = Array.isArray(data.list) ? data.list : []
        const records = source.map((item, index) => {
          const pm = Number(item.pm === undefined ? 1 : item.pm)
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
            if (item.key === 'available') return Object.assign({}, item, { value: `${backendSummary.availableAmount || '0.00'}元` })
            if (item.key === 'pending') return Object.assign({}, item, { value: `${backendSummary.pendingAmount || '0.00'}元` })
            if (item.key === 'withdrawn') return Object.assign({}, item, { value: `${backendSummary.withdrawnAmount || '0.00'}元` })
            return item
          })
        }, () => {
          this.updateFilteredRecords()
        })
      })
      .catch((error) => {
        console.warn('[my-income] load backend records failed:', error)
        this.setData({
          records: [],
          filteredRecords: [],
          summary: this.data.summary.map((item) => Object.assign({}, item, { value: '0\u5143' })),
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

  onWithdrawTap() {
    const withdrawal = this.data.withdrawal
    if (!withdrawal) {
      if (this._withdrawalTapWaiting) return
      this._withdrawalTapWaiting = true
      this.loadWithdrawalOverview()
        .then((loadedWithdrawal) => {
          if (loadedWithdrawal) {
            this.openWithdrawalPanel(loadedWithdrawal)
            return
          }
          wx.showToast({ title: '提现信息加载失败，请稍后重试', icon: 'none' })
        })
        .finally(() => {
          this._withdrawalTapWaiting = false
        })
      return
    }
    this.openWithdrawalPanel(withdrawal)
  },

  openWithdrawalPanel(withdrawal) {
    if (!withdrawal.eligible) {
      wx.showToast({ title: '当前账号没有提现资格', icon: 'none' })
      return
    }
    if (!withdrawal.enabled) {
      wx.showToast({ title: '微信提现尚未开启', icon: 'none' })
      return
    }
    if (!withdrawal.windowOpen) {
      wx.showToast({ title: withdrawal.windowNotice || '每月1日至7日开放提现申请', icon: 'none' })
      return
    }
    if (withdrawal.hasPending) {
      wx.showToast({ title: '已有提现正在审核', icon: 'none' })
      return
    }
    this.setData({ withdrawalVisible: true, withdrawalAmount: withdrawal.availableAmount || '' })
  },

  onWithdrawalAmountInput(e) {
    this.setData({ withdrawalAmount: e.detail.value })
  },

  closeWithdrawal() {
    if (!this.data.withdrawalSubmitting) this.setData({ withdrawalVisible: false })
  },

  submitWithdrawal() {
    if (this.data.withdrawalSubmitting) return
    if (!this.data.withdrawal || !this.data.withdrawal.windowOpen) {
      wx.showToast({
        title: (this.data.withdrawal && this.data.withdrawal.windowNotice) || '每月1日至7日开放提现申请',
        icon: 'none'
      })
      return
    }
    const amount = Number(this.data.withdrawalAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      wx.showToast({ title: '请输入正确的提现金额', icon: 'none' })
      return
    }
    this.setData({ withdrawalSubmitting: true })
    applyWithdrawal({ amount: amount.toFixed(2) })
      .then(() => {
        wx.showToast({ title: '提现申请已提交', icon: 'success' })
        this.setData({ withdrawalVisible: false, withdrawalAmount: '' })
        return this.loadIncomeRecords().then(() => this.loadWithdrawalOverview())
      })
      .catch((error) => wx.showToast({
        title: error.message || error.errMsg || error.msg || '提现申请失败',
        icon: 'none'
      }))
      .finally(() => this.setData({ withdrawalSubmitting: false }))
  },

  onConfirmTransfer(e) {
    const id = Number(e.currentTarget.dataset.id)
    const record = ((this.data.withdrawal && this.data.withdrawal.list) || []).find((item) => Number(item.id) === id)
    const transfer = record && record.transfer
    if (!transfer || !transfer.mchId || !transfer.appId || !transfer.package) {
      wx.showToast({ title: '收款参数不完整，请联系管理员', icon: 'none' })
      return
    }
    if (typeof wx.requestMerchantTransfer !== 'function') {
      wx.showToast({ title: '微信版本过低，请升级后重试', icon: 'none' })
      return
    }
    wx.requestMerchantTransfer({
      mchId: transfer.mchId,
      appId: transfer.appId,
      package: transfer.package,
      success: () => {
        wx.showToast({ title: '已确认收款', icon: 'success' })
        setTimeout(() => this.loadWithdrawalOverview(), 1200)
      },
      fail: (error) => {
        if (!String(error.errMsg || '').includes('cancel')) {
          wx.showToast({ title: '确认收款失败，请稍后重试', icon: 'none' })
        }
      }
    })
  },

  noop() {},

  onInviteTap() {
    wx.navigateTo({
      url: `${INVITE_RECORDS_PATH}?uid=${this.data.memberUid}`,
      fail: () => {
        wx.showToast({
          title: '我的团队打开失败',
          icon: 'none'
        })
      }
    })
  }
})
