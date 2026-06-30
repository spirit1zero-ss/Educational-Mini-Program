<?php

namespace app\services\miniapp;

use app\services\BaseServices;
use app\services\user\UserBrokerageServices;
use app\services\user\UserServices;
use app\services\wechat\RoutineServices;
use app\services\wechat\WechatUserServices;
use crmeb\exceptions\ApiException;
use crmeb\services\CacheService;

class MiniappServices extends BaseServices
{
    public function login(string $code, string $referrerUid = ''): array
    {
        if ($code === '') {
            throw new ApiException('Missing wx.login code');
        }

        $spreadUid = $this->decodeMemberUid($referrerUid);

        /** @var RoutineServices $routineServices */
        $routineServices = app()->make(RoutineServices::class);
        $authInfo = $routineServices->authType($code, 0, $spreadUid);
        $createData = CacheService::get($authInfo['key'] ?? '');
        $loginInfo = $routineServices->authLogin($authInfo['key']);

        [$openid] = $createData ?: [''];
        /** @var WechatUserServices $wechatUserServices */
        $wechatUserServices = app()->make(WechatUserServices::class);
        $user = $openid ? $wechatUserServices->getAuthUserInfo($openid, 'routine') : null;
        $user = $this->modelToArray($user);

        if (!$user || empty($user['uid'])) {
            throw new ApiException('Miniapp user login failed');
        }

        if ($spreadUid > 0) {
            $this->bindReferrer((int)$user['uid'], $spreadUid);
        }

        return [
            'token' => $loginInfo['token'],
            'expiresTime' => $loginInfo['expires_time'] ?? 0,
            'bindName' => $loginInfo['bindName'] ?? false,
            'user' => $this->formatUser($user),
        ];
    }

    public function getMineOverview(int $uid): array
    {
        $user = $this->requireUser($uid);
        $member = $this->formatMember($user);

        return [
            'member' => $member,
            'trainingCamp' => [
                'productId' => 'training-camp-21-days',
                'title' => $this->zh('\u0032\u0031\u5929\u81ea\u4e3b\u5b66\u4e60\u8bad\u7ec3\u8425'),
                'subtitle' => $this->zh('\u76f4\u64ad\u8bfe + \u6253\u5361\u966a\u8dd1 + \u7b54\u7591\u670d\u52a1'),
                'priceText' => $this->zh('\u0033\u0039\u0039\u5143'),
                'ctaText' => $member['isMember'] ? $this->zh('\u8fdb\u5165\u8bad\u7ec3\u8425') : $this->zh('\u7acb\u5373\u62a5\u540d'),
            ],
            'benefitText' => $member['isMember'] ? $this->zh('\u4f1a\u5458\u6743\u76ca\u5df2\u5f00\u901a') : $this->zh('\u62a5\u540d\u540e\u5f00\u901a\u4f1a\u5458\u6743\u76ca'),
            'referral' => $this->formatReferral($user),
        ];
    }

    public function createReferralPoster(int $uid, string $page = ''): array
    {
        $user = $this->requireUser($uid);
        $member = $this->formatMember($user);
        if (!$member['isMember']) {
            throw new ApiException('Please join the training camp before creating a referral poster');
        }

        $page = $page ?: 'pages/home/home';
        $memberUid = $member['uid'];

        return [
            'memberUid' => $memberUid,
            'posterUrl' => '',
            'sharePath' => $page . '?ref=' . $memberUid,
            'scene' => 'ref=' . $memberUid,
        ];
    }

    public function useRedeemCode(int $uid, string $code): array
    {
        $this->requireUser($uid);
        if (trim($code) === '') {
            throw new ApiException('Missing redeem code');
        }

        throw new ApiException('Redeem code backend is not configured yet');
    }

    public function getInviteRecords(int $uid, int $grade = 0, string $sort = '', string $keyword = ''): array
    {
        $this->requireUser($uid);
        /** @var UserServices $userServices */
        $userServices = app()->make(UserServices::class);
        return $userServices->getUserSpreadGrade($uid, $grade, $sort, $keyword);
    }

    public function getIncomeRecords(int $uid, int $type = 3): array
    {
        $this->requireUser($uid);
        /** @var UserBrokerageServices $brokerageServices */
        $brokerageServices = app()->make(UserBrokerageServices::class);
        return $brokerageServices->getBrokerageList($uid, $type);
    }

