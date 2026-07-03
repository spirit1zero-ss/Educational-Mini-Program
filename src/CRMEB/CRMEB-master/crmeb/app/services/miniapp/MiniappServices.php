<?php

namespace app\services\miniapp;

use app\services\BaseServices;
use app\services\order\OtherOrderServices;
use app\services\other\QrcodeServices;
use app\services\pay\PayServices;
use app\services\user\member\MemberCardServices;
use app\services\user\UserServices;
use app\services\wechat\RoutineServices;
use app\services\wechat\WechatUserServices;
use crmeb\exceptions\ApiException;
use crmeb\services\CacheService;
use think\facade\Db;

class MiniappServices extends BaseServices
{
    public function login(string $code, string $referrerUid = ''): array
    {
        if ($code === '') {
            throw new ApiException('Missing wx.login code');
        }

        $pendingSpreadUid = $this->resolveMemberReferrerUid($referrerUid);

        /** @var RoutineServices $routineServices */
        $routineServices = app()->make(RoutineServices::class);
        $authInfo = $routineServices->authType($code, 0, 0);
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

        if ($pendingSpreadUid > 0) {
            /** @var UserServices $userServices */
            $userServices = app()->make(UserServices::class);
            $userServices->recordPendingMemberReferrer((int)$user['uid'], $pendingSpreadUid);
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
        $plans = $this->getMemberPlans();
        $defaultPlan = $this->getDefaultMemberPlan($plans);

        return [
            'member' => $member,
            'trainingCamp' => [
                'productId' => $defaultPlan['mcId'] ? 'member-card-' . $defaultPlan['mcId'] : 'training-camp-21-days',
                'memberPlan' => $defaultPlan,
                'memberPlans' => $plans,
                'title' => $this->zh('\u0032\u0031\u5929\u81ea\u4e3b\u5b66\u4e60\u8bad\u7ec3\u8425'),
                'subtitle' => $this->zh('\u76f4\u64ad\u8bfe + \u6253\u5361\u966a\u8dd1 + \u7b54\u7591\u670d\u52a1'),
                'priceText' => $defaultPlan['priceText'] ?: $this->zh('\u0033\u0039\u0039\u5143'),
                'ctaText' => $member['isMember'] ? $this->zh('\u8fdb\u5165\u8bad\u7ec3\u8425') : $this->zh('\u7acb\u5373\u62a5\u540d'),
            ],
            'benefitText' => $member['isMember'] ? $this->zh('\u4f1a\u5458\u6743\u76ca\u5df2\u5f00\u901a') : $this->zh('\u62a5\u540d\u540e\u5f00\u901a\u4f1a\u5458\u6743\u76ca'),
            'referral' => $this->formatReferral($user),
        ];
    }

    public function getMemberPlans(): array
    {
        /** @var MemberCardServices $memberCardServices */
        $memberCardServices = app()->make(MemberCardServices::class);
        $plans = $memberCardServices->DoMemberType();
        if (!$plans) {
            return [];
        }

        return array_values(array_map(function ($item) {
            $price = $this->formatAmount($item['pre_price'] ?? 0);
            $originalPrice = $this->formatAmount($item['price'] ?? 0);
            return [
                'mcId' => (int)($item['mc_id'] ?? 0),
                'title' => $item['title'] ?? '',
                'type' => $item['type'] ?? '',
                'vipDay' => (int)($item['vip_day'] ?? 0),
                'price' => $price,
                'priceText' => $price . $this->zh('\u5143'),
                'originalPrice' => $originalPrice,
                'isFree' => ($item['type'] ?? '') === 'free' || (float)$price <= 0,
            ];
        }, $plans));
    }

    public function createTrainingCampMemberOrder(int $uid, int $mcId = 0, string $payType = PayServices::WEIXIN_PAY): array
    {
        $user = $this->requireUser($uid);
        $plans = $this->getMemberPlans();
        $plan = $mcId > 0 ? $this->findMemberPlan($plans, $mcId) : $this->getDefaultMemberPlan($plans);
        if (!$plan || empty($plan['mcId'])) {
            throw new ApiException('No paid membership plan is configured');
        }
        if (!empty($plan['isFree'])) {
            throw new ApiException('Please choose a paid membership plan');
        }

        /** @var OtherOrderServices $otherOrderServices */
        $otherOrderServices = app()->make(OtherOrderServices::class);
        $payType = $payType ?: PayServices::WEIXIN_PAY;
        $order = $otherOrderServices->createOrder(
            $uid,
            $user['user_type'] ?? 'routine',
            $plan['type'],
            $plan['price'],
            $payType,
            1,
            $plan['price'],
            (int)$plan['mcId']
        );
        $order = $this->modelToArray($order);
        if (!$order) {
            throw new ApiException('Membership order creation failed');
        }

        return [
            'orderId' => $order['order_id'] ?? '',
            'id' => (int)($order['id'] ?? 0),
            'memberType' => $order['member_type'] ?? $plan['type'],
            'mcId' => (int)$plan['mcId'],
            'payPrice' => $this->formatAmount($order['pay_price'] ?? $plan['price']),
            'payType' => $payType,
            'status' => 'created',
            'needPay' => true,
            'message' => $this->zh('\u4f1a\u5458\u8ba2\u5355\u5df2\u521b\u5efa\uff0c\u652f\u4ed8\u5c06\u5728\u4e0b\u4e00\u6b65\u63a5\u5165'),
        ];
    }

    public function createReferralPoster(int $uid, string $page = ''): array
    {
        $user = $this->requireMemberUser($uid);
        $member = $this->formatMember($user);

        $page = $page ?: 'pages/home/home';
        $memberUid = $member['uid'];
        /** @var QrcodeServices $qrcodeServices */
        $qrcodeServices = app()->make(QrcodeServices::class);
        $codeUrl = $qrcodeServices->getMiniappMemberInviteCode($memberUid, $page);

        return [
            'memberUid' => $memberUid,
            'posterUrl' => '',
            'codeUrl' => $codeUrl ?: '',
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
        $this->requireMemberUser($uid);
        /** @var UserServices $userServices */
        $userServices = app()->make(UserServices::class);
        $firstLevelUids = $userServices->getUserSpredadUids($uid, 1);
        $secondLevelUids = sys_config('brokerage_level', 2) == 2 ? $userServices->getUserSpredadUids($uid, 2) : [];
        $targetUids = (int)$grade === 1 ? $secondLevelUids : $firstLevelUids;
        $list = [];

        if ($targetUids) {
            $users = Db::name('user')
                ->whereIn('uid', $targetUids)
                ->where('is_del', 0)
                ->field('uid,nickname,avatar,phone,add_time,spread_time,spread_uid,is_ever_level,is_money_level,overdue_time,level,pay_count')
                ->order('spread_time', 'desc')
                ->select()
                ->toArray();
            foreach ($users as $item) {
                $list[] = $this->formatInviteRecord($item, (int)$grade === 1 ? 2 : 1, 'registered');
            }
        }

        if ((int)$grade === 0) {
            $list = array_merge($this->getPendingInviteRecords($uid), $list);
        }
        $pendingCount = count(array_filter($list, function ($item) {
            return ($item['status'] ?? '') === 'pending';
        }));
        $registeredCount = count(array_filter($list, function ($item) {
            return ($item['status'] ?? '') === 'registered';
        }));

        return [
            'summary' => [
                'invitedCount' => $pendingCount + $registeredCount,
                'pendingCount' => $pendingCount,
                'registeredCount' => $registeredCount,
                'secondLevelCount' => count($secondLevelUids),
            ],
            'brokerageLevel' => (int)sys_config('brokerage_level', 2),
            'list' => $list,
            'count' => count($list),
        ];
    }

    public function getIncomeRecords(int $uid, int $type = 3): array
    {
        $this->requireMemberUser($uid);
        [$page, $limit, $defaultLimit] = $this->getPageValue();
        $limit = $limit ?: $defaultLimit;
        $count = Db::name('user_brokerage')
            ->where('uid', $uid)
            ->whereIn('type', $this->memberIncomeTypes())
            ->count();
        $rows = Db::name('user_brokerage')
            ->where('uid', $uid)
            ->whereIn('type', $this->memberIncomeTypes())
            ->order('id', 'desc')
            ->page($page ?: 1, $limit)
            ->select()
            ->toArray();
        $list = array_map(function ($item) {
            return $this->formatIncomeRecord($item);
        }, $rows);
        $totalAmount = Db::name('user_brokerage')
            ->where('uid', $uid)
            ->whereIn('type', $this->memberIncomeTypes())
            ->where('pm', 1)
            ->sum('number');
        $pendingAmount = Db::name('user_brokerage')
            ->where('uid', $uid)
            ->whereIn('type', $this->memberIncomeTypes())
            ->where('pm', 1)
            ->where('frozen_time', '>', time())
            ->sum('number');
        $settledAmount = Db::name('user_brokerage')
            ->where('uid', $uid)
            ->whereIn('type', $this->memberIncomeTypes())
            ->where('pm', 1)
            ->where(function ($query) {
                $query->where('frozen_time', '<=', time())->whereOr('frozen_time', 0);
            })
            ->sum('number');

        return [
            'summary' => [
                'totalAmount' => $this->formatAmount($totalAmount),
                'availableAmount' => $this->formatAmount($settledAmount),
                'pendingAmount' => $this->formatAmount($pendingAmount),
                'settledAmount' => $this->formatAmount($settledAmount),
            ],
            'list' => $list,
            'count' => $count,
        ];
    }

    public function getTrainingCampOrders(int $uid): array
    {
        $this->requireMemberUser($uid);
        /** @var UserServices $userServices */
        $userServices = app()->make(UserServices::class);
        $firstLevelUids = $userServices->getUserSpredadUids($uid, 1);
        $secondLevelUids = sys_config('brokerage_level', 2) == 2 ? $userServices->getUserSpredadUids($uid, 2) : [];
        $targetUids = array_values(array_unique(array_filter(array_map('intval', array_merge($firstLevelUids, $secondLevelUids)))));
        if (!$targetUids) {
            return [
                'summary' => [
                    'totalCount' => 0,
                    'paidCount' => 0,
                    'pendingCount' => 0,
                    'closedCount' => 0,
                    'paidAmount' => '0.00',
                ],
                'list' => [],
                'count' => 0,
            ];
        }

        [$page, $limit, $defaultLimit] = $this->getPageValue();
        $limit = $limit ?: $defaultLimit;
        $baseQuery = Db::name('other_order')
            ->alias('o')
            ->leftJoin('user u', 'u.uid = o.uid')
            ->whereIn('o.uid', $targetUids)
            ->where('o.is_del', 0)
            ->where('o.member_type', '<>', '');
        $count = (clone $baseQuery)->count();
        $paidCount = (clone $baseQuery)->where('o.paid', 1)->count();
        $pendingCount = (clone $baseQuery)->where('o.paid', 0)->count();
        $paidAmount = (clone $baseQuery)->where('o.paid', 1)->sum('o.pay_price');
        $rows = $baseQuery
            ->field('o.id,o.uid,o.order_id,o.member_type,o.pay_type,o.paid,o.pay_price,o.member_price,o.pay_time,o.add_time,o.is_free,o.is_permanent,o.vip_day,u.nickname,u.phone')
            ->order('o.id', 'desc')
            ->page($page ?: 1, $limit)
            ->select()
            ->toArray();
        $firstMap = array_fill_keys($firstLevelUids, 1);
        $list = array_map(function ($item) use ($firstMap) {
            $grade = isset($firstMap[(int)($item['uid'] ?? 0)]) ? 1 : 2;
            return $this->formatTrainingCampOrder($item, $grade);
        }, $rows);

        return [
            'summary' => [
                'totalCount' => $count,
                'paidCount' => $paidCount,
                'pendingCount' => $pendingCount,
                'closedCount' => 0,
                'paidAmount' => $this->formatAmount($paidAmount),
            ],
            'list' => $list,
            'count' => $count,
        ];
    }

    private function getDefaultMemberPlan(array $plans): array
    {
        foreach ($plans as $plan) {
            if (empty($plan['isFree'])) {
                return $plan;
            }
        }
        return $plans[0] ?? [
            'mcId' => 0,
            'title' => '',
            'type' => '',
            'vipDay' => 0,
            'price' => '',
            'priceText' => '',
            'originalPrice' => '',
            'isFree' => false,
        ];
    }

    private function findMemberPlan(array $plans, int $mcId): array
    {
        foreach ($plans as $plan) {
            if ((int)($plan['mcId'] ?? 0) === $mcId) {
                return $plan;
            }
        }
        return [];
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

    private function requireMemberUser(int $uid): array
    {
        $user = $this->requireUser($uid);
        if (!$this->isTrainingCampMember($user)) {
            throw new ApiException('Training camp membership is required');
        }
        return $user;
    }

    private function formatUser(array $user): array
    {
        $isMember = $this->isTrainingCampMember($user);
        return [
            'uid' => (int)$user['uid'],
            'memberUid' => $isMember ? $this->encodeMemberUid((int)$user['uid']) : '',
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
            'uid' => $isMember ? $this->encodeMemberUid((int)$user['uid']) : '',
            'statusText' => $isMember ? $this->zh('\u0032\u0031\u5929\u8bad\u7ec3\u8425\u4f1a\u5458') : $this->zh('\u672a\u5f00\u901a\u8bad\u7ec3\u8425'),
            'expiresAt' => $this->formatOverdueTime((int)($user['overdue_time'] ?? 0)),
        ];
    }

    private function formatReferral(array $user): array
    {
        $uid = (int)$user['uid'];
        $isMember = $this->isTrainingCampMember($user);
        if (!$isMember) {
            return [
                'inviteCount' => 0,
                'orderCount' => 0,
                'incomeAmount' => '0.00',
                'posterCount' => 0,
                'canPromote' => false,
                'posterCtaText' => $this->zh('\u5f00\u901a\u540e\u751f\u6210\u63a8\u5e7f\u6d77\u62a5'),
            ];
        }

        /** @var UserServices $userServices */
        $userServices = app()->make(UserServices::class);
        $inviteCount = (int)($user['spread_count'] ?? count($userServices->getUserSpredadUids($uid, 1)));

        return [
            'inviteCount' => $inviteCount,
            'orderCount' => (int)($user['pay_count'] ?? 0),
            'incomeAmount' => $this->formatAmount($user['brokerage_price'] ?? 0),
            'posterCount' => 0,
            'canPromote' => $isMember,
            'posterCtaText' => $isMember ? $this->zh('\u751f\u6210\u63a8\u5e7f\u6d77\u62a5') : $this->zh('\u5f00\u901a\u540e\u751f\u6210\u63a8\u5e7f\u6d77\u62a5'),
        ];
    }

    private function getPendingInviteRecords(int $uid): array
    {
        $locks = Db::name('miniapp_member_referrer_locks')
            ->where('spread_uid', $uid)
            ->where('status', 0)
            ->where('expires_at', '>=', time())
            ->order('locked_at', 'desc')
            ->select()
            ->toArray();
        if (!$locks) {
            return [];
        }

        $targetUids = array_values(array_unique(array_map('intval', array_column($locks, 'uid'))));
        $users = [];
        if ($targetUids) {
            $rows = Db::name('user')
                ->whereIn('uid', $targetUids)
                ->where('is_del', 0)
                ->field('uid,nickname,avatar,phone,add_time,spread_time,spread_uid,is_ever_level,is_money_level,overdue_time,level,pay_count')
                ->select()
                ->toArray();
            foreach ($rows as $row) {
                $users[(int)$row['uid']] = $row;
            }
        }

        $records = [];
        foreach ($locks as $lock) {
            $targetUid = (int)($lock['uid'] ?? 0);
            $item = $users[$targetUid] ?? ['uid' => $targetUid];
            $item['locked_at'] = (int)($lock['locked_at'] ?? 0);
            $item['expires_at'] = (int)($lock['expires_at'] ?? 0);
            $records[] = $this->formatInviteRecord($item, 1, 'pending');
        }

        return $records;
    }

    private function formatInviteRecord(array $item, int $grade, string $fallbackStatus): array
    {
        $uid = (int)($item['uid'] ?? 0);
        $isMember = $this->isTrainingCampMember($item);
        $status = $fallbackStatus === 'pending' && !$isMember ? 'pending' : 'registered';
        $time = $status === 'pending'
            ? (int)($item['locked_at'] ?? $item['add_time'] ?? 0)
            : (int)($item['spread_time'] ?? $item['add_time'] ?? 0);
        $orderCount = $status === 'registered' ? max(1, (int)($item['pay_count'] ?? 0)) : 0;

        return [
            'id' => (string)$uid,
            'uid' => $uid,
            'memberUid' => $isMember ? $this->encodeMemberUid($uid) : '',
            'avatar' => $item['avatar'] ?? '',
            'nickname' => $item['nickname'] ?? '',
            'name' => $item['nickname'] ?? '',
            'phone' => $item['phone'] ?? '',
            'grade' => $grade,
            'orderCount' => $orderCount,
            'time' => $this->formatOverdueTime($time),
            'add_time' => $this->formatOverdueTime((int)($item['add_time'] ?? 0)),
            'lockedAt' => $this->formatOverdueTime((int)($item['locked_at'] ?? 0)),
            'expiresAt' => $this->formatOverdueTime((int)($item['expires_at'] ?? 0)),
            'status' => $status,
            'statusText' => $status === 'registered' ? $this->zh('\u5df2\u62a5\u540d') : $this->zh('\u5f85\u8f6c\u5316'),
            'source' => $this->zh('\u4f1a\u5458\u4e8c\u7ef4\u7801'),
            'reward' => '0.00',
            'rewardState' => $status === 'registered' ? $this->zh('\u5f85\u7ed3\u7b97') : $this->zh('\u62a5\u540d\u540e\u8ba1\u5956'),
        ];
    }

    private function memberIncomeTypes(): array
    {
        return ['get_member_brokerage', 'get_self_member_brokerage', 'get_two_member_brokerage', 'one_member_brokerage', 'two_member_brokerage'];
    }

    private function formatIncomeRecord(array $item): array
    {
        $type = (string)($item['type'] ?? '');
        $typeText = in_array($type, ['get_two_member_brokerage', 'two_member_brokerage'], true)
            ? $this->zh('\u4e8c\u7ea7\u4f1a\u5458\u4f63\u91d1')
            : $this->zh('\u4e00\u7ea7\u4f1a\u5458\u4f63\u91d1');
        $isFrozen = (int)($item['frozen_time'] ?? 0) > time();
        $status = $isFrozen ? 'pending' : 'settled';

        return [
            'id' => (string)($item['id'] ?? ''),
            'type' => $type,
            'typeText' => $typeText,
            'title' => $typeText,
            'desc' => $item['mark'] ?? '',
            'mark' => $item['mark'] ?? '',
            'time' => $this->formatOverdueTime((int)($item['add_time'] ?? 0)),
            'add_time' => $this->formatOverdueTime((int)($item['add_time'] ?? 0)),
            'amount' => $this->formatAmount($item['number'] ?? 0),
            'number' => $this->formatAmount($item['number'] ?? 0),
            'pm' => (int)($item['pm'] ?? 1),
            'statusKey' => $status,
            'statusText' => $status === 'pending' ? $this->zh('\u5f85\u7ed3\u7b97') : $this->zh('\u5df2\u5230\u8d26'),
            'isFrozen' => $isFrozen,
            'frozenTime' => $this->formatOverdueTime((int)($item['frozen_time'] ?? 0)),
            'linkId' => (int)($item['link_id'] ?? 0),
        ];
    }

    private function formatTrainingCampOrder(array $item, int $grade): array
    {
        $paid = (int)($item['paid'] ?? 0) === 1;
        $status = $paid ? 'paid' : 'pending';
        $time = $paid && !empty($item['pay_time']) ? (int)$item['pay_time'] : (int)($item['add_time'] ?? 0);
        $buyer = trim((string)($item['nickname'] ?? ''));
        if ($buyer === '') {
            $buyer = $this->zh('\u7528\u6237') . (int)($item['uid'] ?? 0);
        }

        return [
            'id' => (string)($item['id'] ?? ''),
            'uid' => (int)($item['uid'] ?? 0),
            'memberUid' => $this->encodeMemberUid((int)($item['uid'] ?? 0)),
            'grade' => $grade,
            'title' => $this->zh('\u0032\u0031\u5929\u81ea\u4e3b\u5b66\u4e60\u8bad\u7ec3\u8425'),
            'buyer' => $buyer,
            'phone' => $item['phone'] ?? '',
            'orderNo' => $item['order_id'] ?? '',
            'time' => $this->formatOverdueTime($time),
            'add_time' => $this->formatOverdueTime((int)($item['add_time'] ?? 0)),
            'payTime' => $this->formatOverdueTime((int)($item['pay_time'] ?? 0)),
            'amount' => $this->formatAmount($item['pay_price'] ?? 0),
            'amountText' => $this->formatAmount($item['pay_price'] ?? 0) . $this->zh('\u5143'),
            'memberType' => $item['member_type'] ?? '',
            'payType' => $item['pay_type'] ?? '',
            'status' => $status,
            'statusText' => $paid ? $this->zh('\u5df2\u652f\u4ed8') : $this->zh('\u5f85\u652f\u4ed8'),
        ];
    }

    private function isTrainingCampMember(array $user): bool
    {
        $overdueTime = (int)($user['overdue_time'] ?? 0);
        $isPaidLevel = (int)($user['is_money_level'] ?? 0) > 0 && ($overdueTime === 0 || $overdueTime > time());
        return (int)($user['is_ever_level'] ?? 0) > 0 || $isPaidLevel || (int)($user['level'] ?? 0) > 0;
    }

    private function resolveMemberReferrerUid(string $referrerUid): int
    {
        $spreadUid = $this->decodeMemberUid($referrerUid);
        if ($spreadUid <= 0) {
            return 0;
        }

        /** @var UserServices $userServices */
        $userServices = app()->make(UserServices::class);
        $spreadUser = $this->modelToArray($userServices->getUserInfo($spreadUid));
        if (!$spreadUser || !$this->isTrainingCampMember($spreadUser)) {
            return 0;
        }

        return $spreadUid;
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
