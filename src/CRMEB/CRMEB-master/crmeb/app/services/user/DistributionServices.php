<?php

namespace app\services\user;

use app\services\BaseServices;
use crmeb\exceptions\AdminException;
use crmeb\services\CacheService;
use think\facade\Db;

/**
 * Training-camp distribution identities, fixed commissions and settlement review.
 *
 * agent_level mapping:
 * 0 = C 普通会员, 1 = M 盟友, 2 = D 代理, >= 3 = H 合伙人.
 */
class DistributionServices extends BaseServices
{
    public const PENDING_SETTLEMENT_TIME = 2147483647;

    private const CAMP_ORDER_TABLE = 'miniapp_training_camp_order';
    private const ENABLE_CONFIG_KEY = 'training_camp_distribution_enabled';

    private const LEVELS = [
        0 => [
            'key' => 'C',
            'name' => '普通会员',
            'initialQuota' => 1,
            'quotaConfig' => '',
            'firstCommission' => '120.00',
            'commissionConfig' => 'training_camp_c_first_commission',
        ],
        1 => [
            'key' => 'M',
            'name' => '盟友',
            'initialQuota' => 30,
            'quotaConfig' => 'training_camp_m_initial_quota',
            'firstCommission' => '150.00',
            'commissionConfig' => 'training_camp_m_first_commission',
        ],
        2 => [
            'key' => 'D',
            'name' => '代理',
            'initialQuota' => 50,
            'quotaConfig' => 'training_camp_d_initial_quota',
            'firstCommission' => '200.00',
            'commissionConfig' => 'training_camp_d_first_commission',
        ],
        3 => [
            'key' => 'H',
            'name' => '合伙人',
            'initialQuota' => 200,
            'quotaConfig' => 'training_camp_h_initial_quota',
            'firstCommission' => '300.00',
            'commissionConfig' => 'training_camp_h_first_commission',
        ],
    ];

    private const FALLBACK_COMMISSION_CONFIG = 'training_camp_fallback_commission';
    private const SECOND_COMMISSION_CONFIG = 'training_camp_second_commission';
    private const COMMISSION_REFUND_TYPE = 'training_camp_commission_refund';

    private const MEMBER_INCOME_TYPES = [
        'self_member_brokerage',
        'one_member_brokerage',
        'two_member_brokerage',
    ];

    public function isEnabled(): bool
    {
        return (bool)sys_config(self::ENABLE_CONFIG_KEY, 1);
    }

    public function setEnabled(bool $enabled): bool
    {
        $value = json_encode($enabled ? 1 : 0);
        $config = Db::name('system_config')->where('menu_name', self::ENABLE_CONFIG_KEY)->find();
        if ($config) {
            $saved = Db::name('system_config')
                ->where('menu_name', self::ENABLE_CONFIG_KEY)
                ->update(['value' => $value]);
        } else {
            $saved = Db::name('system_config')->insert([
                'menu_name' => self::ENABLE_CONFIG_KEY,
                'type' => 'radio',
                'input_type' => 'input',
                'config_tab_id' => 72,
                'parameter' => "1=>开启\n0=>关闭",
                'upload_type' => 1,
                'required' => '',
                'width' => 0,
                'high' => 0,
                'value' => $value,
                'info' => '训练营分销',
                'desc' => '控制训练营推广关系和新佣金发放，关闭后历史团队、佣金和提现记录仍保留',
                'sort' => 99,
                'status' => 1,
                'level' => 0,
                'link_id' => 0,
                'link_value' => 0,
            ]);
        }
        CacheService::clear();
        return $saved !== false;
    }

    /**
     * Return the single source of truth used by payment settlement and admin display.
     */
    public function policyList(): array
    {
        $list = [];
        $levels = $this->levels();
        $fallbackCommission = $this->configuredMoney(self::FALLBACK_COMMISSION_CONFIG, '120.00');
        $secondCommission = $this->configuredMoney(self::SECOND_COMMISSION_CONFIG, '20.00');
        foreach ($levels as $agentLevel => $level) {
            $list[] = [
                'id' => $agentLevel,
                'levelId' => $agentLevel,
                'levelKey' => $level['key'],
                'levelName' => $level['name'],
                'initialQuota' => $level['initialQuota'],
                'firstCommission' => $level['firstCommission'],
                'fallbackCommission' => $fallbackCommission,
                'secondCommission' => $secondCommission,
                'quotaLimited' => $agentLevel > 0,
            ];
        }
        return $list;
    }

