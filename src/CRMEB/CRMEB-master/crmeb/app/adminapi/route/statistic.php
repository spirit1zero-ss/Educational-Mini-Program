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

use think\facade\Route;

/**
 * 分销管理 相关路由
 */
Route::group('statistic', function () {

    /** 用户统计 */
    Route::group(function () {
        //用户基础
        Route::get('user/get_basic', 'v1.statistic.UserStatistic/getBasic')->option(['real_name' => '用户基础统计']);
        //用户增长趋势
        Route::get('user/get_trend', 'v1.statistic.UserStatistic/getTrend')->option(['real_name' => '用户增长趋势']);
        //微信用户
        Route::get('user/get_wechat', 'v1.statistic.UserStatistic/getWechat')->option(['real_name' => '微信用户统计']);
        //微信用户成长趋势
        Route::get('user/get_wechat_trend', 'v1.statistic.UserStatistic/getWechatTrend')->option(['real_name' => '微信用户成长趋势']);
        //用户地域排行
        Route::get('user/get_region', 'v1.statistic.UserStatistic/getRegion')->option(['real_name' => '用户地域排行']);
        //用户性别
        Route::get('user/get_sex', 'v1.statistic.UserStatistic/getSex')->option(['real_name' => '用户性别分布']);
        //商品数据导出
        Route::get('user/get_excel', 'v1.statistic.UserStatistic/getExcel')->option(['real_name' => '用户数据导出']);
    })->option(['parent' => 'statistic', 'cate_name' => '用户统计']);

    /** 资金流水 */
    Route::group(function () {
        Route::get('flow/get_list', 'v1.statistic.FlowStatistic/getFlowList')->option(['real_name' => '资金流水']);
        Route::post('flow/set_mark/:id', 'v1.statistic.FlowStatistic/setMark')->option(['real_name' => '设置备注']);
        Route::get('flow/get_record', 'v1.statistic.FlowStatistic/getFlowRecord')->option(['real_name' => '账单记录']);
    })->option(['parent' => 'statistic', 'cate_name' => '资金流水']);

    /** 余额统计 */
    Route::group(function () {
        //余额基础统计
        Route::get('balance/get_basic', 'v1.statistic.BalanceStatistic/getBasic')->option(['real_name' => '余额基础统计']);
        //余额趋势
        Route::get('balance/get_trend', 'v1.statistic.BalanceStatistic/getTrend')->option(['real_name' => '余额趋势']);
        //余额来源
        Route::get('balance/get_channel', 'v1.statistic.BalanceStatistic/getChannel')->option(['real_name' => '余额来源']);
        //余额消耗
        Route::get('balance/get_type', 'v1.statistic.BalanceStatistic/getType')->option(['real_name' => '余额消耗']);
    })->option(['parent' => 'statistic', 'cate_name' => '余额统计']);

})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'statistic', 'mark_name' => '程序统计']);
