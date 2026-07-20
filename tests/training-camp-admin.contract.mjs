import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const read = (path) => readFile(new URL(path, root), 'utf8')

const [service, virtualPayment, controller, routes, api, page, schema, checkout, checkoutView] = await Promise.all([
  read('src/CRMEB/CRMEB-master/crmeb/app/services/miniapp/TrainingCampOrderAdminServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/pay/VirtualPaymentServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/controller/v1/user/member/TrainingCampOrder.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/user.php'),
  read('src/CRMEB/CRMEB-master/template/admin/src/api/user.js'),
  read('src/CRMEB/CRMEB-master/template/admin/src/pages/user/grade/trainingCampOrders/index.vue'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-16-miniapp-virtual-payment.sql'),
  read('homepage-home-v1/miniprogram/packages/features/pages/camp-checkout/camp-checkout.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/camp-checkout/camp-checkout.wxml'),
])

assert.match(service, /class TrainingCampOrderAdminServices/)
assert.match(service, /confirmTrainingCampPayment/)
assert.match(service, /retryDelivery/)
assert.match(service, /deliveryFailed/)
assert.match(service, /refundReview/)
assert.match(service, /function reviewRefund/)
assert.match(service, /refund_entitlement_revoked/)
assert.match(service, /refund_entitlement_retained/)
assert.match(service, /'is_ever_level'\s*=>\s*0/)
assert.match(service, /'is_money_level'\s*=>\s*0/)
assert.doesNotMatch(service, /other_order[^\n]*update\([^\n]*paid/)
assert.match(virtualPayment, /\['review', 'revoked', 'retained'\]/)
assert.match(virtualPayment, /\$nextEntitlement === 'review'/)

assert.match(controller, /syncFromWechat/)
assert.match(controller, /retryDelivery/)
assert.match(controller, /reviewRefund/)
assert.match(routes, /member\/training_camp\/orders/)
assert.match(routes, /retry_delivery/)
assert.match(routes, /refund_review/)

assert.match(api, /trainingCampOrderList/)
assert.match(api, /trainingCampOrderSync/)
assert.match(api, /trainingCampOrderRetryDelivery/)
assert.match(api, /trainingCampOrderReviewRefund/)
assert.match(page, /训练营订单详情/)
assert.match(page, /核对支付/)
assert.match(page, /重试权益确认/)
assert.match(page, /退款待复核/)
assert.match(page, /撤销会员/)
assert.match(page, /保留会员/)

assert.match(schema, /admin-user-grade-training-camp-orders/)
assert.match(schema, /admin-user-grade-registration/)
assert.match(schema, /admin-user-training-camp-order-retry-delivery/)
assert.match(schema, /admin-user-training-camp-order-refund-review/)

assert.match(checkout, /申请退款，请联系客服/)
assert.match(checkoutView, /open-type="contact"/)

console.log('training camp admin contract checks passed')
