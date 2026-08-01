<?php

namespace crmeb\services\easywechat\v3pay {
    function request()
    {
        return $GLOBALS['wechatTransferFakeRequest'];
    }

    function response($data = '', $status = 200, array $headers = [], $type = 'html')
    {
        return new \WechatTransferFakeResponse($data, $status, $headers, $type);
    }
}

namespace {
    require dirname(__DIR__) . '/src/CRMEB/CRMEB-master/crmeb/vendor/autoload.php';

    use crmeb\services\easywechat\v3pay\OfficialTransferClient;
    use WeChatPay\Crypto\AesGcm;
    use WeChatPay\Crypto\Rsa;
    use WeChatPay\Formatter;

    class WechatTransferFakeRequest
    {
        private $headers;
        private $body;

        public function __construct(array $headers, string $body)
        {
            $this->headers = array_change_key_case($headers, CASE_LOWER);
            $this->body = $body;
        }

        public function header(string $name, string $default = ''): string
        {
            return $this->headers[strtolower($name)] ?? $default;
        }

        public function getContent(): string
        {
            return $this->body;
        }
    }

    class WechatTransferFakeResponse
    {
        public $data;
        public $status;

        public function __construct($data, int $status)
        {
            $this->data = $data;
            $this->status = $status;
        }
    }

    class TestOfficialTransferClient extends OfficialTransferClient
    {
        public function usePlatformPublicKey($publicKey): void
        {
            $this->platformPublicKey = $publicKey;
        }
    }

    function assertTransferTest($condition, string $message): void
    {
        if (!$condition) {
            throw new RuntimeException($message);
        }
    }

    $keyPair = openssl_pkey_new([
        'private_key_bits' => 2048,
        'private_key_type' => OPENSSL_KEYTYPE_RSA,
    ]);
    assertTransferTest($keyPair !== false, 'failed to create callback test key pair');
    openssl_pkey_export($keyPair, $privateKeyPem);
    $publicKeyPem = openssl_pkey_get_details($keyPair)['key'];
    $publicKey = Rsa::from($publicKeyPem, Rsa::KEY_TYPE_PUBLIC);
    $privateKey = Rsa::from($privateKeyPem, Rsa::KEY_TYPE_PRIVATE);

    $apiV3Key = '0123456789abcdef0123456789abcdef';
    $platformPublicKeyId = 'PUB_KEY_ID_TEST';
    $resourceNonce = '123456789012';
    $associatedData = 'mchtransfer';
    $plainText = json_encode([
        'out_bill_no' => 'tx_test_001',
        'transfer_bill_no' => '202608010001',
        'state' => 'SUCCESS',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $body = json_encode([
        'event_type' => 'MCHTRANSFER.BILL.FINISHED',
        'resource' => [
            'ciphertext' => AesGcm::encrypt($plainText, $apiV3Key, $resourceNonce, $associatedData),
            'nonce' => $resourceNonce,
            'associated_data' => $associatedData,
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $timestamp = (string)Formatter::timestamp();
    $callbackNonce = 'callback-nonce';
    $signature = Rsa::sign(
        Formatter::joinedByLineFeed($timestamp, $callbackNonce, $body),
        $privateKey
    );
    $headers = [
        'Wechatpay-Timestamp' => $timestamp,
        'Wechatpay-Nonce' => $callbackNonce,
        'Wechatpay-Signature' => $signature,
        'Wechatpay-Serial' => $platformPublicKeyId,
        'Request-ID' => 'request-test-001',
    ];

    $client = new TestOfficialTransferClient([
        'v3_payment' => [
            'key' => $apiV3Key,
            'v3_pay_public_key' => $platformPublicKeyId,
        ],
    ]);
    $client->usePlatformPublicKey($publicKey);

    $GLOBALS['wechatTransferFakeRequest'] = new WechatTransferFakeRequest($headers, $body);
    $handledNotify = null;
    $successResponse = $client->handleTransferNotify(function ($notify, $successful) use (&$handledNotify) {
        $handledNotify = $notify;
        return $successful;
    });
    assertTransferTest($successResponse->status === 204, 'valid callback should return HTTP 204');
    assertTransferTest($handledNotify->out_bill_no === 'tx_test_001', 'valid callback should be decrypted and dispatched');

    $GLOBALS['wechatTransferFakeRequest'] = new WechatTransferFakeRequest($headers, $body);
    $retryResponse = $client->handleTransferNotify(function () {
        return false;
    });
    assertTransferTest($retryResponse->status === 500, 'business failure should ask WeChat to retry');

    $tamperedBody = substr($body, 0, -1) . ' ';
    $GLOBALS['wechatTransferFakeRequest'] = new WechatTransferFakeRequest($headers, $tamperedBody);
    $callbackWasCalled = false;
    $failureResponse = $client->handleTransferNotify(function () use (&$callbackWasCalled) {
        $callbackWasCalled = true;
        return true;
    });
    assertTransferTest($failureResponse->status === 401, 'tampered callback should return HTTP 401');
    assertTransferTest($callbackWasCalled === false, 'tampered callback must not reach business logic');

    echo "WeChat transfer callback crypto checks passed\n";
}
