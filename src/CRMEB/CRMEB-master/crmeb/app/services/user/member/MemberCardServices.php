<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

namespace app\services\user\member;


use app\dao\user\MemberCardDao;
use app\services\BaseServices;
use app\services\order\OtherOrderServices;
use app\services\order\StoreOrderCreateServices;
use app\services\user\UserServices;
use crmeb\exceptions\AdminException;
use crmeb\exceptions\ApiException;
use crmeb\services\SystemConfigService;
use think\facade\Db;

class MemberCardServices extends BaseServices
{
    /**
     * @var MemberCardDao
     */
    protected $dao;

    /** 初始化，获得dao层句柄
     * MemberCardServices constructor.
     * @param MemberCardDao $memberCardDao
     */
    public static $_memberTypePrefix = ['month', 'quarter', 'year', 'ever', 'free', 'owner'];

    public function __construct(MemberCardDao $memberCardDao)
    {
        $this->dao = $memberCardDao;
    }

    public function getSearchList(array $where = [])
    {
        /** @var  UserServices $userService */
        $userService = app()->make(UserServices::class);
        [$page, $limit] = $this->getPageValue();
        $where['batch_card_id'] = $where['card_batch_id'];
        if ($where['is_use'] != "") {
            if ($where['is_use'] == 0) {
                $where['use_time'] = 0;
            } else {
                $where['use_time'] = 1;
            }
        }
        unset($where['is_use']);
        $list = $this->dao->getSearchList($where, $page, $limit);
        $userIds = array_column($list->toArray(), 'use_uid');
        $userList = $userService->getColumn([['uid', 'in', $userIds]], 'nickname,phone,real_name', 'uid');
        foreach ($list as $k => $v) {
            if ($v['use_uid']) {
                $list[$k]['username'] = $userList[$v['use_uid']]['real_name'] ?: $userList[$v['use_uid']]['nickname'];
                $list[$k]['phone'] = $userList[$v['use_uid']] ? $userList[$v['use_uid']]['phone'] : "";
            }
            $list[$k]['add_time'] = date('Y-m-d H:i:s', $v['add_time']);
            $list[$k]['use_time'] = $v['use_time'] != 0 ? date('Y-m-d H:i:s', $v['use_time']) : "未使用";
        }
        $count = $this->dao->count($where);
        return compact('list', 'count');

    }

    /** 生成免费会员卡
     * @param array $data
     */
    public function addCard(array $data)
    {
        if (!isset($data['card_batch_id']) || !$data['card_batch_id'] || $data['card_batch_id'] == 0 || !isset($data['total_num']) || !$data['total_num'] || $data['total_num'] == 0) {
            throw new AdminException('参数错误');
        }
        try {
            if (!isset($data['total_num'])) throw new AdminException('参数错误');
            $num = $data['total_num'];
            unset($data['total_num']);
            $res = [];
            for ($i = 0; $i < $num; $i++) {
                // The card number alone is the redemption credential (20 characters).
                $data['card_number'] = 'CR' . strtoupper(bin2hex(random_bytes(9)));
                $data['card_password'] = $this->makeRandomNumber();
                $data['status'] = 1;
                $data['add_time'] = time();
                $res[] = $data;
            }
            //数据切片批量插入，提高性能。
            $chunk_inster_card = array_chunk($res, 100, true);
            foreach ($chunk_inster_card as $v) {
                $this->dao->saveAll($v);
            }
            return true;
        } catch (\Exception $exception) {
            throw new AdminException('生成卡失败');
        }
    }

    /**获取制卡卡号随机数
     * @param bool $prefix
     * @param bool $random
     * @return string
     */
    public function makeRandomNumber($prefix = false, $random = false)
    {
        if (!$prefix) {
            $prefix = "";
        }
        if (!$random || !is_numeric($random)) {
            $one_random = mt_rand(11111, 99999);
        } else {
            $one_random = sprintf("%05d", $random);
        }
        $date_random = date('ymd', time());
        $random_tmp = strlen($one_random);
        $two_randow = str_pad(mt_rand(1, 99999), $random_tmp, '0', STR_PAD_LEFT);
        if (!$random) {
            return $two_randow;
        } else {
            return $prefix . $one_random . $date_random . $two_randow;
        }
    }