    public function profile(array $user): array
    {
        $uid = (int)($user['uid'] ?? 0);
        $agentLevel = $this->normalizeAgentLevel((int)($user['agent_level'] ?? 0));
        $level = $this->levels()[$agentLevel];

        return [
            'levelId' => $agentLevel,
            'levelKey' => $level['key'],
            'levelName' => $level['name'],
            'identityCode' => $uid > 0 ? $level['key'] . str_pad((string)$uid, 5, '0', STR_PAD_LEFT) : '',
            'initialQuota' => $level['initialQuota'],
            'firstCommission' => $level['firstCommission'],
            'secondCommission' => $this->configuredMoney(self::SECOND_COMMISSION_CONFIG, '20.00'),
        ];
    }

    public function profileByUid(int $uid): array
    {
        $user = Db::name('user')
            ->where('uid', $uid)
            ->field('uid,agent_level,is_ever_level,is_money_level,overdue_time,is_promoter,spread_open,status,is_del')
            ->find();

        return $user ? $this->profile($user) : $this->profile(['uid' => $uid]);
    }

    public function firstCommissionForUid(int $uid, int $buyerUid = 0): string
    {
        $user = $this->eligibleUser($uid);
        if (!$user) {
            return '0.00';
        }
        $profile = $this->profile($user);
        if ((int)$profile['levelId'] === 0) {
            return (string)$profile['firstCommission'];
        }
        $effectiveTime = (int)($user['agent_level_time'] ?? 0);
        if (!$this->isPremiumQuotaCandidate($uid, $buyerUid, $effectiveTime)) {
            return $this->configuredMoney(self::FALLBACK_COMMISSION_CONFIG, '120.00');
        }
        return $this->premiumQuotaUsed($uid, $effectiveTime, $buyerUid) < (int)$profile['initialQuota']
            ? (string)$profile['firstCommission']
            : $this->configuredMoney(self::FALLBACK_COMMISSION_CONFIG, '120.00');
    }

    public function secondCommissionForUid(int $uid): string
    {
        return $this->eligibleUser($uid)
            ? $this->configuredMoney(self::SECOND_COMMISSION_CONFIG, '20.00')
            : '0.00';
    }

    /**
     * Resolve the editable training-camp policy while retaining safe defaults
     * during deployments where code and database patches are applied separately.
     */
    private function levels(): array
    {
        $levels = [];
        foreach (self::LEVELS as $agentLevel => $level) {
            $quota = $level['quotaConfig'] === ''
                ? (int)$level['initialQuota']
                : $this->configuredQuota($level['quotaConfig'], (int)$level['initialQuota']);
            $levels[$agentLevel] = [
                'key' => $level['key'],
                'name' => $level['name'],
                'initialQuota' => $quota,
                'firstCommission' => $this->configuredMoney(
                    $level['commissionConfig'],
                    (string)$level['firstCommission']
                ),
            ];
        }
        return $levels;
    }

    private function configuredQuota(string $key, int $default): int
    {
        $value = sys_config($key, $default);
        return is_numeric($value) ? max(0, (int)$value) : $default;
    }

    private function configuredMoney(string $key, string $default): string
    {
        $value = sys_config($key, $default);
        if (!is_numeric($value) || (float)$value < 0) {
            $value = $default;
        }
        return number_format((float)$value, 2, '.', '');
    }

    public function teamStats(int $uid): array
    {
        $user = Db::name('user')->where('uid', $uid)->field('uid,agent_level,agent_level_time')->find() ?: ['uid' => $uid];
        $profile = $this->profile($user);

        $firstLevelUids = $this->teamMemberUids($uid, 1);
        $firstLevelCount = count($firstLevelUids);
        $secondLevelUids = $this->teamMemberUids($uid, 2);
        $secondLevelCount = count($secondLevelUids);
        $quotaLimited = (int)$profile['levelId'] > 0;
        $effectiveTime = (int)($user['agent_level_time'] ?? 0);
        $usedQuota = $quotaLimited && $effectiveTime > 0
            ? min($this->premiumQuotaUsed($uid, $effectiveTime), (int)$profile['initialQuota'])
            : 0;

        return array_merge($profile, [
            'firstLevelCount' => $firstLevelCount,
            'secondLevelCount' => $secondLevelCount,
            'pullNewCount' => $firstLevelCount + $secondLevelCount,
            'usedQuota' => $usedQuota,
            'remainingQuota' => $quotaLimited
                ? max(0, (int)$profile['initialQuota'] - $usedQuota)
                : (int)$profile['initialQuota'],
            'quotaLimited' => $quotaLimited,
        ]);
    }

