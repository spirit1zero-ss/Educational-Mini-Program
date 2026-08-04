<?php

namespace crmeb\services\easywechat\v3pay;

use crmeb\exceptions\PayException;
use EasyWeChat\Payment\Order;
use GuzzleHttp\Exception\RequestException;
use think\facade\Log;
use WeChatPay\Builder;
use WeChatPay\Crypto\AesGcm;
use WeChatPay\Crypto\Rsa;
use WeChatPay\Formatter;

/**
 * 微信支付官方 SDK 商家转账客户端。
 *
 * 仅承接商家转账、转账查单和转账回调，避免影响项目现有支付、退款链路。
 */
class OfficialTransferClient
{
    const API_TRANSFER_BILLS_URL = 'v3/fund-app/mch-transfer/transfer-bills';
    const API_TRANSFER_QUERY_URL = 'v3/fund-app/mch-transfer/transfer-bills/out-bill-no/{out_bill_no}';
    const CALLBACK_MAXIMUM_CLOCK_OFFSET = 300;

    /** @var array */
    protected $config;

    /** @var string */
    protected $type = Order::JSAPI;

    /** @var \WeChatPay\BuilderChainable|null */
    protected $client;

    /** @var mixed */
    protected $platformPublicKey;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function setType(string $type)
    {
        $this->type = $type;
        return $this;
    }

    /**
     * 发起商家转账。金额单位为分。
     */
    public function transferBills($orderId, $transferSceneId, $openid, $userName, $transferAmount, $transferRemark, $notifyUrl, $userRecvPerception, $transferSceneReportInfos)
    {
        $appid = $this->resolveAppid();
        $orderId = trim((string)$orderId);
        $openid = trim((string)$openid);
        $transferSceneId = trim((string)$transferSceneId);
        $transferRemark = trim((string)$transferRemark);
        $notifyUrl = trim((string)$notifyUrl);
        $transferSceneReportInfos = array_values((array)$transferSceneReportInfos);
        $transferAmount = (int)$transferAmount;

        if ($orderId === '' || $openid === '') {
            throw new PayException('商家转账缺少商户单号或用户 OpenID');
        }
        if (!preg_match('/^[A-Za-z0-9]{1,32}$/', $orderId)) {
            throw new PayException('商家转账单号只能包含数字和大小写字母，且不能超过 32 个字符');
        }
        if ($transferSceneId === '' || strlen($transferSceneId) > 36) {
            throw new PayException('请配置有效的商家转账场景 ID');
        }
        if ($transferAmount <= 0) {
            throw new PayException('商家转账金额必须大于 0');
        }
        if ($transferRemark === '' || mb_strlen($transferRemark, 'UTF-8') > 32) {
            throw new PayException('商家转账备注不能为空，且不能超过 32 个字符');
        }
        if ($notifyUrl !== '' && (!$this->isHttpsUrlWithoutQuery($notifyUrl))) {
            throw new PayException('商家转账通知地址必须是无参数的公网 HTTPS 地址');
        }
        $this->validateSceneReportInfos($transferSceneReportInfos);
        if ($transferAmount >= 200000 && trim((string)$userName) === '') {
            throw new PayException('转账金额大于等于 2000 元时，必须填写收款人姓名');
        }

        $data = [
            'appid' => $appid,
            'out_bill_no' => $orderId,
            'transfer_scene_id' => $transferSceneId,
            'openid' => $openid,
            'transfer_amount' => $transferAmount,
            'transfer_remark' => $transferRemark,
            'notify_url' => $notifyUrl,
            'user_recv_perception' => (string)$userRecvPerception,
            'transfer_scene_report_infos' => $transferSceneReportInfos,
        ];

        if ($transferAmount >= 200000) {
            $data['user_name'] = Rsa::encrypt((string)$userName, $this->getPlatformPublicKey());
        }

        try {
            $response = $this->getClient()
                ->chain(self::API_TRANSFER_BILLS_URL)
                ->post([
                    'headers' => ['Wechatpay-Serial' => $this->getPlatformPublicKeyId()],
                    'json' => $data,
                ]);

            return $this->decodeResponse($response, '微信支付：发起商家转账失败');
        } catch (\Throwable $e) {
            throw $this->toPayException($e, '微信支付：发起商家转账失败');
        }
    }

