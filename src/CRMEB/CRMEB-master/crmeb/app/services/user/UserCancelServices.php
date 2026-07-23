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
namespace app\services\user;

use app\dao\user\UserCancelDao;
use app\services\BaseServices;
use app\services\kefu\service\StoreServiceServices;
use app\services\wechat\WechatUserServices;
use crmeb\exceptions\ApiException;
use think\facade\Db;

class UserCancelServices extends BaseServices
{
    protected $status = ['待审核', '已通过', '已拒绝'];

    /**
     * UserExtractServices constructor.
     * @param UserCancelDao $dao
     */
    public function __construct(UserCancelDao $dao)
    {
        $this->dao = $dao;
    }

    /**
     * 提交用户注销
     * @param $userInfo
     * @return mixed
     */
    public function SetUserCancel($uid)
    {
        /** @var UserServices $userServices */
        $userServices = app()->make(UserServices::class);
        /** @var WechatUserServices $wechatUserServices */
        $wechatUserServices = app()->make(WechatUserServices::class);
        /** @var StoreServiceServices $ServiceServices */
        $ServiceServices = app()->make(StoreServiceServices::class);
        $user = $userServices->getUserInfo($uid);
        if (!$user) {
            throw new ApiException('用户不存在或已经注销');
        }
        $unsettledExtract = Db::name('user_extract')
            ->where('uid', $uid)
            ->where(function ($query) {
                $query->where('status', 0)
                    ->whereOr(function ($query) {
                        $query->where('status', 1)
                            ->where('package_info', '<>', '')
                            ->where('state', '<>', 'SUCCESS');
                    });
            })
            ->find();
        if ($unsettledExtract) {
            throw new ApiException('该用户仍有未完成的提现，请先处理提现后再注销');
        }

        $this->transaction(function () use ($uid, $userServices, $wechatUserServices, $ServiceServices) {
            $userServices->update($uid, [
                'is_del' => 1,
                'status' => 0,
                'is_promoter' => 0,
                'spread_open' => 0,
                'is_ever_level' => 0,
                'is_money_level' => 0,
                'overdue_time' => 0,
            ]);
            $userServices->update(['spread_uid' => $uid], ['spread_uid' => 0, 'spread_time' => 0]);
            $wechatUserServices->update(['uid' => $uid], ['is_del' => 1]);
            $ServiceServices->delete(['uid' => $uid]);
        });

        //自定义事件-用户注销
        event('CustomEventListener', ['user_cancel', [
            'uid' => $uid,
            'nickname' => $user['nickname'],
            'phone' => $user['phone'],
            'add_time' => date('Y-m-d H:i:s', $user['add_time']),
            'cancel_time' => date('Y-m-d H:i:s'),
            'user_type' => $user['user_type'],
        ]]);

        return true;
    }

    /**
     * 获取注销列表
     * @param $where
     * @return array
     */
    public function getCancelList($where)
    {
        [$page, $limit] = $this->getPageValue();
        $list = $this->dao->getList($where, $page, $limit);
        foreach ($list as &$item) {
            $item['add_time'] = date('Y-m-d H:i:s', $item['add_time']);
            $item['up_time'] = $item['up_time'] != 0 ? date('Y-m-d H:i:s', $item['add_time']) : '';
            $item['status'] = $this->status[$item['status']];
        }
        $count = $this->dao->count($where);
        return compact('list', 'count');
    }

    /**
     * 备注
     * @param $id
     * @param $mark
     * @return mixed
     */
    public function serMark($id, $mark)
    {
        return $this->dao->update($id, ['remark' => $mark]);
    }
}
