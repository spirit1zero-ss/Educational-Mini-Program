<?php

namespace app\services\miniapp;

use app\services\BaseServices;
use crmeb\exceptions\ApiException;
use think\facade\Db;

class TrainingCampRegistrationServices extends BaseServices
{
    private const PROBLEM_LABELS = [
        'internet_school_refusal' => '网瘾厌学',
        'homework_delay' => '作业拖拉磨蹭',
        'hard_work_low_score' => '学习用功但成绩不理想',
        'partial_subject' => '偏科',
        'other' => '其它',
    ];

    public function getForMiniapp(int $uid): array
    {
        $this->requireUid($uid);
        $row = $this->getRawByUid($uid);
        $memberStatus = $this->getMemberStatus($uid);

        return [
            'completed' => !empty($row),
            'canRegister' => !empty($memberStatus['isMember']),
            'memberStatus' => $memberStatus,
            'form' => $row ? $this->formatMiniappRow($row) : $this->emptyForm(),
            'problemOptions' => $this->problemOptions(),
        ];
    }

    public function getSummaryForMiniapp(int $uid): array
    {
        $this->requireUid($uid);
        $row = $this->getRawByUid($uid);
        $memberStatus = $this->getMemberStatus($uid);

        return [
            'completed' => !empty($row),
            'canRegister' => !empty($memberStatus['isMember']),
            'memberStatus' => $memberStatus,
        ];
    }

    public function saveForMiniapp(int $uid, array $input): array
    {
        $this->requireUid($uid);
        $exists = $this->getRawByUid($uid);
        $latestOrder = $this->getLatestPaidMemberOrder($uid);
        $memberStatus = $this->getMemberStatus($uid);
        if (empty($memberStatus['isMember'])) {
            throw new ApiException('请开通训练营会员后再填写会员登记表');
        }

        $data = $this->validateInput($input);
        $now = time();

        $data['uid'] = $uid;
        $data['order_id'] = (int)($latestOrder['id'] ?? $exists['order_id'] ?? 0);
        $data['order_sn'] = (string)($latestOrder['order_id'] ?? $exists['order_sn'] ?? '');
        $data['update_time'] = $now;

        if ($exists) {
            Db::name('training_camp_registration')->where('uid', $uid)->update($data);
        } else {
            $data['add_time'] = $now;
            Db::name('training_camp_registration')->insert($data);
        }

        return $this->getForMiniapp($uid);
    }

    public function adminList(array $where): array
    {
        [$page, $limit, $defaultLimit] = $this->getPageValue();
        $limit = $limit ?: $defaultLimit;

        $query = Db::name('training_camp_registration')
            ->alias('r')
            ->leftJoin('user u', 'u.uid = r.uid')
            ->where('r.is_del', 0);

        $keyword = trim((string)($where['keyword'] ?? ''));
        if ($keyword !== '') {
            $query->where(function ($query) use ($keyword) {
                $query->whereLike('r.child_name|r.contact_phone|r.order_sn|u.nickname|u.phone', '%' . $keyword . '%');
            });
        }

        $childName = trim((string)($where['child_name'] ?? ''));
        if ($childName !== '') {
            $query->whereLike('r.child_name', '%' . $childName . '%');
        }

        $phone = trim((string)($where['contact_phone'] ?? ''));
        if ($phone !== '') {
            $query->whereLike('r.contact_phone', '%' . $phone . '%');
        }

        if (!empty($where['add_time'])) {
            $times = explode('-', (string)$where['add_time']);
            if (count($times) >= 2) {
                $start = strtotime(trim($times[0]));
                $end = strtotime(trim($times[1]) . ' 23:59:59');
                if ($start && $end) {
                    $query->whereBetween('r.add_time', [$start, $end]);
                }
            }
        }

        $count = (clone $query)->count();
        $rows = $query
            ->field('r.id,r.uid,r.order_id,r.order_sn,r.child_name,r.child_age,r.child_gender,r.problems,r.other_problem,r.contact_phone,r.add_time,r.update_time,u.nickname,u.phone,u.avatar')
            ->order('r.update_time desc,r.id desc')
            ->page($page ?: 1, $limit)
            ->select()
            ->toArray();

        return [
            'list' => array_map([$this, 'formatAdminRow'], $rows),
            'count' => $count,
        ];
    }