    /**
     * Effective paid team member UIDs. Grade 2 is only expanded from an
     * effective paid first-level member, keeping the business hierarchy clear.
     */
    public function teamMemberUids(int $uid, int $grade = 1): array
    {
        $directUids = Db::name('user')
            ->where('spread_uid', $uid)
            ->where('is_del', 0)
            ->column('uid');
        $firstLevelUids = $this->activePaidMemberUids($directUids);
        if ($grade !== 2) {
            return $firstLevelUids;
        }
        $secondLevelCandidates = $firstLevelUids
            ? Db::name('user')->whereIn('spread_uid', $firstLevelUids)->where('is_del', 0)->column('uid')
            : [];
        return $this->activePaidMemberUids($secondLevelCandidates);
    }

    /**
     * Training-camp distributor workspace. This deliberately avoids the legacy
     * store_order and percentage-brokerage aggregates used by the mall module.
     */
    public function adminAgentPage(array $where): array
    {
        $page = max(1, (int)($where['page'] ?? 1));
        $limit = max(1, min(100, (int)($where['limit'] ?? 15)));
        $query = $this->adminAgentQuery($where);
        $count = (clone $query)->count();
        $rows = $query
            ->field('u.uid,u.nickname,u.real_name,u.avatar,u.phone,u.agent_level,u.is_ever_level,u.is_money_level,u.overdue_time,u.is_promoter,u.spread_open,u.status,u.is_del,u.spread_uid,u.brokerage_price,u.add_time')
            ->order('u.uid', 'desc')
            ->page($page, $limit)
            ->select()
            ->toArray();

        $spreadUids = array_values(array_unique(array_filter(array_map('intval', array_column($rows, 'spread_uid')))));
        $spreadMap = $spreadUids
            ? Db::name('user')->whereIn('uid', $spreadUids)->column('nickname', 'uid')
            : [];

        $list = array_map(function (array $row) use ($spreadMap) {
            $uid = (int)$row['uid'];
            $profile = $this->profile($row);
            $team = $this->teamStats($uid);
            $income = $this->incomeSummary($uid, (string)($row['brokerage_price'] ?? '0'));
            $isMember = $this->isActiveMemberRecord($row);
            $canPromote = $isMember
                && (int)($row['status'] ?? 0) === 1
                && (int)($row['is_promoter'] ?? 0) === 1
                && (int)($row['spread_open'] ?? 0) === 1
                && (int)($row['is_del'] ?? 0) === 0;
            $spreadUid = (int)($row['spread_uid'] ?? 0);

            return [
                'uid' => $uid,
                'nickname' => (string)($row['nickname'] ?? ''),
                'realName' => (string)($row['real_name'] ?? ''),
                'avatar' => (string)($row['avatar'] ?? ''),
                'phone' => (string)($row['phone'] ?? ''),
                'agentLevel' => (int)$profile['levelId'],
                'levelKey' => (string)$profile['levelKey'],
                'levelName' => (string)$profile['levelName'],
                'identityCode' => (string)$profile['identityCode'],
                'isMember' => $isMember,
                'memberStatusText' => $isMember ? '训练营会员' : '未开通会员',
                'canPromote' => $canPromote,
                'promotionStatusText' => $canPromote ? '推广正常' : '推广已冻结',
                'spreadOpen' => (int)($row['spread_open'] ?? 0),
                'isPromoter' => (int)($row['is_promoter'] ?? 0),
                'status' => (int)($row['status'] ?? 0),
                'initialQuota' => (int)$team['initialQuota'],
                'usedQuota' => (int)$team['usedQuota'],
                'remainingQuota' => (int)$team['remainingQuota'],
                'firstLevelCount' => (int)$team['firstLevelCount'],
                'secondLevelCount' => (int)$team['secondLevelCount'],
                'pullNewCount' => (int)$team['pullNewCount'],
                'income' => $income,
                'spreadUid' => $spreadUid,
                'spreadName' => $spreadUid > 0
                    ? (string)($spreadMap[$spreadUid] ?? '用户') . '/' . $spreadUid
                    : '--',
                'joinedAt' => !empty($row['add_time']) ? date('Y-m-d H:i:s', (int)$row['add_time']) : '',
            ];
        }, $rows);

        return compact('list', 'count');
    }