    /** 领取会员卡
     * @param array $data
     * @param int $uid
     */
    public function drawMemberCard(array $data, int $uid)
    {
        if ($uid <= 0) throw new ApiException('请先登录');
        if (!$this->isOpenMemberCard()) throw new ApiException('会员功能暂未开启');
        $redeemCode = strtoupper(trim($data['code'] ?? $data['member_card_code'] ?? ''));
        if ($redeemCode === '') throw new ApiException('请输入兑换码');
        if (!preg_match('/^[A-Z0-9]{1,20}$/D', $redeemCode)) throw new ApiException('兑换码格式错误');

        return $this->transaction(function () use ($data, $uid, $redeemCode) {
            // Serialize different codes for one user, as well as one code for different users.
            $user = Db::name('user')->where('uid', $uid)->lock(true)->find();
            if (!$user || !empty($user['is_del']) || (int)$user['status'] !== 1) {
                throw new ApiException('用户不存在或已停用');
            }
            $card = Db::name('member_card')->where('card_number', $redeemCode)->find();
            if (!$card) throw new ApiException('兑换码不存在');
            // Batch before card matches the order used when operators disable a batch.
            $batch = Db::name('member_card_batch')->where('id', (int)$card['card_batch_id'])->lock(true)->find();
            $cards = Db::name('member_card')->where('card_number', $redeemCode)->limit(2)->lock(true)->select()->toArray();
            if (count($cards) !== 1) throw new ApiException('兑换码异常，请联系管理员');
            $card = $cards[0];
            if (!$batch || (int)$card['card_batch_id'] !== (int)$batch['id']) {
                throw new ApiException('兑换码批次不存在');
            }
            if (!empty($data['member_card_pwd']) && $card['card_password'] !== trim($data['member_card_pwd'])) {
                throw new ApiException('兑换码密码有误');
            }
            if ((int)$card['use_uid'] !== 0 || (int)$card['use_time'] !== 0) {
                // A lost success response can be retried, but a revoked membership is never restored.
                if ((int)$card['use_uid'] === $uid && (int)$card['use_time'] > 0 && (int)$user['is_ever_level'] === 1) {
                    return true;
                }
                throw new ApiException('兑换码已使用');
            }
            if ((int)$batch['status'] !== 1 || (int)$card['status'] !== 1) {
                throw new ApiException('兑换码未激活或已停用');
            }
            $now = time();
            if (!empty($batch['expire_time']) && (int)$batch['expire_time'] <= $now) {
                throw new ApiException('兑换码已过期');
            }
            if ((int)$user['is_ever_level'] === 1) {
                throw new ApiException('您已是永久会员，无需再兑换');
            }

            $claimed = Db::name('member_card')->where('id', (int)$card['id'])
                ->where('use_uid', 0)->where('use_time', 0)->where('status', 1)
                ->update(['use_uid' => $uid, 'use_time' => $now, 'update_time' => $now]);
            if ($claimed !== 1) throw new ApiException('兑换码已使用，请刷新后重试');
            $counted = app()->make(MemberCardBatchServices::class)->useCardSetInc((int)$batch['id'], 'use_num', 1);
            if (!$counted) throw new ApiException('兑换失败，请稍后重试');
            $record = app()->make(OtherOrderServices::class)->addOtherOrderData([
                'uid' => $uid,
                'member_code' => $card['card_number'],
                'overdue_time' => 0,
                'order_id' => app()->make(StoreOrderCreateServices::class)->getNewOrderId('hy'),
                'channel_type' => $data['from'] ?? 'h5',
                'member_type' => 'redeem',
                'vip_day' => -1,
                'is_permanent' => 1,
                'type' => 2,
                'paid' => 1,
                'pay_price' => 0,
                'pay_time' => $now,
            ]);
            if (!$record) throw new ApiException('兑换记录保存失败，请稍后重试');
            // Keep the existing permanent-member and pending-referrer binding semantics.
            if (!app()->make(UserServices::class)->setPermanentMember($uid, 2)) {
                throw new ApiException('会员开通失败，请稍后重试');
            }
            return true;
        });
    }

    /**  验证是否存在此类型会员卡
     * @param string $member_type
     * @return bool
     */
    public function checkmemberType(string $member_type)
    {
        $member_type_arr = $this->getMemberTypeInfo();
        if (!array_key_exists($member_type, $member_type_arr)) throw new ApiException('暂无此类型会员卡');
        return true;
    }

    /** 获取会员权益和说明配置
     * @return array
     */
    public function getMemberRightsInfo()
    {
        /** @var MemberRightServices $memberRightService */
        $memberRightService = app()->make(MemberRightServices::class);
        $memberRight = $memberRightService->getSearchList(['status' => 1]);
        if ($memberRight['list']) {
            foreach ($memberRight['list'] as $k => &$v) {
                $v['title'] = $v['show_title'];
                $v['pic'] = $v['image'];
                $v['right'] = $v['explain'];
                if ($v['right_type'] == 'offline') $v['explain'] = '线下支付打' . floatval(bcdiv((string)$v['number'], '10', 1)) . '折';
                if ($v['right_type'] == 'sign') $v['explain'] = '签到多得' . (int)$v['number'] . '倍积分';
                if ($v['right_type'] == 'express') $v['explain'] = '运费打' . floatval(bcdiv((string)$v['number'], '10', 1)) . '折';
                if ($v['right_type'] == 'integral') $v['explain'] = '消费多返' . (int)$v['number'] . '倍积分';
            }
        }

        return ['member_right' => $memberRight['list']];
    }

