<?php

use think\facade\Route;

Route::group('export', function () {
    Route::get('user_list', 'v1.export.ExportExcel/userList')->option(['real_name' => '用户列表导出']);
    Route::get('member_card/:id', 'v1.export.ExportExcel/memberCardList')->option(['real_name' => '会员卡导出']);
    Route::get('userAgent', 'v1.export.ExportExcel/userAgent')->option(['real_name' => '分销员推广列表导出']);
    Route::get('userFinance', 'v1.export.ExportExcel/userFinance')->option(['real_name' => '用户资金导出']);
    Route::get('userCommission', 'v1.export.ExportExcel/userCommission')->option(['real_name' => '用户佣金导出']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class,
])->option(['mark' => 'export', 'mark_name' => '数据导出']);