    /**
     * Summary cards for the training-camp distributor workspace.
     */
    public function adminAgentSummary(array $where): array
    {
        $summaryUsers = $this->adminAgentQuery($where)
            ->field('u.uid,u.is_ever_level,u.is_money_level,u.overdue_time')
            ->select()
            ->toArray();
        $uids = [];
        foreach ($summaryUsers as $summaryUser) {
            if ($this->isActiveMemberRecord($summaryUser)) {
                $uids[] = (int)$summaryUser['uid'];
            }
        }
        $uids = array_values(array_unique($uids));
        if (!$uids) {
            return [
                'memberCount' => 0,
                'inviteCount' => 0,
                'orderCount' => 0,
                'orderAmount' => '0.00',
                'pendingAmount' => '0.00',
                'availableAmount' => '0.00',
                'debtAmount' => '0.00',
                'refundAmount' => '0.00',
                'withdrawnAmount' => '0.00',
            ];
        }

        $effectiveTeamUids = [];
        foreach ($uids as $uid) {
            $effectiveTeamUids = array_merge(
                $effectiveTeamUids,
                $this->teamMemberUids($uid, 1),
                $this->teamMemberUids($uid, 2)
            );
        }
        $effectiveTeamUids = array_values(array_unique(array_map('intval', $effectiveTeamUids)));
        $orderCount = 0;
        $orderAmountFen = 0;
        if ($effectiveTeamUids) {
            $validOrders = Db::name(self::CAMP_ORDER_TABLE)
                ->whereIn('uid', $effectiveTeamUids)
                ->where('order_state', 'paid')
                ->where('refund_state', '<>', 'refunded');
            $orderCount = (int)(clone $validOrders)->count();
            $orderAmountFen = (int)(clone $validOrders)->sum('price_fen');
        }

        $positive = Db::name('user_brokerage')
            ->whereIn('uid', $uids)
            ->whereIn('type', self::MEMBER_INCOME_TYPES)
            ->where('pm', 1)
            ->where('status', 1);
        $pendingAmount = (string)(clone $positive)->where('frozen_time', '>', time())->sum('number');
        $pendingRows = (clone $positive)
            ->where('frozen_time', '>', time())
            ->field('uid,SUM(number) AS pending_amount')
            ->group('uid')
            ->select()
            ->toArray();
        $pendingByUid = [];
        foreach ($pendingRows as $pendingRow) {
            $pendingByUid[(int)$pendingRow['uid']] = (string)$pendingRow['pending_amount'];
        }
        $balancesByUid = Db::name('user')
            ->whereIn('uid', $uids)
            ->column('brokerage_price', 'uid');
        $availableAmount = '0.00';
        $debtAmount = '0.00';
        foreach ($uids as $uid) {
            $netAvailable = bcsub(
                (string)($balancesByUid[$uid] ?? '0'),
                (string)($pendingByUid[$uid] ?? '0'),
                2
            );
            if (bccomp($netAvailable, '0', 2) < 0) {
                $debtAmount = bcadd($debtAmount, bcmul($netAvailable, '-1', 2), 2);
            } else {
                $availableAmount = bcadd($availableAmount, $netAvailable, 2);
            }
        }
        $refundAmount = (string)Db::name('user_brokerage')
            ->whereIn('uid', $uids)
            ->where('type', self::COMMISSION_REFUND_TYPE)
            ->where('pm', 0)
            ->where('status', 1)
            ->sum('number');

        $withdrawnBase = Db::name('user_extract')
            ->whereIn('uid', $uids)
            ->where('extract_type', 'weixin')
            ->where('status', 1)
            ->where('state', 'SUCCESS');
        $withdrawnAmount = bcsub(
            (string)(clone $withdrawnBase)->sum('extract_price'),
            (string)(clone $withdrawnBase)->sum('extract_fee'),
            2
        );

        return [
            'memberCount' => count($uids),
            'inviteCount' => count($effectiveTeamUids),
            'orderCount' => $orderCount,
            'orderAmount' => $this->money($orderAmountFen / 100),
            'pendingAmount' => $this->money($pendingAmount),
            'availableAmount' => $this->money($availableAmount),
            'debtAmount' => $this->money($debtAmount),
            'refundAmount' => $this->money($refundAmount),
            'withdrawnAmount' => $this->money($withdrawnAmount),
        ];
    }

