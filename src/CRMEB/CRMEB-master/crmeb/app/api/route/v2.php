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
use app\api\middleware\BlockerMiddleware;
use think\facade\Route;

/**
 * v1.1 版本路由
 */
Route::group('v2', function () {
    //无需授权接口
    Route::group(function () {
        Route::group(function () {
            //小程序登录页面自动加载，返回用户信息的缓存key，返回是否强制绑定手机号
            Route::get('routine/auth_type', 'v2.wechat.AuthController/authType')->option(['real_name' => '小程序页面登录类型']);
            //小程序授权登录，返回token
            Route::get('routine/auth_login', 'v2.wechat.AuthController/authLogin')->option(['real_name' => '小程序授权登录']);
            //小程序授权绑定手机号
            Route::post('routine/auth_binding_phone', 'v2.wechat.AuthController/authBindingPhone')->option(['real_name' => '小程序授权绑定手机号']);
            //小程序手机号直接登录
            Route::post('routine/phone_login', 'v2.wechat.AuthController/phoneLogin')->option(['real_name' => '手机号直接登录']);
            //小程序授权后绑定手机号
            Route::post('routine/binding_phone', 'v2.wechat.AuthController/BindingPhone')->option(['real_name' => '小程序授权后绑定手机号']);

            //公众号授权登录，返回token
            Route::get('wechat/auth_login', 'v2.wechat.WechatController/authLogin')->option(['real_name' => '公众号授权登录']);
            //公众号授权绑定手机号
            Route::post('wechat/auth_binding_phone', 'v2.wechat.WechatController/authBindingPhone')->option(['real_name' => '小程序授权绑定手机号']);

        })->option(['mark' => 'wechat_auto', 'mark_name' => '微信授权']);

    });
    //需要授权
    Route::group(function () {

        Route::post('reset_cart', 'v2.store.StoreCartController/resetCart')->name('resetCart')->option(['real_name' => '清除购物车', 'mark' => 'cart', 'mark_name' => '购物车']);
        Route::get('cart_list', 'v2.store.StoreCartController/getCartList')->option(['real_name' => '获取购物车列表', 'mark' => 'cart', 'mark_name' => '购物车']);
        Route::get('get_attr/:id/:type', 'v2.store.StoreProductController/getProductAttr')->option(['real_name' => '获取商品规格', 'mark' => 'cart', 'mark_name' => '购物车']);
        Route::post('set_cart_num', 'v2.store.StoreCartController/setCartNum')->option(['real_name' => '获取购物车数量', 'mark' => 'cart', 'mark_name' => '购物车']);


        //清除搜索记录
        Route::get('user/clean_search', 'v2.user.UserSearchController/cleanUserSearch')->name('cleanUserSearch')->option(['real_name' => '清除搜索记录']);

        //获取分销等级列表
        Route::get('agent/level_list', 'v2.agent.AgentLevel/levelList')->name('agentLevelList')->option(['real_name' => '获取分销等级列表']);
        //获取分销等级任务列表
        Route::get('agent/level_task_list', 'v2.agent.AgentLevel/levelTaskList')->name('agentLevelTaskList')->option(['real_name' => '获取分销等级任务列表']);

    })->middleware(\app\api\middleware\AuthTokenMiddleware::class, true);

    //授权不通过,不会抛出异常继续执行
    Route::group(function () {
        Route::get('user/search_list', 'v2.user.UserSearchController/getUserSeachList')->name('userSearchList')->option(['real_name' => '用户搜索记录']);
        Route::get('subscribe', 'v2.PublicController/subscribe')->name('WechatSubscribe')->option(['real_name' => '微信公众号用户是否关注']);// 微信公众号用户是否关注
        Route::get('index', 'v2.PublicController/index')->name('index')->option(['real_name' => '首页']);//首页
        Route::get('diy/sign', 'v2.PublicController/getDiySign')->name('getDiySign')->option(['real_name' => '获取Diy签到']);
    })->middleware(\app\api\middleware\AuthTokenMiddleware::class, false)
        ->option(['mark' => 'common', 'mark_name' => '公共接口']);

})->middleware(\app\http\middleware\AllowOriginMiddleware::class)->middleware(\app\api\middleware\StationOpenMiddleware::class);
