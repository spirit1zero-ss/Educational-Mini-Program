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
 * 导出excel相关路由
 */
Route::group('export', function () {
    //用户列表
    Route::get('user_list', 'v1.export.ExportExcel/userList')->option(['real_name' => '用户列表导出']);
    //订单列表
    Route::get('order_list', 'v1.export.ExportExcel/orderList')->middleware(\app\adminapi\middleware\ProductChainMiddleware::class)->option(['real_name' => '订单列表导出']);
    //发货订单列表
    Route::get('order_delivery_list', 'v1.export.ExportExcel/orderDeliveryList')->middleware(\app\adminapi\middleware\ProductChainMiddleware::class)->option(['real_name' => '发货订单列表导出']);
    //商品列表
    Route::get('product_list', 'v1.export.ExportExcel/productList')->middleware(\app\adminapi\middleware\ProductChainMiddleware::class)->option(['real_name' => '商品列表导出']);
    //砍价列表
    //拼团列表
    //秒杀列表
    //导出会员卡
    Route::get('member_card/:id', 'v1.export.ExportExcel/memberCardList')->option(['real_name' => '会员卡导出']);
    //分销用户推广列表
    Route::get('userAgent', 'v1.export.ExportExcel/userAgent')->option(['real_name' => '分销员推广列表导出']);
    //用户资金监控
    Route::get('userFinance', 'v1.export.ExportExcel/userFinance')->option(['real_name' => '用户资金导出']);
    //用户佣金
    Route::get('userCommission', 'v1.export.ExportExcel/userCommission')->option(['real_name' => '用户佣金导出']);
    //用户积分
    Route::get('userPoint', 'v1.export.ExportExcel/userPoint')->option(['real_name' => '用户积分导出']);
    //用户充值
    //核销订单
    Route::get('verify_order', 'v1.export.ExportExcel/verifyOrder')->middleware(\app\adminapi\middleware\ProductChainMiddleware::class)->option(['real_name' => '核销订单']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\RetiredAdminApiMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'export', 'mark_name' => '数据导出']);
