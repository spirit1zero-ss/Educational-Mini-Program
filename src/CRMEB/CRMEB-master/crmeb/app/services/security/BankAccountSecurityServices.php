<?php

declare(strict_types=1);

namespace app\services\security;

use crmeb\exceptions\AdminException;
use think\facade\Env;

/**
 * Encrypts bank payout details before they are written to the database.
 *
 * The encryption key must only be supplied through the deployment environment.
 * It must never be returned to the browser, written to logs or stored in source.
 */
class BankAccountSecurityServices
{
    private const CIPHER = 'aes-256-gcm';
    private const PAYLOAD_VERSION = 1;
    private const CONSENT_VERSION = 'bank-withdrawal-v1';

    public function isConfigured(): bool
    {
        return strlen($this->secret()) >= 32 && function_exists('openssl_encrypt');
    }

    public function consentVersion(): string
    {
        return self::CONSENT_VERSION;
    }

    public function normalizeCardNumber(string $cardNumber): string
    {
        return preg_replace('/[\s-]+/', '', trim($cardNumber)) ?: '';
    }

    public function validateDetails(array $details): array
    {
        $realName = trim((string)($details['real_name'] ?? ''));
        $cardNumber = $this->normalizeCardNumber((string)($details['bank_code'] ?? ''));
        $bankName = trim((string)($details['bank_address'] ?? ''));

        if (!preg_match("/^[\\p{L}·•.'\\-\\s]{2,64}$/u", $realName)) {
            throw new AdminException('请输入与银行卡开户信息一致的真实姓名');
        }
        if (!preg_match('/^\d{12,19}$/', $cardNumber)) {
            throw new AdminException('请输入12至19位有效银行卡号');
        }
        if (mb_strlen($bankName) < 2 || mb_strlen($bankName) > 100
            || preg_match('/[\x00-\x1F\x7F]/u', $bankName)) {
            throw new AdminException('请输入正确的开户银行或支行名称');
        }

        return [
            'real_name' => $realName,
            'bank_code' => $cardNumber,
            'bank_address' => $bankName,
        ];
    }

    public function encrypt(array $details, string $associatedData): string
    {
        if (!$this->isConfigured()) {
            throw new AdminException('银行卡提现安全密钥尚未配置');
        }

        $details = $this->validateDetails($details);
        $plainText = json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($plainText === false) {
            throw new AdminException('银行卡资料处理失败');
        }

        $iv = random_bytes(12);
        $tag = '';
        $cipherText = openssl_encrypt(
            $plainText,
            self::CIPHER,
            $this->key(),
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            $associatedData,
            16
        );
        if ($cipherText === false || strlen($tag) !== 16) {
            throw new AdminException('银行卡资料加密失败');
        }

        $payload = json_encode([
            'v' => self::PAYLOAD_VERSION,
            'iv' => base64_encode($iv),
            'tag' => base64_encode($tag),
            'data' => base64_encode($cipherText),
        ], JSON_UNESCAPED_SLASHES);

        if ($payload === false) {
            throw new AdminException('银行卡资料加密失败');
        }
        return $payload;
    }

    public function decrypt(string $payload, string $associatedData): array
    {
        if (!$this->isConfigured()) {
            throw new AdminException('银行卡提现安全密钥尚未配置');
        }

        $envelope = json_decode($payload, true);
        if (!is_array($envelope)
            || (int)($envelope['v'] ?? 0) !== self::PAYLOAD_VERSION
            || !isset($envelope['iv'], $envelope['tag'], $envelope['data'])) {
            throw new AdminException('银行卡资料格式无效');
        }

        $iv = base64_decode((string)$envelope['iv'], true);
        $tag = base64_decode((string)$envelope['tag'], true);
        $cipherText = base64_decode((string)$envelope['data'], true);
        if ($iv === false || $tag === false || $cipherText === false) {
            throw new AdminException('银行卡资料格式无效');
        }

        $plainText = openssl_decrypt(
            $cipherText,
            self::CIPHER,
            $this->key(),
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            $associatedData
        );
        $details = $plainText === false ? null : json_decode($plainText, true);
        if (!is_array($details)) {
            throw new AdminException('银行卡资料解密失败，请核对安全密钥');
        }

        return $this->validateDetails($details);
    }

    public function maskCardNumber(string $cardNumber): string
    {
        $digits = $this->normalizeCardNumber($cardNumber);
        if (strlen($digits) < 8) {
            return $digits === '' ? '' : '****' . substr($digits, -4);
        }
        return substr($digits, 0, 4) . ' **** **** ' . substr($digits, -4);
    }

    public function maskRealName(string $realName): string
    {
        $realName = trim($realName);
        if ($realName === '') {
            return '';
        }
        return mb_substr($realName, 0, 1) . str_repeat('*', max(1, mb_strlen($realName) - 1));
    }

    public function associatedData(int $uid, string $orderId): string
    {
        return 'user_extract:' . $uid . ':' . trim($orderId);
    }

    private function key(): string
    {
        return hash('sha256', $this->secret(), true);
    }

    private function secret(): string
    {
        return trim((string)Env::get('security.bank_data_key', ''));
    }
}