    private function adminAgentQuery(array $where)
    {
        $query = Db::name('user')->alias('u')
            ->where('u.is_del', 0)
            ->where(function ($query) {
                $query->where('u.is_ever_level', 1)
                    ->whereOr('u.is_money_level', '>', 0)
                    ->whereOr('u.agent_level', '>', 0)
                    ->whereOr('u.is_promoter', 1);
            });

        $keyword = trim((string)($where['nickname'] ?? $where['keyword'] ?? ''));
        if ($keyword !== '') {
            $query->where(function ($query) use ($keyword) {
                $query->whereLike('u.nickname|u.real_name|u.phone|u.uid', '%' . $keyword . '%');
            });
        }

        $agentLevel = $where['agent_level'] ?? '';
        if ($agentLevel !== '' && $agentLevel !== null) {
            $query->where('u.agent_level', $this->normalizeAgentLevel((int)$agentLevel));
        }

        $promotionStatus = trim((string)($where['promotion_status'] ?? ''));
        if ($promotionStatus === 'active') {
            $query->where('u.status', 1)->where('u.is_promoter', 1)->where('u.spread_open', 1);
        } elseif ($promotionStatus === 'frozen') {
            $query->where(function ($query) {
                $query->where('u.status', 0)->whereOr('u.is_promoter', 0)->whereOr('u.spread_open', 0);
            });
        }

        $dateRange = trim((string)($where['data'] ?? ''));
        if ($dateRange !== '' && strpos($dateRange, '-') !== false) {
            [$start, $end] = array_map('trim', explode('-', $dateRange, 2));
            $startTime = strtotime($start . ' 00:00:00');
            $endTime = strtotime($end . ' 23:59:59');
            if ($startTime && $endTime) {
                $query->whereBetween('u.add_time', [$startTime, $endTime]);
            }
        }

        return $query;
    }

    private function isActiveMemberRecord(array $user): bool
    {
        if ((int)($user['is_ever_level'] ?? 0) === 1) {
            return true;
        }
        $overdueTime = (int)($user['overdue_time'] ?? 0);
        return (int)($user['is_money_level'] ?? 0) > 0
            && ($overdueTime === 0 || $overdueTime > time());
    }

    /**
     * Administrator-facing distribution account snapshot.
     */
    public function adminOverview(int $uid): array
    {
        $user = Db::name('user')
            ->where('uid', $uid)
            ->field('uid,nickname,avatar,phone,agent_level,is_ever_level,is_money_level,overdue_time,is_promoter,spread_open,status,is_del,brokerage_price')
            ->find();
        if (!$user) {
            throw new AdminException('用户不存在');
        }

        $team = $this->teamStats($uid);
        $income = $this->incomeSummary($uid, (string)($user['brokerage_price'] ?? '0'));

        return [
            'user' => [
                'uid' => (int)$user['uid'],
                'nickname' => (string)($user['nickname'] ?? ''),
                'avatar' => (string)($user['avatar'] ?? ''),
                'phone' => (string)($user['phone'] ?? ''),
                'isMember' => (int)($user['is_ever_level'] ?? 0) === 1,
                'canPromote' => (int)($user['is_promoter'] ?? 0) === 1
                    && (int)($user['spread_open'] ?? 0) === 1
                    && (int)($user['status'] ?? 0) === 1
                    && (int)($user['is_del'] ?? 0) === 0,
            ],
            'identity' => $this->profile($user),
            'team' => [
                'initialQuota' => (int)$team['initialQuota'],
                'usedQuota' => (int)$team['usedQuota'],
                'remainingQuota' => (int)$team['remainingQuota'],
                'firstLevelCount' => (int)$team['firstLevelCount'],
                'secondLevelCount' => (int)$team['secondLevelCount'],
                'pullNewCount' => (int)$team['pullNewCount'],
            ],
            'income' => $income,
            'rules' => [
                'customerPrice' => '399.00',
                'firstCommission' => (string)$team['firstCommission'],
                'secondCommission' => (string)$team['secondCommission'],
                'withdrawalFeeRate' => number_format((float)sys_config('withdrawal_fee', 0.6), 2, '.', ''),
                'quotaRule' => '仅一级有效支付订单占用名额；二级成交不占用上级名额',
            ],
        ];
    }

