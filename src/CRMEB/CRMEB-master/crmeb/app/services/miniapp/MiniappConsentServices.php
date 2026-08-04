<?php

namespace app\services\miniapp;

use app\services\BaseServices;
use crmeb\exceptions\ApiException;
use think\facade\Db;

class MiniappConsentServices extends BaseServices
{
    private const TABLE = 'miniapp_user_consent';
    private const AGREEMENT_TYPE = 'login_bundle';

    public function recordLoginConsent(int $uid, string $agreementVersion, string $privacyContractName = ''): array
    {
        $agreementVersion = trim($agreementVersion);
        $privacyContractName = trim($privacyContractName);

        if ($uid <= 0) {
            throw new ApiException('请先登录');
        }
        if (!preg_match('/^[A-Za-z0-9._-]{1,64}$/', $agreementVersion)) {
            throw new ApiException('协议版本无效');
        }
        if (mb_strlen($privacyContractName) > 128) {
            throw new ApiException('隐私保护指引名称过长');
        }

        return Db::transaction(function () use ($uid, $agreementVersion, $privacyContractName) {
            $user = Db::name('user')->where('uid', $uid)->lock(true)->field('uid')->find();
            if (!$user) {
                throw new ApiException('用户不存在');
            }

            $where = [
                'uid' => $uid,
                'agreement_type' => self::AGREEMENT_TYPE,
                'agreement_version' => $agreementVersion,
            ];
            $record = Db::name(self::TABLE)->where($where)->find();

            if (!$record) {
                $now = time();
                $id = (int)Db::name(self::TABLE)->insertGetId([
                    'uid' => $uid,
                    'agreement_type' => self::AGREEMENT_TYPE,
                    'agreement_version' => $agreementVersion,
                    'privacy_contract_name' => $privacyContractName,
                    'source' => 'miniapp_login',
                    'agreed_at' => $now,
                    'add_time' => $now,
                    'update_time' => $now,
                ]);
                $record = Db::name(self::TABLE)->where('id', $id)->find();
            } elseif ($privacyContractName !== '' && empty($record['privacy_contract_name'])) {
                Db::name(self::TABLE)->where('id', (int)$record['id'])->update([
                    'privacy_contract_name' => $privacyContractName,
                    'update_time' => time(),
                ]);
                $record['privacy_contract_name'] = $privacyContractName;
            }

            return [
                'recorded' => true,
                'id' => (int)$record['id'],
                'agreementType' => (string)$record['agreement_type'],
                'agreementVersion' => (string)$record['agreement_version'],
                'agreedAt' => (int)$record['agreed_at'],
            ];
        });
    }
}