    public function getMemberStatus(int $uid): array
    {
        $user = Db::name('user')
            ->where('uid', $uid)
            ->field('uid,is_money_level,is_ever_level,overdue_time')
            ->find();
        $latestOrder = $this->getLatestPaidMemberOrder($uid);
        $isMember = false;

        if ($user) {
            $overdueTime = (int)($user['overdue_time'] ?? 0);
            $isMember = (int)($user['is_money_level'] ?? 0) > 0
                || (int)($user['is_ever_level'] ?? 0) > 0
                || $overdueTime > time();
        }

        return [
            'isMember' => (bool)$isMember,
            'hasPaidMemberOrder' => !empty($latestOrder),
            'latestOrderId' => (int)($latestOrder['id'] ?? 0),
            'latestOrderSn' => (string)($latestOrder['order_id'] ?? ''),
        ];
    }

    public function adminDelete(int $id): bool
    {
        if ($id <= 0) {
            throw new ApiException('报名记录参数错误');
        }
        $row = Db::name('training_camp_registration')->where('id', $id)->where('is_del', 0)->find();
        if (!$row) {
            throw new ApiException('报名记录不存在或已经删除');
        }
        return Db::name('training_camp_registration')->where('id', $id)->update([
            'is_del' => 1,
            'update_time' => time(),
        ]) > 0;
    }

    private function validateInput(array $input): array
    {
        $childName = trim((string)($input['child_name'] ?? ''));
        if ($childName === '' || mb_strlen($childName, 'UTF-8') > 20) {
            throw new ApiException('请填写孩子姓名，最多20个字');
        }

        $childAge = (int)($input['child_age'] ?? 0);
        if ($childAge < 3 || $childAge > 18) {
            throw new ApiException('请填写3-18之间的年龄');
        }

        $childGender = trim((string)($input['child_gender'] ?? ''));
        if (!in_array($childGender, ['male', 'female', 'unknown'], true)) {
            throw new ApiException('请选择孩子性别');
        }

        $problems = $input['problems'] ?? [];
        if (is_string($problems)) {
            $decoded = json_decode($problems, true);
            $problems = is_array($decoded) ? $decoded : [];
        }
        $problems = array_values(array_unique(array_filter(array_map('strval', (array)$problems))));
        $allowedProblems = array_keys(self::PROBLEM_LABELS);
        foreach ($problems as $problem) {
            if (!in_array($problem, $allowedProblems, true)) {
                throw new ApiException('请选择正确的问题类型');
            }
        }
        if (!$problems) {
            throw new ApiException('请至少选择一个主要问题');
        }

        $otherProblem = trim((string)($input['other_problem'] ?? ''));
        if (in_array('other', $problems, true)) {
            if ($otherProblem === '') {
                throw new ApiException('请填写其它问题说明');
            }
            if (mb_strlen($otherProblem, 'UTF-8') > 100) {
                throw new ApiException('其它问题说明最多100个字');
            }
        } else {
            $otherProblem = '';
        }

        $contactPhone = trim((string)($input['contact_phone'] ?? ''));
        if (!preg_match('/^1[3-9]\d{9}$/', $contactPhone)) {
            throw new ApiException('请填写正确的联系电话');
        }

        return [
            'child_name' => $childName,
            'child_age' => $childAge,
            'child_gender' => $childGender,
            'problems' => json_encode($problems, JSON_UNESCAPED_UNICODE),
            'other_problem' => $otherProblem,
            'contact_phone' => $contactPhone,
        ];
    }