    /**
     * Paginated paid members in the first- or second-level team.
     */
    public function adminTeamMembers(int $uid, int $grade, array $where = []): array
    {
        if (!Db::name('user')->where('uid', $uid)->find()) {
            throw new AdminException('用户不存在');
        }
        $grade = $grade === 2 ? 2 : 1;
        $targetUids = $this->teamMemberUids($uid, $grade);

        $keyword = trim((string)($where['keyword'] ?? ''));
        $page = max(1, (int)($where['page'] ?? 1));
        $limit = max(1, min(100, (int)($where['limit'] ?? 10)));
        if (!$targetUids) {
            return ['list' => [], 'count' => 0];
        }

        $query = Db::name('user')
            ->whereIn('uid', $targetUids)
            ->where('is_del', 0)
            ->where('status', 1);
        if ($keyword !== '') {
            $query->where(function ($query) use ($keyword) {
                $query->whereLike('nickname|phone|uid', '%' . $keyword . '%');
            });
        }
        $count = (clone $query)->count();
        $rows = $query
            ->field('uid,nickname,avatar,phone,agent_level,spread_uid,spread_time,add_time')
            ->order('spread_time', 'desc')
            ->page($page, $limit)
            ->select()
            ->toArray();
        if (!$rows) {
            return ['list' => [], 'count' => $count];
        }

        $paidRows = Db::name(self::CAMP_ORDER_TABLE)
            ->alias('c')
            ->leftJoin('other_order o', 'o.id = c.other_order_id')
            ->whereIn('c.uid', array_column($rows, 'uid'))
            ->where('c.order_state', 'paid')
            ->where('c.refund_state', '<>', 'refunded')
            ->field('c.uid,c.order_id,o.pay_time')
            ->order('c.id', 'desc')
            ->select()
            ->toArray();
        $paidMap = [];
        foreach ($paidRows as $paidRow) {
            $paidUid = (int)$paidRow['uid'];
            if (!isset($paidMap[$paidUid])) {
                $paidMap[$paidUid] = $paidRow;
            }
        }

        $list = array_map(function (array $row) use ($grade, $paidMap) {
            $profile = $this->profile($row);
            $paid = $paidMap[(int)$row['uid']] ?? [];
            return [
                'uid' => (int)$row['uid'],
                'nickname' => (string)($row['nickname'] ?? ''),
                'avatar' => (string)($row['avatar'] ?? ''),
                'phone' => (string)($row['phone'] ?? ''),
                'grade' => $grade,
                'identityCode' => $profile['identityCode'],
                'levelName' => $profile['levelName'],
                'orderId' => (string)($paid['order_id'] ?? ''),
                'paidTime' => !empty($paid['pay_time']) ? date('Y-m-d H:i:s', (int)$paid['pay_time']) : '',
                'joinedTime' => !empty($row['spread_time'])
                    ? date('Y-m-d H:i:s', (int)$row['spread_time'])
                    : (!empty($row['add_time']) ? date('Y-m-d H:i:s', (int)$row['add_time']) : ''),
            ];
        }, $rows);

        return compact('list', 'count');
    }

    public function memberIncomeTypes(): array
    {
        return self::MEMBER_INCOME_TYPES;
    }

    public function settlementList(array $where): array
    {
        [$page, $limit, $defaultLimit] = $this->getPageValue();
        $page = $page ?: 1;
        $limit = $limit ?: $defaultLimit;
        $query = Db::name('user_brokerage')
            ->alias('b')
            ->leftJoin('user u', 'u.uid = b.uid')
            ->leftJoin('other_order o', 'o.id = b.link_id')
            ->leftJoin('user buyer', 'buyer.uid = o.uid')
            ->whereIn('b.type', self::MEMBER_INCOME_TYPES)
            ->where('b.pm', 1);

        $status = trim((string)($where['status'] ?? 'pending'));
        if ($status === 'pending') {
            $query->where('b.status', 1)->where('b.frozen_time', '>', time());
        } elseif ($status === 'approved') {
            $query->where('b.status', 1)->where(function ($query) {
                $query->where('b.frozen_time', 0)->whereOr('b.frozen_time', '<=', time());
            });
        } elseif ($status === 'rejected') {
            $query->where('b.status', -1);
        }

        $keyword = trim((string)($where['keyword'] ?? ''));
        if ($keyword !== '') {
            $query->where(function ($query) use ($keyword) {
                $query->whereLike('u.nickname|u.phone|buyer.nickname|buyer.phone|o.order_id', '%' . $keyword . '%');
            });
        }

        $count = (clone $query)->count();
        $rows = $query
            ->field('b.*,u.nickname,u.phone,u.agent_level,buyer.nickname AS buyer_name,buyer.phone AS buyer_phone,o.order_id')
            ->order('b.id', 'desc')
            ->page($page, $limit)
            ->select()
            ->toArray();

        $list = array_map(function (array $row) {
            $profile = $this->profile([
                'uid' => (int)$row['uid'],
                'agent_level' => (int)($row['agent_level'] ?? 0),
            ]);
            $statusKey = (int)$row['status'] === -1
                ? 'rejected'
                : ((int)$row['frozen_time'] > time() ? 'pending' : 'approved');

            return [
                'id' => (int)$row['id'],
                'uid' => (int)$row['uid'],
                'nickname' => (string)($row['nickname'] ?? ''),
                'phone' => (string)($row['phone'] ?? ''),
                'identityCode' => $profile['identityCode'],
                'levelName' => $profile['levelName'],
                'commissionType' => $row['type'] === 'two_member_brokerage' ? '二级返佣' : '一级返佣',
                'amount' => number_format((float)$row['number'], 2, '.', ''),
                'orderId' => (string)($row['order_id'] ?? ''),
                'buyerName' => (string)($row['buyer_name'] ?? ''),
                'buyerPhone' => (string)($row['buyer_phone'] ?? ''),
                'status' => $statusKey,
                'statusText' => ['pending' => '待结算', 'approved' => '可提现', 'rejected' => '已驳回'][$statusKey],
                'mark' => (string)($row['mark'] ?? ''),
                'addTime' => !empty($row['add_time']) ? date('Y-m-d H:i:s', (int)$row['add_time']) : '',
                'reviewTime' => !empty($row['review_time']) ? date('Y-m-d H:i:s', (int)$row['review_time']) : '',
            ];
        }, $rows);

        return compact('list', 'count');
    }

