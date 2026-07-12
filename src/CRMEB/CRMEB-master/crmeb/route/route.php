<?php

use think\facade\Route;
use think\Response;

/**
 * This project has no customer-facing Web/H5 application.
 *
 * Keep only the admin SPA entry here. Native mini-program APIs are registered
 * by the api application and all retired Web routes return an explicit 404.
 */
Route::miss(function () {
    $path = trim((string)request()->pathinfo(), '/');
    $firstSegment = strtolower(explode('/', $path)[0] ?? '');
    $adminPrefix = strtolower((string)config('app.admin_prefix', 'admin'));

    if ($firstSegment === $adminPrefix) {
        return view(
            app()->getRootPath() . 'public' . DS . config('app.admin_prefix', 'admin') . DS . 'index.html'
        );
    }

    return Response::create([
        'status' => 404,
        'msg' => 'Not Found',
    ], 'json')->code(404);
});
