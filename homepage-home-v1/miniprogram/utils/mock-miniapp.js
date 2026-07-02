const {
  TOKEN_KEY,
  USER_KEY,
  isMiniappFrontendMockEnabled
} = require('../config/api')

const MOCK_MEMBER_KEY = 'miniapp_mock_member_state'
const MOCK_TOKEN = 'mock-miniapp-token'
const MOCK_USER = {
  uid: 90001,
  memberUid: '',
  nickname: '\u5f00\u53d1\u6a21\u62df\u7528\u6237',
  avatar: '',
  phone: ''
}
const MOCK_MEMBER_UID = 'A90001'
const MOCK_REDEEM_CODES = ['DEV-MEMBER-2026', 'ABCD-2026-0001', 'VIP2026']

function normalizeCode(code) {
  return String(code || '').trim().toUpperCase()
}

function makeError(message) {
  const error = new Error(message)
  error.message = message
  return error
}

function getErrorMessage(error) {
  if (!error) return ''
  return String(error.message || error.errMsg || (error.data && (error.data.msg || error.data.message)) || '')
}

function shouldUseMockFallback(error) {
  if (!isMiniappFrontendMockEnabled()) return false

  const message = getErrorMessage(error)
  const statusCode = Number(error && error.statusCode)

  return (
    statusCode === 0 ||
    statusCode === 404 ||
    /request:fail/i.test(message) ||
    /timeout/i.test(message) ||
    /appid missing/i.test(message) ||
    /accesstoken fail/i.test(message) ||
    /access.?token/i.test(message) ||
    /backend is not configured/i.test(message) ||
    /redeem code backend is not configured/i.test(message) ||
    /miniapp user login failed/i.test(message) ||
    /missing wx\.login code/i.test(message)
  )
}

function ensureMockLogin() {
  wx.setStorageSync(TOKEN_KEY, MOCK_TOKEN)
  wx.setStorageSync(USER_KEY, MOCK_USER)
  return Promise.resolve({
    token: MOCK_TOKEN,
    user: MOCK_USER,
    mock: true
  })
}

function readMemberState() {
  const saved = wx.getStorageSync(MOCK_MEMBER_KEY)
  if (saved && typeof saved === 'object') {
    return saved
  }
  return {
    isMember: false,
    uid: '',
    statusText: '\u672a\u5f00\u901a\u8bad\u7ec3\u8425',
    benefitText: '\u62a5\u540d\u540e\u5f00\u901a\u4f1a\u5458\u6743\u76ca',
    canPromote: false,
    redeemedCode: ''
  }
}

function writeMemberState(state) {
  wx.setStorageSync(MOCK_MEMBER_KEY, state)
  return state
}

function buildOverview() {
  const member = readMemberState()
  const isMember = !!member.isMember

  return {
    member,
    trainingCamp: {
      productId: 'mock-training-camp-21-days',
      memberPlan: {
        mcId: 1,
        title: '\u0032\u0031\u5929\u8bad\u7ec3\u8425\u4f1a\u5458',
        type: 'month',
        vipDay: 365,
        price: '399.00',
        priceText: isMember ? '\u5df2\u5f00\u901a' : '\u0033\u0039\u0039\u5143',
        originalPrice: '399.00',
        isFree: false
      },
      memberPlans: [],
      title: '\u0032\u0031\u5929\u81ea\u4e3b\u5b66\u4e60\u8bad\u7ec3\u8425',
      subtitle: '\u76f4\u64ad\u8bfe + \u6253\u5361\u966a\u8dd1 + \u7b54\u7591\u670d\u52a1',
      priceText: isMember ? '\u5df2\u5f00\u901a' : '\u0033\u0039\u0039\u5143',
      ctaText: isMember ? '\u751f\u6210\u63a8\u5e7f\u6d77\u62a5' : '\u7acb\u5373\u62a5\u540d'
    },
    benefitText: isMember ? '\u4f1a\u5458\u6743\u76ca\u5df2\u751f\u6548' : '\u62a5\u540d\u540e\u5f00\u901a\u4f1a\u5458\u6743\u76ca',
    referral: {
      inviteCount: isMember ? 3 : 0,
      invitedCount: isMember ? 3 : 0,
      orderCount: isMember ? 1 : 0,
      incomeAmount: isMember ? '120.00' : '0.00',
      estimatedRewardText: isMember ? '\u0031\u0032\u0030\u5143' : '\u0030\u5143',
      withdrawableAmountText: isMember ? '\u0038\u0030\u5143' : '\u0030\u5143',
      canPromote: isMember,
      posterCtaText: isMember ? '\u751f\u6210\u63a8\u5e7f\u6d77\u62a5' : '\u5f00\u901a\u540e\u751f\u6210\u63a8\u5e7f\u6d77\u62a5'
    }
  }
}

function getMockMineOverview() {
  return ensureMockLogin().then(() => ({
    status: 200,
    msg: 'ok',
    data: buildOverview(),
    mock: true
  }))
}

function useMockRedeemCode(code) {
  const redeemCode = normalizeCode(code)

  if (!redeemCode) {
    return Promise.reject(makeError('\u8bf7\u8f93\u5165\u5151\u6362\u7801'))
  }

  if (MOCK_REDEEM_CODES.indexOf(redeemCode) < 0) {
    return Promise.reject(makeError('\u672c\u5730\u6a21\u62df\u5151\u6362\u7801\u65e0\u6548\uff0c\u8bf7\u8f93\u5165 DEV-MEMBER-2026'))
  }

  return ensureMockLogin().then(() => {
    const member = writeMemberState({
      isMember: true,
      uid: MOCK_MEMBER_UID,
      statusText: '\u0032\u0031\u5929\u8bad\u7ec3\u8425\u4f1a\u5458',
      benefitText: '\u4f1a\u5458\u6743\u76ca\u5df2\u751f\u6548',
      canPromote: true,
      redeemedCode: redeemCode
    })

    return {
      status: 200,
      msg: '\u5151\u6362\u6210\u529f',
      data: {
        member,
        overview: buildOverview()
      },
      mock: true
    }
  })
}

function createMockReferralPoster() {
  return ensureMockLogin().then(() => ({
    status: 200,
    msg: 'ok',
    data: {
      memberUid: MOCK_MEMBER_UID,
      posterUrl: '',
      codeUrl: '',
      sharePath: 'pages/home/home?ref=' + MOCK_MEMBER_UID,
      scene: 'ref=' + MOCK_MEMBER_UID
    },
    mock: true
  }))
}

module.exports = {
  MOCK_REDEEM_CODES,
  shouldUseMockFallback,
  ensureMockLogin,
  getMockMineOverview,
  useMockRedeemCode,
  createMockReferralPoster
}