    public function reviewSettlement(int $id, string $decision, string $reason = ''): bool
    {
        $decision = strtolower(trim($decision));
        if (!in_array($decision, ['approve', 'reject'], true)) {
            throw new AdminException('结算审核决定无效');
        }
        if ($decision === 'reject' && trim($reason) === '') {
            throw new AdminException('驳回时请填写原因');
        }

        return (bool)Db::transaction(function () use ($id, $decision, $reason) {
            $row = Db::name('user_brokerage')->where('id', $id)->lock(true)->find();
            if (!$row || !in_array((string)$row['type'], self::MEMBER_INCOME_TYPES, true) || (int)$row['pm'] !== 1) {
                throw new AdminException('待结算佣金不存在');
            }
            if ((int)$row['status'] === -1) {
                throw new AdminException('该佣金已被驳回');
            }
            if ((int)$row['frozen_time'] <= time()) {
                throw new AdminException('该佣金已经完成结算');
            }

            $reviewTime = time();
            if ($decision === 'approve') {
                return Db::name('user_brokerage')->where('id', $id)->update([
                    'frozen_time' => 0,
                    'review_time' => $reviewTime,
                ]) !== false;
            }

            $user = Db::name('user')->where('uid', (int)$row['uid'])->lock(true)->find();
            if (!$user) {
                throw new AdminException('佣金所属用户不存在');
            }
            $balance = (string)($user['brokerage_price'] ?? '0');
            $newBalance = bcsub($balance, (string)$row['number'], 2);
            Db::name('user')->where('uid', (int)$row['uid'])->update(['brokerage_price' => $newBalance]);

            return Db::name('user_brokerage')->where('id', $id)->update([
                'status' => -1,
                'frozen_time' => 0,
                'review_time' => $reviewTime,
                'balance' => bccomp($newBalance, '0', 2) < 0 ? '0.00' : $newBalance,
                'mark' => mb_substr((string)$row['mark'] . '；结算驳回：' . trim($reason), 0, 512),
            ]) !== false;
        });
    }

    private function eligibleUser(int $uid): ?array
    {
        if ($uid <= 0 || !$this->isEnabled()) {
            return null;
        }
        $user = Db::name('user')
            ->where('uid', $uid)
            ->field('uid,agent_level,agent_level_time,is_ever_level,is_money_level,overdue_time,is_promoter,spread_open,status,is_del')
            ->find();
        if (!$user
            || (int)$user['is_del'] === 1
            || (int)$user['status'] !== 1
            || (int)$user['is_ever_level'] !== 1
            || (int)$user['is_promoter'] !== 1
            || (int)$user['spread_open'] !== 1
        ) {
            return null;
        }
        return $user;
    }

    /**
     * Only direct members bound after the current identity became effective
     * can consume that identity's premium commission quota.
     */
    private function premiumQuotaUsed(int $uid, int $effectiveTime, int $excludeUid = 0): int
    {
        if ($uid <= 0 || $effectiveTime <= 0) {
            return 0;
        }
        $query = Db::name('user')
            ->where('spread_uid', $uid)
            ->where('spread_time', '>=', $effectiveTime)
            ->where('is_del', 0);
        if ($excludeUid > 0) {
            $query->where('uid', '<>', $excludeUid);
        }
        return count($this->activePaidMemberUids($query->column('uid')));
    }

