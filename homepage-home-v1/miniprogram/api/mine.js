const { get, post } = require('../utils/request')

function getMineOverview(options) {
  return get('/api/miniapp/mine/overview', {}, options || {})
}

function createReferralPoster(data) {
  return post('/api/miniapp/referral/poster', data || {
    page: 'pages/home/home'
  })
}

function useRedeemCode(code) {
  return post('/api/miniapp/redeem-code/use', { code })
}

function getMemberPlans() {
  return get('/api/miniapp/training-camp/member-plans')
}

function createTrainingCampMemberOrder(data) {
  return post('/api/miniapp/training-camp/member-order', data || {})
}

function payTrainingCampMemberOrder(data) {
  return post('/api/miniapp/training-camp/member-order/pay', data || {})
}

function cancelTrainingCampMemberOrder(data) {
  return post('/api/miniapp/training-camp/member-order/cancel', data || {})
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

function getTrainingCampRegistration() {
  return get('/api/miniapp/training-camp/registration')
}

function saveTrainingCampRegistration(data) {
  return post('/api/miniapp/training-camp/registration', data || {})
}

module.exports = {
  getMineOverview,
  createReferralPoster,
  useRedeemCode,
  getMemberPlans,
  createTrainingCampMemberOrder,
  payTrainingCampMemberOrder,
  cancelTrainingCampMemberOrder,
  getInviteRecords,
  getIncomeRecords,
  getTrainingCampOrders,
  getTrainingCampRegistration,
  saveTrainingCampRegistration
}
