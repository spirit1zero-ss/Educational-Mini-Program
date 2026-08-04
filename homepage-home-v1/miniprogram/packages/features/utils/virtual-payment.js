const {
  payTrainingCampMemberOrder,
  confirmTrainingCampMemberOrder
} = require('../api/mine')

const CONFIRM_RETRY_DELAYS = [0, 800, 1500, 2500]

function getLoginCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (result) => {
        if (result && result.code) {
          resolve(result.code)
          return
        }
        reject(new Error('微信登录态获取失败，请重试'))
      },
      fail: reject
    })
  })
}

function ensureVirtualPaymentSupported() {
  const supported = typeof wx.requestVirtualPayment === 'function' ||
    (typeof wx.canIUse === 'function' && wx.canIUse('requestVirtualPayment'))
  if (!supported) {
    const error = new Error('当前微信版本不支持虚拟支付，请升级微信后重试')
    error.code = 'VIRTUAL_PAYMENT_UNSUPPORTED'
    throw error
  }
}

function invokeVirtualPayment(payment) {
  return new Promise((resolve, reject) => {
    wx.requestVirtualPayment({
      signData: payment.signData,
      paySig: payment.paySig,
      signature: payment.signature,
      mode: payment.mode,
      success: resolve,
      fail: (error) => {
        const normalized = error || new Error('支付未完成')
        normalized.code = normalized.errCode
        reject(normalized)
      }
    })
  })
}

function delay(milliseconds) {
  if (!milliseconds) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function confirmPayment(orderId, outTradeNo, attemptIndex) {
  const index = attemptIndex || 0
  return delay(CONFIRM_RETRY_DELAYS[index]).then(() => {
    return confirmTrainingCampMemberOrder({ orderId, outTradeNo })
  }).then((response) => {
    const result = response && response.data ? response.data : {}
    if (result.confirmed || index >= CONFIRM_RETRY_DELAYS.length - 1) {
      return result
    }
    return confirmPayment(orderId, outTradeNo, index + 1)
  }).catch((error) => {
    if (index >= CONFIRM_RETRY_DELAYS.length - 1) {
      throw error
    }
    return confirmPayment(orderId, outTradeNo, index + 1)
  })
}

function requestTrainingCampVirtualPayment(orderId) {
  ensureVirtualPaymentSupported()

  return getLoginCode()
    .then((code) => payTrainingCampMemberOrder({
      orderId,
      payType: 'virtual',
      code
    }))
    .then((response) => {
      const payment = response && response.data && response.data.payment
      if (payment && payment.alreadyConfirmed) {
        return payment.confirmation || {
          confirmed: true,
          activated: false,
          delivered: true,
          orderId
        }
      }
      if (!payment || !payment.signData || !payment.paySig || !payment.signature || !payment.outTradeNo) {
        throw new Error('虚拟支付参数不完整，请检查服务端配置')
      }
      return invokeVirtualPayment(payment).then(() => {
        return confirmPayment(orderId, payment.outTradeNo, 0).catch((error) => ({
          confirmed: false,
          pending: true,
          confirmationError: (error && (error.message || error.errMsg)) || ''
        }))
      }).catch((paymentError) => {
        // Query once after cancel/failure so a closed XPay attempt is released and
        // the next tap can safely receive a fresh outTradeNo.
        return confirmPayment(orderId, payment.outTradeNo, 0)
          .catch(() => null)
          .then(() => { throw paymentError })
      })
    })
}

function virtualPaymentErrorMessage(error) {
  const code = Number(error && (error.errCode !== undefined ? error.errCode : error.code))
  if (code === -2) return '支付已取消'
  if (code === -4) return '支付受到安全限制，请稍后重试'
  if (code === -15007) return '支付登录态已过期，请重新支付'
  if (code === -15008) return '虚拟支付商户尚未完成开通'
  if (code === -15010 || code === -15014 || code === -15018) return '训练营商品尚未发布或审核未通过'
  return (error && (error.message || error.errMsg)) || '虚拟支付暂不可用'
}

module.exports = {
  requestTrainingCampVirtualPayment,
  virtualPaymentErrorMessage
}
