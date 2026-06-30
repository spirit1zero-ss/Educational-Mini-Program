const { get, post } = require('../utils/request')

function getMineOverview() {
  return get('/api/miniapp/mine/overview')
}

function createReferralPoster(data) {
  return post('/api/miniapp/referral/poster', data || {
    page: 'pages/home/home'
  })
}

function useRedeemCode(code) {
  return post('/api/miniapp/redeem-code/use', { code })
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
  getInviteRecords,
  getIncomeRecords,
  getTrainingCampOrders
}
