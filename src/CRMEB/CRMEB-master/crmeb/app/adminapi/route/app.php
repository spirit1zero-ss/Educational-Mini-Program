<?php

use think\facade\Route;

/**
 * Retained notification-template synchronization endpoints.
 * Legacy official-account content, channel-code and mini-program CI tooling
 * were removed together with their admin pages.
 */
Route::group('app', function () {
    Route::get('wechat/syncSubscribe', 'v1.application.wechat.WechatTemplate/syncSubscribe')
        ->name('wechatSyncSubscribe')
        ->option(['real_name' => '一键同步公众号模板消息']);
    Route::get('routine/syncSubscribe', 'v1.application.routine.RoutineTemplate/syncSubscribe')
        ->name('routineSyncSubscribe')
        ->option(['real_name' => '一键同步小程序订阅消息']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class,
])->option(['mark' => 'app', 'mark_name' => '消息模板']);
