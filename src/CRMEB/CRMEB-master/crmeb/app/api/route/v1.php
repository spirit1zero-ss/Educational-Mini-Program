<?php

use think\facade\Config;
use think\facade\Route;
use think\Response;

Route::group(function () {
    Route::any('pay/notify/:type', 'v1.PayController/notify')->option(['real_name' => 'payment notify']);
    Route::any('transfer/notify/:type', 'v1.PayController/transferNotify')->option(['real_name' => 'transfer notify']);
})->middleware(\app\http\middleware\AllowOriginMiddleware::class)
    ->option(['mark' => 'payment', 'mark_name' => 'Payment callbacks']);

Route::group(function () {
    Route::get('index', 'v1.PublicController/index')->name('index')->option(['real_name' => 'health index']);
    Route::get('site_config', 'v1.PublicController/getSiteConfig')->name('getSiteConfig')->option(['real_name' => 'site config']);
    Route::get('miniapp/training-camp/member-plans', 'v1.miniapp.MineController/memberPlans')->name('miniappTrainingCampMemberPlans')->option(['real_name' => 'Miniapp training camp member plans']);
    Route::get('miniapp/offline-locations', 'v1.PublicController/offlineLocations')->name('miniappOfflineLocations')->option(['real_name' => 'Miniapp offline locations']);
    Route::get('miniapp/agreements', 'v1.PublicController/miniappAgreements')->name('miniappAgreements')->option(['real_name' => 'Miniapp agreements']);
})->middleware(\app\http\middleware\AllowOriginMiddleware::class)
    ->middleware(\app\api\middleware\StationOpenMiddleware::class, false)
    ->option(['mark' => 'public', 'mark_name' => 'Public miniapp support']);

Route::group(function () {
    Route::post('miniapp/auth/login', 'v1.miniapp.AuthController/login')->name('miniappAuthLogin')->option(['real_name' => 'Miniapp login']);
})->middleware(\app\http\middleware\AllowOriginMiddleware::class)
    ->middleware(\app\api\middleware\StationOpenMiddleware::class, false)
    ->option(['mark' => 'miniapp_auth', 'mark_name' => 'Miniapp auth']);

Route::group(function () {
    Route::get('miniapp/mine/overview', 'v1.miniapp.MineController/overview')->name('miniappMineOverview')->option(['real_name' => 'Miniapp mine overview']);
    Route::post('miniapp/referral/poster', 'v1.miniapp.MineController/poster')->name('miniappReferralPoster')->option(['real_name' => 'Miniapp referral poster']);
    Route::post('miniapp/redeem-code/use', 'v1.miniapp.MineController/redeemCode')->name('miniappRedeemCodeUse')->option(['real_name' => 'Miniapp redeem code']);
    Route::post('miniapp/training-camp/member-order', 'v1.miniapp.MineController/createMemberOrder')->name('miniappTrainingCampMemberOrder')->option(['real_name' => 'Miniapp training camp member order']);
    Route::post('miniapp/training-camp/member-order/pay', 'v1.miniapp.MineController/payMemberOrder')->name('miniappTrainingCampMemberOrderPay')->option(['real_name' => 'Miniapp training camp member order pay']);
    Route::post('miniapp/training-camp/member-order/confirm', 'v1.miniapp.MineController/confirmMemberOrder')->name('miniappTrainingCampMemberOrderConfirm')->option(['real_name' => 'Miniapp training camp virtual payment confirmation']);
    Route::post('miniapp/training-camp/member-order/cancel', 'v1.miniapp.MineController/cancelMemberOrder')->name('miniappTrainingCampMemberOrderCancel')->option(['real_name' => 'Miniapp training camp member order cancel']);
    Route::get('miniapp/training-camp/registration', 'v1.miniapp.MineController/registration')->name('miniappTrainingCampRegistration')->option(['real_name' => 'Miniapp training camp registration']);
    Route::post('miniapp/training-camp/registration', 'v1.miniapp.MineController/saveRegistration')->name('miniappTrainingCampRegistrationSave')->option(['real_name' => 'Miniapp training camp registration save']);
    Route::get('miniapp/referral/invites', 'v1.miniapp.MineController/invites')->name('miniappReferralInvites')->option(['real_name' => 'Miniapp referral invites']);
    Route::get('miniapp/referral/income', 'v1.miniapp.MineController/income')->name('miniappReferralIncome')->option(['real_name' => 'Miniapp referral income']);
    Route::get('miniapp/referral/withdrawal', 'v1.miniapp.MineController/withdrawal')->name('miniappReferralWithdrawal')->option(['real_name' => 'Miniapp referral withdrawal overview']);
    Route::post('miniapp/referral/withdrawal', 'v1.miniapp.MineController/applyWithdrawal')->name('miniappReferralWithdrawalApply')->option(['real_name' => 'Miniapp referral withdrawal apply']);
    Route::get('miniapp/training-camp/orders', 'v1.miniapp.MineController/orders')->name('miniappTrainingCampOrders')->option(['real_name' => 'Miniapp training camp orders']);
})->middleware(\app\http\middleware\AllowOriginMiddleware::class)
    ->middleware(\app\api\middleware\StationOpenMiddleware::class)
    ->middleware(\app\api\middleware\AuthTokenMiddleware::class, true)
    ->option(['mark' => 'miniapp', 'mark_name' => 'Miniapp native']);

Route::miss(function () {
    if (app()->request->isOptions()) {
        $header = Config::get('cookie.header');
        unset($header['Access-Control-Allow-Credentials']);
        return Response::create('ok')->code(200)->header($header);
    }

    return Response::create()->code(404);
});
