import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const read = (path) => readFile(new URL(path, root), 'utf8')

const [client, page, checkout, api, service, lockService, miniappService, crontabService, routes, config, schema, easyWechatCollection] = await Promise.all([
  read('homepage-home-v1/miniprogram/utils/virtual-payment.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/camp-orders/camp-orders.js'),
  read('homepage-home-v1/miniprogram/packages/features/pages/camp-checkout/camp-checkout.js'),
  read('homepage-home-v1/miniprogram/api/mine.js'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/pay/VirtualPaymentServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/pay/PaymentLockService.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/miniapp/MiniappServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/services/system/crontab/CrontabRunServices.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php'),
  read('src/CRMEB/CRMEB-master/crmeb/config/xpay.php'),
  read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-16-miniapp-virtual-payment.sql'),
  read('src/CRMEB/CRMEB-master/crmeb/vendor/overtrue/wechat/src/Support/Collection.php')
])

assert.match(client, /wx\.requestVirtualPayment\s*\(/)
assert.doesNotMatch(page, /wx\.requestPayment\s*\(/)
assert.doesNotMatch(checkout, /wx\.requestPayment\s*\(/)
assert.match(checkout, /requestTrainingCampVirtualPayment\(order\.orderId\)/)
assert.doesNotMatch(checkout, /请到订单页继续支付/)
assert.match(client, /payType:\s*'virtual'/)
assert.match(client, /wx\.login\s*\(/)
assert.match(client, /confirmTrainingCampMemberOrder/)
assert.match(client, /payment\.alreadyConfirmed/)
assert.match(api, /member-order\/confirm/)
assert.match(routes, /member-order\/confirm/)

assert.match(service, /hash_hmac\('sha256',\s*\$uri\s*\.\s*'&'\s*\.\s*\$signData/)
assert.match(service, /hash_hmac\('sha256',\s*\$signData,\s*\$sessionKey\)/)
assert.match(service, /short_series_goods/)
assert.match(service, /goodsPrice/)
assert.match(service, /query_order/)
assert.match(service, /notify_provide_goods/)
assert.match(service, /PayServices::VIRTUAL_PAY/)
assert.match(service, /assertTrainingCampOrderClosable/)
assert.match(service, /reconcilePendingPayments/)
assert.match(service, /active_order_key/)
assert.match(service, /lock->run\('camp:order:'/)
assert.match(service, /if \(\$wxOrderId !== ''\)[\s\S]*\$payload\['wx_order_id'\][\s\S]*else[\s\S]*\$payload\['order_id'\]/)
assert.match(lockService, /bin2hex\(random_bytes\(16\)\)/)
assert.match(lockService, /redis\.call\('get', KEYS\[1\]\) == ARGV\[1\]/)
assert.match(lockService, /microtime\(true\) < \$deadline/)
assert.match(miniappService, /miniapp_training_camp_order/)
assert.match(miniappService, /whereIn\('c\.order_state', \['pending', 'paying'\]\)/)
assert.match(miniappService, /expireStaleTrainingCampOrders/)
assert.match(crontabService, /virtualPaymentReconcile/)
assert.match(crontabService, /expireStaleTrainingCampOrders/)

assert.match(config, /sandbox_app_key/)
assert.match(config, /production_app_key/)
assert.doesNotMatch(config, /app_key'\s*=>\s*'[A-Za-z0-9]{16,}'/)
assert.match(schema, /UNIQUE KEY `uniq_out_trade_no`/)
assert.match(schema, /CREATE TABLE IF NOT EXISTS `eb_miniapp_training_camp_order`/)
assert.match(schema, /UNIQUE KEY `uniq_active_order_key`/)
assert.match(schema, /WHERE NOT EXISTS/)
assert.match(easyWechatCollection, /public static function __set_state\(array \$state\)/)

// Official XPay signing example from the WeChat virtual-payment documentation.
const body = '{"openid": "xxx", "user_ip": "127.0.0.1", "env": 0}'
const signature = createHmac('sha256', '12345')
  .update(`/xpay/query_user_balance&${body}`)
  .digest('hex')
assert.equal(signature, 'c37809f27c6d7fd1837ad2500a04512b66b34fd793a39a385fade56dca89a4b5')

console.log('virtual payment contract checks passed')
