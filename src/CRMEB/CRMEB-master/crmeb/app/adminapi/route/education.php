<?php

use think\facade\Route;

Route::group('education', function () {
    Route::group(function () {
        Route::get('assessment_records', 'v1.education.AssessmentRecord/index')->option(['real_name' => '测评记录列表']);
        Route::get('assessment_records/:id', 'v1.education.AssessmentRecord/read')->option(['real_name' => '测评记录详情']);
    })->option(['parent' => 'education', 'cate_name' => '测评记录']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'education', 'mark_name' => '教育模块']);