    /**
     * 按商户单号查询商家转账结果。
     */
    public function queryTransferBills(string $outBillNo)
    {
        if (trim($outBillNo) === '') {
            throw new PayException('商家转账查询缺少商户单号');
        }

        try {
            $response = $this->getClient()
                ->chain(self::API_TRANSFER_QUERY_URL)
                ->get(['out_bill_no' => $outBillNo]);

            return $this->decodeResponse($response, '微信支付：商家转账查询失败');
        } catch (\Throwable $e) {
            throw $this->toPayException($e, '微信支付：商家转账查询失败');
        }
    }

    /**
     * 先验签、检查时间偏移，再解密并分发商家转账回调。
     */
    public function handleTransferNotify(callable $callback)
    {
        $request = request();
        $requestId = (string)$request->header('Request-ID', '');

        try {
            $timestamp = (string)$request->header('Wechatpay-Timestamp', '');
            $nonce = (string)$request->header('Wechatpay-Nonce', '');
            $signature = (string)$request->header('Wechatpay-Signature', '');
            $serial = (string)$request->header('Wechatpay-Serial', '');
            $rawBody = (string)$request->getContent();

            if ($timestamp === '' || $nonce === '' || $signature === '' || $serial === '' || $rawBody === '') {
                return $this->notifyFailure('回调请求缺少验签信息', 400);
            }
            if (!ctype_digit($timestamp)
                || abs(Formatter::timestamp() - (int)$timestamp) > self::CALLBACK_MAXIMUM_CLOCK_OFFSET) {
                return $this->notifyFailure('回调时间戳已过期', 401);
            }
            if (!hash_equals($this->getPlatformPublicKeyId(), $serial)) {
                return $this->notifyFailure('回调签名公钥不匹配', 401);
            }

            $verified = Rsa::verify(
                Formatter::joinedByLineFeed($timestamp, $nonce, $rawBody),
                $signature,
                $this->getPlatformPublicKey()
            );
            if (!$verified) {
                return $this->notifyFailure('回调签名验证失败', 401);
            }

            $body = json_decode($rawBody, true);
            if (!is_array($body) || json_last_error() !== JSON_ERROR_NONE) {
                return $this->notifyFailure('回调内容不是有效 JSON', 400);
            }
            if (($body['event_type'] ?? '') !== 'MCHTRANSFER.BILL.FINISHED') {
                return $this->notifyFailure('不支持的商家转账回调类型', 400);
            }

            $resource = $body['resource'] ?? [];
            foreach (['ciphertext', 'nonce', 'associated_data'] as $field) {
                if (!isset($resource[$field]) || !is_string($resource[$field])) {
                    return $this->notifyFailure('回调加密内容不完整', 400);
                }
            }

            $plainText = AesGcm::decrypt(
                $resource['ciphertext'],
                $this->getApiV3Key(),
                $resource['nonce'],
                $resource['associated_data']
            );
            $notify = json_decode($plainText);
            if (!is_object($notify)
                || empty($notify->out_bill_no)
                || empty($notify->transfer_bill_no)
                || empty($notify->state)) {
                return $this->notifyFailure('回调业务内容不完整', 400);
            }

            try {
                $handled = call_user_func_array($callback, [$notify, true]);
            } catch (\Throwable $e) {
                Log::error('wechat_transfer_notify_handler_failed', [
                    'request_id' => $requestId,
                    'out_bill_no' => (string)$notify->out_bill_no,
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                ]);
                return $this->notifyFailure('商家转账结果处理失败', 500);
            }
            if ($handled === true) {
                return response('', 204);
            }

            return $this->notifyFailure('商家转账结果处理失败', 500);
        } catch (\Throwable $e) {
            Log::warning('wechat_transfer_notify_rejected', [
                'request_id' => $requestId,
                'exception' => get_class($e),
                'message' => $e->getMessage(),
            ]);
            return $this->notifyFailure('商家转账回调验证失败', 401);
        }
    }

    protected function getClient()
    {
        if ($this->client !== null) {
            return $this->client;
        }

        $mchid = $this->requireConfig('mchid', '请先配置微信支付商户号');
        $merchantSerial = $this->requireConfig('serial_no', '请先配置商户 API 证书序列号');
        $privateKeyPath = $this->requireReadableFile('key_path', '请先配置有效的商户 API 私钥');
        $platformPublicKeyId = $this->getPlatformPublicKeyId();

        $this->client = Builder::factory([
            'mchid' => $mchid,
            'serial' => $merchantSerial,
            'privateKey' => Rsa::from($this->fileUri($privateKeyPath), Rsa::KEY_TYPE_PRIVATE),
            'certs' => [
                $platformPublicKeyId => $this->getPlatformPublicKey(),
            ],
            'timeout' => 60,
            'connect_timeout' => 10,
        ]);

        return $this->client;
    }

