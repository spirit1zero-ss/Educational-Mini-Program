import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const read = (path) => readFile(new URL(path, root), 'utf8')

const [composer, client, storage, controller, legacyClient, settingsController] = await Promise.all([
  read('src/CRMEB/CRMEB-master/crmeb/composer.json'),
  read('src/CRMEB/CRMEB-master/crmeb/crmeb/services/easywechat/v3pay/OfficialTransferClient.php'),
  read('src/CRMEB/CRMEB-master/crmeb/crmeb/services/pay/storage/V3WechatPay.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/api/controller/v1/PayController.php'),
  read('src/CRMEB/CRMEB-master/crmeb/crmeb/services/easywechat/v3pay/PayClient.php'),
  read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/controller/v1/setting/SystemConfig.php'),
])

const dependencies = JSON.parse(composer).require
assert.equal(dependencies['wechatpay/wechatpay'], '^1.4')
assert.equal(dependencies['guzzle/guzzle'], '3.9.3', 'legacy Guzzle 3 users must remain installable')

assert.match(client, /use WeChatPay\\Builder;/)
assert.match(client, /Builder::factory\s*\(/)
assert.match(client, /use WeChatPay\\Crypto\\Rsa;/)
assert.match(client, /use WeChatPay\\Crypto\\AesGcm;/)
assert.match(client, /'certs'\s*=>\s*\[/)
assert.match(client, /'Wechatpay-Serial'\s*=>\s*\$this->getPlatformPublicKeyId\(\)/)
assert.match(client, /chain\(self::API_TRANSFER_BILLS_URL\)/)
assert.match(client, /chain\(self::API_TRANSFER_QUERY_URL\)/)
assert.doesNotMatch(client, /CURLOPT_SSL_VERIFYPEER|CURLOPT_SSL_VERIFYHOST|verify\s*=>\s*false/)

assert.match(client, /\$transferAmount\s*>=\s*200000/)
assert.match(client, /Rsa::encrypt\(\(string\)\$userName/)
assert.match(legacyClient, /\$transfer_amount\s*>=\s*200000/)

const timestampCheck = client.indexOf('CALLBACK_MAXIMUM_CLOCK_OFFSET')
const signatureCheck = client.indexOf('Rsa::verify(')
const decrypt = client.indexOf('AesGcm::decrypt(')
const callback = client.indexOf('call_user_func_array($callback')
assert.ok(timestampCheck >= 0 && signatureCheck > timestampCheck)
assert.ok(decrypt > signatureCheck, 'callback signature must be verified before decrypting')
assert.ok(callback > decrypt, 'business callback must run only after verification and decryption')
assert.match(client, /hash_equals\(\$this->getPlatformPublicKeyId\(\),\s*\$serial\)/)
assert.match(client, /Formatter::joinedByLineFeed\(\$timestamp,\s*\$nonce,\s*\$rawBody\)/)
assert.match(client, /return response\('',\s*204\)/)
assert.match(client, /notifyFailure\('商家转账结果处理失败',\s*500\)/)

assert.match(storage, /new OfficialTransferClient\(\$config\)/)
assert.match(storage, /\$this->transferClient->setType\(\$type\)->transferBills\(/)
assert.match(storage, /\$this->transferClient->queryTransferBills\(/)
assert.match(storage, /\$this->transferClient->handleTransferNotify\(/)
assert.doesNotMatch(
  controller.slice(controller.indexOf('public function transferNotify')),
  /handleTransferNotify\(\)->getContent\(\)/,
  'the callback HTTP status and headers must not be flattened into a string',
)
assert.match(settingsController, /'v3_pay_public_pem'\s*=>\s*'public_key'/)
assert.match(settingsController, /\$systemPemServices->savePem\(\[/)
assert.match(settingsController, /\$systemPemServices->getPemPath\(\$name\)/)

console.log('official WeChat transfer SDK contract checks passed')