    private function isPremiumQuotaCandidate(int $uid, int $buyerUid, int $effectiveTime): bool
    {
        if ($uid <= 0 || $buyerUid <= 0 || $effectiveTime <= 0) {
            return false;
        }
        $buyer = Db::name('user')
            ->where('uid', $buyerUid)
            ->where('spread_uid', $uid)
            ->where('spread_time', '>=', $effectiveTime)
            ->where('is_del', 0)
            ->field('uid')
            ->find();
        // This check runs inside the successful payment transaction. The camp
        // mirror row is marked paid immediately after commission settlement, so
        // requiring it here would incorrectly downgrade every current buyer.
        return (bool)$buyer;
    }

    private function activePaidMemberUids(array $uids): array
    {
        if (!$uids) {
            return [];
        }
        $uids = array_values(array_unique(array_filter(array_map('intval', $uids))));
        if (!$uids) {
            return [];
        }
        $activeUsers = Db::name('user')
            ->whereIn('uid', $uids)
            ->where('is_del', 0)
            ->where('status', 1)
            ->column('uid');
        if (!$activeUsers) {
            return [];
        }
        return array_values(array_unique(array_map('intval', Db::name(self::CAMP_ORDER_TABLE)
            ->whereIn('uid', $activeUsers)
            ->where('order_state', 'paid')
            ->where('refund_state', '<>', 'refunded')
            ->column('uid'))));
    }

    private function incomeSummary(int $uid, string $brokerageBalance): array
    {
        $positive = Db::name('user_brokerage')
            ->where('uid', $uid)
            ->whereIn('type', self::MEMBER_INCOME_TYPES)
            ->where('pm', 1)
            ->where('status', 1);
        $totalAmount = (string)(clone $positive)->sum('number');
        $pendingAmount = (string)(clone $positive)->where('frozen_time', '>', time())->sum('number');
        $firstAmount = (string)(clone $positive)
            ->whereIn('type', ['self_member_brokerage', 'one_member_brokerage'])
            ->sum('number');
        $secondAmount = (string)(clone $positive)->where('type', 'two_member_brokerage')->sum('number');
        $revokedAmount = (string)Db::name('user_brokerage')
            ->where('uid', $uid)
            ->whereIn('type', self::MEMBER_INCOME_TYPES)
            ->where('pm', 1)
            ->where('status', -1)
            ->sum('number');
        $refundAmount = (string)Db::name('user_brokerage')
            ->where('uid', $uid)
            ->where('type', self::COMMISSION_REFUND_TYPE)
            ->where('pm', 0)
            ->where('status', 1)
            ->sum('number');
        $netAvailableAmount = bcsub($brokerageBalance, $pendingAmount, 2);
        $debtAmount = '0.00';
        $availableAmount = $netAvailableAmount;
        if (bccomp($netAvailableAmount, '0', 2) < 0) {
            $debtAmount = bcmul($netAvailableAmount, '-1', 2);
            $availableAmount = '0.00';
        }

        $withdrawingAmount = (string)Db::name('user_extract')
            ->where('uid', $uid)
            ->where('extract_type', 'weixin')
            ->where(function ($query) {
                $query->where('status', 0)->whereOr(function ($query) {
                    $query->where('status', 1)->where('state', '<>', 'SUCCESS');
                });
            })
            ->sum('extract_price');
        $withdrawnBase = Db::name('user_extract')
            ->where('uid', $uid)
            ->where('extract_type', 'weixin')
            ->where('status', 1)
            ->where('state', 'SUCCESS');
        $withdrawnAmount = bcsub(
            (string)(clone $withdrawnBase)->sum('extract_price'),
            (string)(clone $withdrawnBase)->sum('extract_fee'),
            2
        );

        return [
            'totalAmount' => $this->money($totalAmount),
            'pendingAmount' => $this->money($pendingAmount),
            'availableAmount' => $this->money($availableAmount),
            'debtAmount' => $this->money($debtAmount),
            'refundAmount' => $this->money($refundAmount),
            'withdrawingAmount' => $this->money($withdrawingAmount),
            'withdrawnAmount' => $this->money($withdrawnAmount),
            'firstAmount' => $this->money($firstAmount),
            'secondAmount' => $this->money($secondAmount),
            'revokedAmount' => $this->money($revokedAmount),
            'balanceAmount' => $this->money($brokerageBalance),
        ];
    }

    private function money($amount): string
    {
        return number_format((float)$amount, 2, '.', '');
    }

    private function normalizeAgentLevel(int $agentLevel): int
    {
        if ($agentLevel <= 0) return 0;
        if ($agentLevel === 1) return 1;
        if ($agentLevel === 2) return 2;
        return 3;
    }
}