    /**获取会员卡配置
     * @return array
     */
    public function getMemberTypeInfo()
    {
        /** @var SystemConfigService $systemConfigService */
        $systemConfigService = app()->make(SystemConfigService::class);
        $data = [];
        foreach (self::$_memberTypePrefix as $v) {
            $data[$v] = $systemConfigService::more([$v . '_title', $v . '_vip_day', $v . '_pre_price', $v . '_price']);
        }
        return $data;
    }

    /**会员卡数据处理
     * @return array
     */
    public function DoMemberType()
    {
        $data = array();
        /** @var MemberShipServices $memberShipService */
        $memberShipService = app()->make(MemberShipServices::class);
        $list = $memberShipService->getApiList(['is_del' => 0]);
        foreach ($list as $v) {
            $data[] = [
                'mc_id' => $v['id'],
                'title' => $v['title'],
                'type' => $v['type'],
                'vip_day' => $v['vip_day'],
                'pre_price' => $v['pre_price'],
                'price' => $v['price'],
            ];
        }
        return $data;
    }

    /**会员类型数据
     * @return bool
     */
    public function getMemberTypeValue()
    {
        $member_type = $this->DoMemberType();
        if (!$member_type) return false;
        $new_member_data = [];
        foreach ($member_type as $k => $v) {
            $new_member_data[$v['mc_id']] = $v;
        }
        return $new_member_data;
    }

    /**导出会员卡
     * @param $where
     * @return \think\Collection
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    public function getExportData($where)
    {
        $data = $this->dao->getSearchList($where);
        /** @var UserServices $userService */
        $userService = app()->make(UserServices::class);
        /** @var MemberCardBatchServices $batchService */
        $batchService = app()->make(MemberCardBatchServices::class);
        foreach ($data as $k => $v) {
            $data[$k]['use_time'] = $v['use_time'] != 0 ? date('Y-m-d H:i:s', $v['use_time']) : "";
            $data[$k]['user_name'] = '';
            $data[$k]['user_phone'] = '';
            if ($v['use_uid'] != 0) {
                $userInfo = $userService->get($v['use_uid']);
                $data[$k]['user_name'] = $userInfo['nickname'] ?: $userInfo['account'];
                $data[$k]['user_phone'] = $userInfo['phone'];
            }
        }
        $batchInfo = $batchService->getOne($where['batch_card_id']);
        $dataArray['title'] = $batchInfo ? $batchInfo['title'] : "";
        $dataArray['data'] = $data;
        return $dataArray;
    }

    /**获取会员记录
     * @param array $where
     * @return array
     */
    public function getSearchRecordList(array $where)
    {
        /** @var OtherOrderServices $otherOrderSevice */
        $otherOrderSevice = app()->make(OtherOrderServices::class);
        return $otherOrderSevice->getMemberRecord($where);
    }

    /**
     * 看是否开启会员功能
     * @param string $rightType
     * @param bool $get_number
     * @return bool|mixed
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    public function isOpenMemberCard(string $rightType = '', bool $get_number = true)
    {
        $isOpen = sys_config('member_card_status', 1);
        //如果传入权益类别，查看是否具有某权益
        if (!$rightType) {
            if ($isOpen) return true;
            return false;
        } else {
            /** @var MemberRightServices $memberRightService */
            $memberRightService = app()->make(MemberRightServices::class);
            $memberRight = $memberRightService->getOne(['right_type' => $rightType], 'status,number');
            if ($isOpen && $memberRight && $memberRight['status']) {
                if ($get_number) {
                    $number = $memberRight['number'];
                    if (!$number) return false;
                    return $number;
                }
                return true;
            }
            return false;
        }

    }

    /**
     * 修改会员卡状态
     * @param $id
     * @param $status
     * @return bool
     */
    public function setStatus($id, $status)
    {
        $card_batch_id = $this->dao->value(['id' => $id], 'card_batch_id');
        $card_batch_status = app()->make(MemberCardBatchServices::class)->value(['id' => $card_batch_id], 'status');
        if ($card_batch_status == 0) {
            throw new AdminException('批次未激活，暂无法使用');
        }
        $res = $this->dao->update($id, ['status' => $status]);
        if ($res) return true;
        return false;
    }
}
