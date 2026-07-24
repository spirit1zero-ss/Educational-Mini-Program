<?php

namespace app\services\user;

use app\services\BaseServices;
use crmeb\exceptions\AdminException;
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

    private const LEVELS = [
        0 => ['key' => 'C', 'name' => '普通会员', 'initialQuota' => 1, 'firstCommission' => '120.00'],
        1 => ['key' => 'M', 'name' => '盟友', 'initialQuota' => 30, 'firstCommission' => '150.00'],
        2 => ['key' => 'D', 'name' => '代理', 'initialQuota' => 50, 'firstCommission' => '200.00'],
        3 => ['key' => 'H', 'name' => '合伙人', 'initialQuota' => 200, 'firstCommission' => '300.00'],
    ];

    private const SECOND_COMMISSION = '20.00';

    private const MEMBER_INCOME_TYPES = [
        'self_member_brokerage',
        'one_member_brokerage',
        'two_member_brokerage',
    ];

    public function profile(array $user): array
    {
        $uid = (int)($user['uid'] ?? 0);
        $agentLevel = $this->normalizeAgentLevel((int)($user['agent_level'] ?? 0));
        $level = self::LEVELS[$agentLevel];

        return [
            'levelId' => $agentLevel,
            'levelKey' => $level['key'],
            'levelName' => $level['name'],
            'identityCode' => $uid > 0 ? $level['key'] . str_pad((string)$uid, 5, '0', STR_PAD_LEFT) : '',
            'initialQuota' => $level['initialQuota'],
            'firstCommission' => $level['firstCommission'],
            'secondCommission' => self::SECOND_COMMISSION,
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

    public function firstCommissionForUid(int $uid): string
    {
        $user = $this->eligibleUser($uid);
        return $user ? $this->profile($user)['firstCommission'] : '0.00';
    }

    public function secondCommissionForUid(int $uid): string
    {
        return $this->eligibleUser($uid) ? self::SECOND_COMMISSION : '0.00';
    }

    public function teamStats(int $uid): array
    {
        $user = Db::name('user')->where('uid', $uid)->field('uid,agent_level')->find() ?: ['uid' => $uid];
        $profile = $this->profile($user);

        $firstLevelUids = Db::name('user')
            ->where('spread_uid', $uid)
            ->where('is_del', 0)
            ->column('uid');
        $firstLevelCount = $this->countActiveMembers($firstLevelUids);

        $secondLevelUids = $firstLevelUids
            ? Db::name('user')->whereIn('spread_uid', $firstLevelUids)->where('is_del', 0)->column('uid')
            : [];
        $secondLevelCount = $this->countActiveMembers($secondLevelUids);

        return array_merge($profile, [
            'firstLevelCount' => $firstLevelCount,
            'secondLevelCount' => $secondLevelCount,
            'pullNewCount' => $firstLevelCount + $secondLevelCount,
        ]);
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

            if ($decision === 'approve') {
                return Db::name('user_brokerage')->where('id', $id)->update(['frozen_time' => 0]) !== false;
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
                'balance' => bccomp($newBalance, '0', 2) < 0 ? '0.00' : $newBalance,
                'mark' => mb_substr((string)$row['mark'] . '；结算驳回：' . trim($reason), 0, 512),
            ]) !== false;
        });
    }

    private function eligibleUser(int $uid): ?array
    {
        if ($uid <= 0) {
            return null;
        }
        $user = Db::name('user')
            ->where('uid', $uid)
            ->field('uid,agent_level,is_ever_level,is_money_level,overdue_time,is_promoter,spread_open,status,is_del')
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

    private function countActiveMembers(array $uids): int
    {
        if (!$uids) {
            return 0;
        }
        return (int)Db::name('user')
            ->whereIn('uid', array_values(array_unique(array_map('intval', $uids))))
            ->where('is_del', 0)
            ->where('status', 1)
            ->where('is_ever_level', 1)
            ->count();
    }

    private function normalizeAgentLevel(int $agentLevel): int
    {
        if ($agentLevel <= 0) return 0;
        if ($agentLevel === 1) return 1;
        if ($agentLevel === 2) return 2;
        return 3;
    }
}
