const { get, post } = require('../utils/request')
const { isMiniappFrontendMockEnabled } = require('../config/api')
const {
  shouldUseMockFallback,
  getMockMineOverview,
  useMockRedeemCode,
  createMockReferralPoster
} = require('../utils/mock-miniapp')

function withMineMockFallback(requestTask, fallback) {
  return requestTask.catch((error) => {
    if (shouldUseMockFallback(error)) {
      return fallback(error)
    }
    throw error
  })
}

function getMineOverview() {
  if (isMiniappFrontendMockEnabled()) {
    return getMockMineOverview()
  }

  return withMineMockFallback(
    get('/api/miniapp/mine/overview'),
    () => getMockMineOverview()
  )
}

function createReferralPoster(data) {
  if (isMiniappFrontendMockEnabled()) {
    return createMockReferralPoster(data)
  }

  return withMineMockFallback(
    post('/api/miniapp/referral/poster', data || {
      page: 'pages/home/home'
    }),
    () => createMockReferralPoster()
  )
}

function useRedeemCode(code) {
  if (isMiniappFrontendMockEnabled()) {
    return useMockRedeemCode(code)
  }

  return withMineMockFallback(
    post('/api/miniapp/redeem-code/use', { code }),
    () => useMockRedeemCode(code)
  )
}

function getMemberPlans() {
  return get('/api/miniapp/training-camp/member-plans')
}

function createTrainingCampMemberOrder(data) {
  return post('/api/miniapp/training-camp/member-order', data || {})
}

function getInviteRecords(data) {
  return get('/api/miniapp/referral/invites', data)
}

function getIncomeRecords(data) {
  return get('/api/miniapp/referral/income', data)
}

function getTrainingCampOrders(data) {
  return get('/api/miniapp/training-camp/orders', data)
}

module.exports = {
  getMineOverview,
  createReferralPoster,
  useRedeemCode,
  getMemberPlans,
  createTrainingCampMemberOrder,
  getInviteRecords,
  getIncomeRecords,
  getTrainingCampOrders
}
