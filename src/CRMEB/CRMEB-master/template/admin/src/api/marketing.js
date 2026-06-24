// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2023 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import request from '@/libs/request';

/**
 * @description 积分备注
 * @param {Number} id 订单id
 * @param {Object} data 备注信息
 */
export function setPointRecordMark(id, data) {
  return request({
    url: `marketing/point_record/remark/${id}`,
    method: 'post',
    data,
  });
}


/**
 * 积分统计列表
 * @param {com} data
 */
export function pointRecordList(data) {
  return request({
    url: 'marketing/point_record',
    method: 'get',
    params: data,
  });
}
/**
 * 积分统计列表 备注
 * @param {com} data
 */
export function pointRecordRemark(id, data) {
  return request({
    url: `marketing/point_record/remark/${id}`,
    method: 'post',
    data,
  });
}

/**
 * 积分统计顶部
 * @param {com} data
 */
export function getPointBasic(data) {
  return request({
    url: 'marketing/point/get_basic',
    method: 'get',
    params: data,
  });
}

/**
 * 积分统计 折线图
 * @param {com} data
 */
export function getPointTrend(data) {
  return request({
    url: 'marketing/point/get_trend',
    method: 'get',
    params: data,
  });
}

/**
 * @description 积分来源分析
 * @param {Object} param data {Object} 传值参数
 */
export function getChannel(params) {
  return request({
    url: '/marketing/point/get_channel',
    method: 'get',
    params,
  });
}
/**
 * @description 积分消耗分析
 * @param {Object} param data {Object} 传值参数
 */
export function getType(params) {
  return request({
    url: '/marketing/point/get_type',
    method: 'get',
    params,
  });
}

/**
 * 秒杀统计
 * @param {*} id
 * @param {*} params
 * @returns
 */
export function getseckillStatistics(id, params) {
  return request({
    url: `marketing/seckill/statistics/head/${id}`,
    method: 'get',
    params,
  });
}

/**
 * 秒杀参与人
 * @param {*} id
 * @param {*} params
 * @returns
 */
export function getseckillStatisticsPeople(id, params) {
  return request({
    url: `marketing/seckill/statistics/people/${id}`,
    method: 'get',
    params,
  });
}

/**
 * 秒杀订单
 * @param {*} id
 * @param {*} params
 * @returns
 */
export function getseckillStatisticsOrder(id, params) {
  return request({
    url: `marketing/seckill/statistics/order/${id}`,
    method: 'get',
    params,
  });
}

/**
 * 拼团统计
 * @param {*} id
 * @param {*} params
 * @returns
 */
export function getcombinationStatistics(id, params) {
  return request({
    url: `marketing/combination/statistics/head/${id}`,
    method: 'get',
    params,
  });
}

/**
 * 拼团列表
 * @param {*} id
 * @param {*} params
 * @returns
 */
export function getcombinationStatisticsPeople(id, params) {
  return request({
    url: `marketing/combination/statistics/list/${id}`,
    method: 'get',
    params,
  });
}

/**
 * 拼团订单
 * @param {*} id
 * @param {*} params
 * @returns
 */
export function getcombinationStatisticsOrder(id, params) {
  return request({
    url: `marketing/combination/statistics/order/${id}`,
    method: 'get',
    params,
  });
}

/**
 * 砍价统计
 * @param {*} id
 * @param {*} params
 * @returns
 */
export function getbargainStatistics(id, params) {
  return request({
    url: `marketing/bargain/statistics/head/${id}`,
    method: 'get',
    params,
  });
}

/**
 * 砍价列表
 * @param {*} id
 * @param {*} params
 * @returns
 */
export function getbargainStatisticsPeople(id, params) {
  return request({
    url: `marketing/bargain/statistics/list/${id}`,
    method: 'get',
    params,
  });
}

/**
 * 砍价订单
 * @param {*} id
 * @param {*} params
 * @returns
 */
export function getbargainStatisticsOrder(id, params) {
  return request({
    url: `marketing/bargain/statistics/order/${id}`,
    method: 'get',
    params,
  });
}
/**
 * 签到奖励列表
 * @param {com} data
 */
export function signRewards(data) {
  return request({
    url: 'marketing/sign/rewards',
    method: 'get',
    params: data,
  });
}
/**
 * 新增签到奖励
 * @param {com} data
 */
export function addSignRewards(data) {
  return request({
    url: 'marketing/sign/add_rewards',
    method: 'get',
    params: data,
  });
}
/**
 * 编辑签到奖励
 */
export function editSignRewards(id) {
  return request({
    url: 'marketing/sign/edit_rewards/' + id,
    method: 'get',
  });
}

/**
 * 编辑新人礼
 */
export function editNewbie(data) {
  return request({
    url: 'user/new_gift/save',
    method: 'post',
    data,
  });
}
/**
 * 编辑新人礼
 */
export function getNewbie(data) {
  return request({
    url: 'user/new_gift',
    method: 'get',
  });
}

/**
 * 拼团立即成团
 */
export function combineJoinApi(id) {
  return request({
    url: 'marketing/combination/immediately/' + id,
    method: 'get',
  });
}
