<?php

use think\facade\Route;

Route::group('marketing', function () {
    Route::group(function () {
        Route::get('integral', 'v1.marketing.UserPoint/index')->option(['real_name' => '积分日志列表']);
        Route::get('integral/statistics', 'v1.marketing.UserPoint/integral_statistics')->option(['real_name' => '积分日志统计']);
        Route::get('integral_config/edit_basics', 'v1.setting.SystemConfig/edit_basics')->option(['real_name' => '积分配置']);
        Route::post('integral_config/save_basics', 'v1.setting.SystemConfig/save_basics')->option(['real_name' => '保存积分配置']);
        Route::get('point_record', 'v1.marketing.integral.StorePointRecord/pointRecord')->option(['real_name' => '积分记录']);
        Route::post('point_record/remark/:id', 'v1.marketing.integral.StorePointRecord/pointRecordRemark')->option(['real_name' => '积分记录备注']);
        Route::get('point/get_basic', 'v1.marketing.integral.StorePointRecord/getBasic')->option(['real_name' => '积分统计']);
        Route::get('point/get_trend', 'v1.marketing.integral.StorePointRecord/getTrend')->option(['real_name' => '积分趋势']);
        Route::get('point/get_channel', 'v1.marketing.integral.StorePointRecord/getChannel')->option(['real_name' => '积分来源']);
        Route::get('point/get_type', 'v1.marketing.integral.StorePointRecord/getType')->option(['real_name' => '积分消耗']);
    })->option(['parent' => 'marketing', 'cate_name' => '积分与签到']);

    Route::group(function () {
        Route::get('sign/rewards', 'v1.marketing.SignRewards/index')->option(['real_name' => '签到奖励']);
        Route::get('sign/add_rewards', 'v1.marketing.SignRewards/addRewards')->option(['real_name' => '添加签到奖励']);
        Route::get('sign/edit_rewards/:id', 'v1.marketing.SignRewards/editRewards')->option(['real_name' => '编辑签到奖励']);
        Route::post('sign/save_rewards/:id', 'v1.marketing.SignRewards/saveRewards')->option(['real_name' => '保存签到奖励']);
        Route::delete('sign/del_rewards/:id', 'v1.marketing.SignRewards/delRewards')->option(['real_name' => '删除签到奖励']);
    })->option(['parent' => 'marketing', 'cate_name' => '每日签到']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class,
])->option(['mark' => 'marketing', 'mark_name' => '积分与签到']);