    public function getTrainingCampOrders(int $uid): array
    {
        $this->requireUser($uid);
        return [
            'list' => [],
            'count' => 0,
        ];
    }

    private function requireUser(int $uid): array
    {
        if ($uid <= 0) {
            throw new ApiException('Please login first');
        }

        /** @var UserServices $userServices */
        $userServices = app()->make(UserServices::class);
        $user = $this->modelToArray($userServices->getUserInfo($uid));
        if (!$user) {
            throw new ApiException('User not found');
        }
        return $user;
    }

    private function formatUser(array $user): array
    {
        return [
            'uid' => (int)$user['uid'],
            'memberUid' => $this->encodeMemberUid((int)$user['uid']),
            'nickname' => $user['nickname'] ?? '',
            'avatar' => $user['avatar'] ?? '',
            'phone' => $user['phone'] ?? '',
        ];
    }

    private function formatMember(array $user): array
    {
        $isMember = $this->isTrainingCampMember($user);
        return [
            'isMember' => $isMember,
            'uid' => $this->encodeMemberUid((int)$user['uid']),
            'statusText' => $isMember ? $this->zh('\u0032\u0031\u5929\u8bad\u7ec3\u8425\u4f1a\u5458') : $this->zh('\u672a\u5f00\u901a\u8bad\u7ec3\u8425'),
            'expiresAt' => $this->formatOverdueTime((int)($user['overdue_time'] ?? 0)),
        ];
    }

    private function formatReferral(array $user): array
    {
        $uid = (int)$user['uid'];
        /** @var UserServices $userServices */
        $userServices = app()->make(UserServices::class);
        $inviteCount = (int)($user['spread_count'] ?? count($userServices->getUserSpredadUids($uid, 1)));
        $isMember = $this->isTrainingCampMember($user);

        return [
            'inviteCount' => $inviteCount,
            'orderCount' => (int)($user['pay_count'] ?? 0),
            'incomeAmount' => $this->formatAmount($user['brokerage_price'] ?? 0),
            'posterCount' => 0,
            'canPromote' => $isMember,
            'posterCtaText' => $isMember ? $this->zh('\u751f\u6210\u63a8\u5e7f\u6d77\u62a5') : $this->zh('\u5f00\u901a\u540e\u751f\u6210\u63a8\u5e7f\u6d77\u62a5'),
        ];
    }

    private function isTrainingCampMember(array $user): bool
    {
        $overdueTime = (int)($user['overdue_time'] ?? 0);
        $isPaidLevel = (int)($user['is_money_level'] ?? 0) > 0 && ($overdueTime === 0 || $overdueTime > time());
        return (int)($user['is_ever_level'] ?? 0) > 0 || $isPaidLevel || (int)($user['level'] ?? 0) > 0;
    }

    private function bindReferrer(int $uid, int $spreadUid): void
    {
        if ($uid <= 0 || $spreadUid <= 0 || $uid === $spreadUid) {
            return;
        }

        try {
            /** @var UserServices $userServices */
            $userServices = app()->make(UserServices::class);
            $userServices->spread($uid, $spreadUid, 0, 0);
        } catch (\Throwable $e) {
        }
    }

    private function decodeMemberUid(string $memberUid): int
    {
        $memberUid = trim($memberUid);
        if ($memberUid === '') {
            return 0;
        }
        $digits = preg_replace('/\D+/', '', $memberUid);
        return $digits === '' ? 0 : (int)$digits;
    }

    private function encodeMemberUid(int $uid): string
    {
        return 'A' . str_pad((string)$uid, 5, '0', STR_PAD_LEFT);
    }

    private function formatAmount($amount): string
    {
        return number_format((float)$amount, 2, '.', '');
    }

    private function formatOverdueTime(int $time): string
    {
        return $time > 0 ? date('Y-m-d H:i:s', $time) : '';
    }

    private function modelToArray($value): array
    {
        if (!$value) {
            return [];
        }
        if (is_array($value)) {
            return $value;
        }
        if (method_exists($value, 'toArray')) {
            return $value->toArray();
        }
        return [];
    }

    private function zh(string $escaped): string
    {
        return json_decode('"' . $escaped . '"') ?: '';
    }
}