    private function getRawByUid(int $uid): ?array
    {
        $row = Db::name('training_camp_registration')
            ->where('uid', $uid)
            ->where('is_del', 0)
            ->find();

        return $row ?: null;
    }

    private function getLatestPaidMemberOrder(int $uid): ?array
    {
        $row = Db::name('other_order')
            ->where('uid', $uid)
            ->where('paid', 1)
            ->where('is_del', 0)
            ->where('member_type', '<>', '')
            ->field('id,order_id,pay_time,add_time')
            ->order('pay_time desc,id desc')
            ->find();

        return $row ?: null;
    }

    private function formatMiniappRow(array $row): array
    {
        return [
            'child_name' => (string)($row['child_name'] ?? ''),
            'child_age' => (int)($row['child_age'] ?? 0),
            'child_gender' => (string)($row['child_gender'] ?? ''),
            'problems' => $this->decodeProblems($row['problems'] ?? '[]'),
            'other_problem' => (string)($row['other_problem'] ?? ''),
            'contact_phone' => (string)($row['contact_phone'] ?? ''),
            'order_id' => (int)($row['order_id'] ?? 0),
            'order_sn' => (string)($row['order_sn'] ?? ''),
            'update_time' => (int)($row['update_time'] ?? 0),
        ];
    }

    private function formatAdminRow(array $row): array
    {
        $problems = $this->decodeProblems($row['problems'] ?? '[]');

        return [
            'id' => (int)($row['id'] ?? 0),
            'uid' => (int)($row['uid'] ?? 0),
            'nickname' => (string)($row['nickname'] ?? ''),
            'user_phone' => (string)($row['phone'] ?? ''),
            'avatar' => (string)($row['avatar'] ?? ''),
            'order_id' => (int)($row['order_id'] ?? 0),
            'order_sn' => (string)($row['order_sn'] ?? ''),
            'child_name' => (string)($row['child_name'] ?? ''),
            'child_age' => (int)($row['child_age'] ?? 0),
            'child_gender' => (string)($row['child_gender'] ?? ''),
            'child_gender_text' => $this->genderText((string)($row['child_gender'] ?? '')),
            'problems' => $problems,
            'problem_text' => implode('、', array_map(function ($key) {
                return self::PROBLEM_LABELS[$key] ?? $key;
            }, $problems)),
            'other_problem' => (string)($row['other_problem'] ?? ''),
            'contact_phone' => (string)($row['contact_phone'] ?? ''),
            'add_time' => !empty($row['add_time']) ? date('Y-m-d H:i:s', (int)$row['add_time']) : '',
            'update_time' => !empty($row['update_time']) ? date('Y-m-d H:i:s', (int)$row['update_time']) : '',
        ];
    }

    private function emptyForm(): array
    {
        return [
            'child_name' => '',
            'child_age' => '',
            'child_gender' => '',
            'problems' => [],
            'other_problem' => '',
            'contact_phone' => '',
            'order_id' => 0,
            'order_sn' => '',
            'update_time' => 0,
        ];
    }

    private function problemOptions(): array
    {
        $options = [];
        foreach (self::PROBLEM_LABELS as $key => $label) {
            $options[] = compact('key', 'label');
        }

        return $options;
    }

    private function decodeProblems($value): array
    {
        $decoded = is_array($value) ? $value : json_decode((string)$value, true);
        if (!is_array($decoded)) {
            return [];
        }

        return array_values(array_filter($decoded, function ($key) {
            return isset(self::PROBLEM_LABELS[$key]);
        }));
    }

    private function genderText(string $gender): string
    {
        return [
            'male' => '男',
            'female' => '女',
            'unknown' => '暂不填写',
        ][$gender] ?? '';
    }

    private function requireUid(int $uid): void
    {
        if ($uid <= 0) {
            throw new ApiException('请先登录');
        }
    }
}