    protected function getPlatformPublicKey()
    {
        if ($this->platformPublicKey !== null) {
            return $this->platformPublicKey;
        }

        $path = $this->requireReadableFile('v3_pay_public_pem', '请先配置有效的微信支付公钥文件');
        $this->platformPublicKey = Rsa::from($this->fileUri($path), Rsa::KEY_TYPE_PUBLIC);
        return $this->platformPublicKey;
    }

    protected function getPlatformPublicKeyId(): string
    {
        return $this->requireConfig('v3_pay_public_key', '请先配置微信支付公钥 ID');
    }

    protected function getApiV3Key(): string
    {
        $key = $this->requireConfig('key', '请先配置微信支付 APIv3 密钥');
        if (strlen($key) !== 32) {
            throw new PayException('微信支付 APIv3 密钥必须为 32 个字符');
        }
        return $key;
    }

    protected function validateSceneReportInfos(array $reportInfos): void
    {
        if ($reportInfos === []) {
            throw new PayException('商家转账场景报备信息不能为空');
        }
        foreach ($reportInfos as $reportInfo) {
            $infoType = trim((string)($reportInfo['info_type'] ?? ''));
            $infoContent = trim((string)($reportInfo['info_content'] ?? ''));
            if ($infoType === '' || mb_strlen($infoType, 'UTF-8') > 15) {
                throw new PayException('商家转账报备信息类型不能为空，且不能超过 15 个字符');
            }
            if ($infoContent === '' || mb_strlen($infoContent, 'UTF-8') > 32) {
                throw new PayException('商家转账报备信息内容不能为空，且不能超过 32 个字符');
            }
        }
    }

    protected function isHttpsUrlWithoutQuery(string $url): bool
    {
        return filter_var($url, FILTER_VALIDATE_URL) !== false
            && strtolower((string)parse_url($url, PHP_URL_SCHEME)) === 'https'
            && parse_url($url, PHP_URL_QUERY) === null;
    }

    protected function resolveAppid(): string
    {
        if ($this->type === Order::JSAPI) {
            $appid = $this->config['wechat']['appid'] ?? '';
        } elseif ($this->type === 'mini') {
            $appid = $this->config['miniprog']['appid'] ?? '';
        } elseif ($this->type === Order::APP) {
            $appid = $this->config['app']['appid'] ?? '';
        } else {
            $appid = '';
        }

        if (trim((string)$appid) === '') {
            throw new PayException('当前用户渠道未配置可用于商家转账的 AppID');
        }
        return trim((string)$appid);
    }

    protected function requireConfig(string $key, string $message): string
    {
        $value = trim((string)($this->config['v3_payment'][$key] ?? ''));
        if ($value === '') {
            throw new PayException($message);
        }
        return $value;
    }

    protected function requireReadableFile(string $key, string $message): string
    {
        $path = $this->requireConfig($key, $message);
        if (!is_file($path) || !is_readable($path)) {
            throw new PayException($message);
        }
        return $path;
    }

    protected function fileUri(string $path): string
    {
        $realPath = realpath($path) ?: $path;
        return 'file:///' . ltrim(str_replace('\\', '/', $realPath), '/');
    }

    protected function decodeResponse($response, string $fallback): array
    {
        $data = json_decode((string)$response->getBody(), true);
        if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
            throw new PayException($fallback . '，微信返回内容无法解析');
        }
        return $data;
    }

    protected function toPayException(\Throwable $e, string $fallback): PayException
    {
        if ($e instanceof PayException) {
            return $e;
        }

        $message = '';
        $code = 0;
        if ($e instanceof RequestException && $e->hasResponse()) {
            $code = (int)$e->getResponse()->getStatusCode();
            $body = json_decode((string)$e->getResponse()->getBody(), true);
            if (is_array($body)) {
                $message = trim((string)($body['message'] ?? ''));
                $wechatCode = trim((string)($body['code'] ?? ''));
                if ($wechatCode !== '') {
                    $message = $message !== '' ? $message . '（' . $wechatCode . '）' : $wechatCode;
                }
            }
        }

        return new PayException($message !== '' ? $message : $fallback, [], $code, $e);
    }

    protected function notifyFailure(string $message, int $status)
    {
        return response([
            'code' => 'FAIL',
            'message' => $message,
        ], $status, [], 'json');
    }
}
