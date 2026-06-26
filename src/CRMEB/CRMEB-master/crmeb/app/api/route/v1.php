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
use think\facade\Config;
use think\Response;

Route::group(function () {
    Route::any('wechat/serve', 'v1.wechat.WechatController/serve')->option(['real_name' => '公众号服务']);//公众号服务
    Route::any('wechat/miniServe', 'v1.wechat.WechatController/miniServe')->option(['real_name' => '小程序服务']);//公众号服务
    Route::any('pay/notify/:type', 'v1.PayController/notify')->option(['real_name' => '支付回调']);//支付回调
    Route::any('transfer/notify/:type', 'v1.PayController/transferNotify')->option(['real_name' => '商户转账回调']);//商户转账回调
    Route::any('order_call_back', 'v1.order.StoreOrderController/callBack')->option(['real_name' => '商家寄件回调']);//商家寄件回调
    Route::get('get_script', 'v1.PublicController/getScript')->option(['real_name' => '移动端自定义JS']);//移动端自定义JS
    Route::get('custom_pc_js', 'v1.PublicController/customPcJs')->option(['real_name' => 'PC端自定义JS']);//PC端自定义JS
    Route::get('version', 'v1.PublicController/getVersion')->option(['real_name' => '获取代码版本号']);
    Route::get('service_pay_result', 'v1.PublicController/servicePayResult')->option(['real_name' => '服务商支付商家小票接口']);
})->middleware(\app\http\middleware\AllowOriginMiddleware::class)->option(['mark' => 'serve', 'mark_name' => '服务接口']);

Route::group(function () {
    //apple快捷登陆
    Route::post('apple_login', 'v1.LoginController/appleLogin')->name('appleLogin')->option(['real_name' => '微信APP授权']);//微信APP授权
    //账号密码登录
    Route::post('login', 'v1.LoginController/login')->name('login')->option(['real_name' => '账号密码登录']);
    // 获取发短信的key
    Route::get('verify_code', 'v1.LoginController/verifyCode')->name('verifyCode')->option(['real_name' => '获取发短信的key']);
    //手机号登录
    Route::post('login/mobile', 'v1.LoginController/mobile')->name('loginMobile')->option(['real_name' => '手机号登录']);
    //图片验证码
    Route::get('sms_captcha', 'v1.LoginController/captcha')->name('captcha')->option(['real_name' => '图片验证码']);
    //图形验证码
    Route::get('ajcaptcha', 'v1.LoginController/ajcaptcha')->name('ajcaptcha')->option(['real_name' => '图形验证码']);
    //图形验证码验证
    Route::post('ajcheck', 'v1.LoginController/ajcheck')->name('ajcheck')->option(['real_name' => '图形验证码验证']);
    //手机验证码发送
    Route::post('register/verify', 'v1.LoginController/verify')->name('registerVerify')->option(['real_name' => '手机验证码发送']);
    //手机号注册
    Route::post('register', 'v1.LoginController/register')->name('register')->option(['real_name' => '手机号注册']);
    //手机号修改密码
    Route::post('register/reset', 'v1.LoginController/reset')->name('registerReset')->option(['real_name' => '手机号修改密码']);
    // 绑定手机号(静默授权 还未有用户信息)
    Route::post('binding', 'v1.LoginController/binding_phone')->name('bindingPhone')->option(['real_name' => '绑定手机号']);
    // 支付宝复制链接支付 弃用
//    Route::get('ali_pay', 'v1.order.StoreOrderController/aliPay')->name('aliPay');
    //查询版权
    Route::get('copyright', 'v1.PublicController/copyright')->option(['real_name' => '申请版权'])->option(['real_name' => '查询版权']);
    //商城基础配置汇总接口
    Route::get('basic_config', 'v1.PublicController/getMallBasicConfig')->option(['real_name' => '商城基础配置汇总接口']);
    //小程序跳转url接口
    Route::get('get_scheme_url/:id', 'v1.PublicController/getSchemeUrl')->option(['real_name' => '小程序跳转url接口']);
    //远程注册用户
    Route::get('remote_register', 'v1.LoginController/remoteRegister')->option(['real_name' => '远程注册用户']);

})->middleware(\app\http\middleware\AllowOriginMiddleware::class)
    ->middleware(\app\api\middleware\StationOpenMiddleware::class)
    ->option(['mark' => 'base', 'mark_name' => '基础接口']);


//移动端商家管理
Route::group(function () {

    // 商家管理首页
    // 商家管理商品管理
    // 商家管理用户管理


})->middleware(\app\http\middleware\AllowOriginMiddleware::class)
    ->middleware(\app\api\middleware\StationOpenMiddleware::class)
    ->middleware(\app\api\middleware\AuthTokenMiddleware::class, true)
    ->middleware(\app\api\middleware\CustomerMiddleware::class)
    ->option(['mark' => 'admin', 'mark_name' => '移动端订单管理']);;

//会员授权接口
Route::group(function () {
    Route::group(function () {
        //获取支付方式
        Route::get('pay/config', 'v1.PayController/config')->name('payConfig')->option(['real_name' => '获取支付方式']);
        //用户修改手机号
        Route::post('user/updatePhone', 'v1.LoginController/update_binding_phone')->name('updateBindingPhone')->option(['real_name' => '用户修改手机号']);
        //设置登录code
        //查看code是否可用
        Route::get('user/code', 'v1.LoginController/setLoginKey')->name('getLoginKey')->option(['real_name' => '查看code是否可用']);
        //用户绑定手机号
        Route::post('user/binding', 'v1.LoginController/user_binding_phone')->name('userBindingPhone')->option(['real_name' => '用户绑定手机号']);
        Route::get('logout', 'v1.LoginController/logout')->name('logout')->option(['real_name' => '退出登录']);// 退出登录
        Route::post('switch_h5', 'v1.LoginController/switch_h5')->name('switch_h5')->option(['real_name' => '切换账号']);// 切换账号
        //公共类
        Route::post('upload/image', 'v1.PublicController/upload_image')->name('uploadImage')->option(['real_name' => '图片上传']);//图片上传
        // 用户微信转账详情接口
        Route::get('transfer/info', 'v1.PublicController/getTransferInfo')->name('getTransferInfo')->option(['real_name' => '用户微信转账详情接口']);// 用户微信转账详情接口

    })->option(['mark' => 'common', 'mark_name' => '公共接口']);

    Route::group(function () {
        //用户类 客服聊天记录
    })->option(['parent' => 'user', 'cate_name' => '客服']);

    Route::group(function () {
        //用户类  用户coupons/order
        Route::get('user', 'v1.user.UserController/user')->name('user')->option(['real_name' => '个人中心']);//个人中心
        Route::post('user/spread', 'v1.user.UserController/spread')->name('userSpread')->option(['real_name' => '静默绑定授权']);//静默绑定授权
        Route::post('user/edit', 'v1.user.UserController/edit')->name('userEdit')->option(['real_name' => '用户修改信息']);//用户修改信息
        Route::get('userinfo', 'v1.user.UserController/userinfo')->name('userinfo')->option(['real_name' => '用户信息']);// 用户信息
    })->option(['parent' => 'user', 'cate_name' => '用户中心']);

    Route::group(function () {
        //用户类  地址
        Route::get('address/detail/:id', 'v1.user.UserAddressController/address')->name('address')->option(['real_name' => '获取单个地址']);//获取单个地址
        Route::get('address/list', 'v1.user.UserAddressController/address_list')->name('addressList')->option(['real_name' => '地址列表']);//地址列表
        Route::post('address/default/set', 'v1.user.UserAddressController/address_default_set')->name('addressDefaultSet')->option(['real_name' => '设置默认地址']);//设置默认地址
        Route::get('address/default', 'v1.user.UserAddressController/address_default')->name('addressDefault')->option(['real_name' => '获取默认地址']);//获取默认地址
        Route::post('address/edit', 'v1.user.UserAddressController/address_edit')->name('addressEdit')->option(['real_name' => '修改/添加地址']);//修改 添加 地址
        Route::post('address/del', 'v1.user.UserAddressController/address_del')->name('addressDel')->option(['real_name' => '删除地址']);//删除地址
    })->option(['parent' => 'user', 'cate_name' => '用户地址']);

    Route::group(function () { //用户类 收藏
    })->option(['parent' => 'user', 'cate_name' => '用户收藏']);

    Route::group(function () {
        Route::get('rank', 'v1.user.UserController/rank')->name('rank')->option(['real_name' => '公众号授权登录']);//推广人排行
        //用戶类 分享
    })->option(['parent' => 'user', 'cate_name' => '用户分享']);

    Route::group(function () {
        //用户类 签到
        Route::get('sign/config', 'v1.user.UserSignController/sign_config')->name('signConfig')->option(['real_name' => '签到配置']);//签到配置
        Route::get('sign/list', 'v1.user.UserSignController/sign_list')->name('signList')->option(['real_name' => '签到列表']);//签到列表
        Route::get('sign/month', 'v1.user.UserSignController/sign_month')->name('signIntegral')->option(['real_name' => '签到列表（年月）']);//签到列表（年月）
        Route::get('sign/remind/:status', 'v1.user.UserSignController/sign_remind')->name('signRemind')->option(['real_name' => '签到提醒开关']);//签到列表（年月）
        Route::post('sign/user', 'v1.user.UserSignController/sign_user')->name('signUser')->option(['real_name' => '签到用户信息']);//签到用户信息
        Route::post('sign/integral', 'v1.user.UserSignController/sign_integral')->name('signIntegral')->option(['real_name' => '公众号授权登录'])->middleware(BlockerMiddleware::class);//签到
    })->option(['mark' => 'sign', 'mark_name' => '签到']);

    Route::group(function () {
        //优惠券类
    })->option(['mark' => 'coupons', 'mark_name' => '优惠券']);

    Route::group(function () {
        //购物车类
        Route::get('cart/list', 'v1.store.StoreCartController/lst')->name('cartList')->option(['real_name' => '购物车列表']); //购物车列表
        Route::post('cart/add', 'v1.store.StoreCartController/add')->name('cartAdd')->option(['real_name' => '购物车添加']); //购物车添加
        Route::post('cart/del', 'v1.store.StoreCartController/del')->name('cartDel')->option(['real_name' => '购物车删除']); //购物车删除
        Route::post('order/cancel', 'v1.order.StoreOrderController/cancel')->name('orderCancel')->option(['real_name' => '订单取消']); //订单取消
        Route::post('cart/num', 'v1.store.StoreCartController/num')->name('cartNum')->option(['real_name' => '购物车修改商品数量']); //购物车 修改商品数量
        Route::get('cart/count', 'v1.store.StoreCartController/count')->name('cartCount')->option(['real_name' => '购物车数量']);
    })->option(['mark' => 'cart', 'mark_name' => '购物车']);

    Route::group(function () {
        Route::post('order/confirm', 'v1.order.StoreOrderController/confirm')->name('orderConfirm')->option(['real_name' => '订单确认']);
        Route::post('order/computed/:key', 'v1.order.StoreOrderController/computedOrder')->name('computedOrder')->option(['real_name' => '计算订单金额']);
        Route::post('order/create/:key', 'v1.order.StoreOrderController/create')->name('orderCreate')->middleware(BlockerMiddleware::class)->option(['real_name' => '订单创建']);
        Route::get('order/data', 'v1.order.StoreOrderController/data')->name('orderData')->option(['real_name' => '订单统计数据']);
        Route::get('order/list', 'v1.order.StoreOrderController/lst')->name('orderList')->option(['real_name' => '订单列表']);
        Route::get('order/detail/:uni/[:cartId]', 'v1.order.StoreOrderController/detail')->name('orderDetail')->option(['real_name' => '订单详情']);
        Route::get('order/refund_detail/:uni/[:cartId]', 'v1.order.StoreOrderController/refund_detail')->name('refundDetail')->option(['real_name' => '退款订单详情']);
        Route::get('order/refund/reason', 'v1.order.StoreOrderController/refund_reason')->name('orderRefundReason')->middleware(BlockerMiddleware::class)->option(['real_name' => '订单退款理由']);
        Route::post('order/refund/verify', 'v1.order.StoreOrderController/refund_verify')->name('orderRefundVerify')->middleware(BlockerMiddleware::class)->option(['real_name' => '订单退款审核']);
        Route::post('order/take', 'v1.order.StoreOrderController/take')->name('orderTake')->middleware(BlockerMiddleware::class)->option(['real_name' => '订单收货']);
        Route::get('order/express/:uni/[:type]', 'v1.order.StoreOrderController/express')->name('orderExpress')->option(['real_name' => '订单查看物流']);
        Route::post('order/del', 'v1.order.StoreOrderController/del')->name('orderDel')->option(['real_name' => '订单删除']);
        Route::post('order/again', 'v1.order.StoreOrderController/again')->name('orderAgain')->option(['real_name' => '再次下单']);
        Route::post('order/pay', 'v1.order.StoreOrderController/pay')->name('orderPay')->option(['real_name' => '订单支付']);
        Route::post('order/product', 'v1.order.StoreOrderController/product')->name('orderProduct')->option(['real_name' => '订单商品信息']);
        Route::get('order/cashier/:orderId/[:type]', 'v1.order.StoreOrderController/cashier')->name('orderCashier')->option(['real_name' => '订单收银台']);
    })->option(['mark' => 'order', 'mark_name' => '订单']);

    Route::group(function () {
        Route::post('spread/people', 'v1.user.UserController/spread_people')->name('spreadPeople')->option(['real_name' => '推荐用户']);
        Route::post('spread/order', 'v1.user.UserBillController/spread_order')->name('spreadOrder')->option(['real_name' => '推广订单']);
        Route::get('spread/commission/:type', 'v1.user.UserBillController/spread_commission')->name('spreadCommission')->option(['real_name' => '推广佣金明细']);
        Route::get('spread/count/:type', 'v1.user.UserBillController/spread_count')->name('spreadCount')->option(['real_name' => '推广佣金']);
        Route::get('integral/list', 'v1.user.UserBillController/integral_list')->name('integralList')->option(['real_name' => '积分记录']);
    })->option(['mark' => 'spread_bill', 'mark_name' => '分销账单']);

    Route::group(function () {
        Route::get('user/level/detection', 'v1.user.UserLevelController/detection')->name('userLevelDetection')->option(['real_name' => '检测用户等级']);
        Route::get('user/level/grade', 'v1.user.UserLevelController/grade')->name('userLevelGrade')->option(['real_name' => '用户等级列表']);
        Route::get('user/level/task/:id', 'v1.user.UserLevelController/task')->name('userLevelTask')->option(['real_name' => '获取等级任务']);
        Route::get('user/level/info', 'v1.user.UserLevelController/userLevelInfo')->name('levelInfo')->option(['real_name' => '获取用户等级']);
        Route::get('user/level/expList', 'v1.user.UserLevelController/expList')->name('expList')->option(['real_name' => '获取经验记录']);
    })->option(['mark' => 'user_level', 'mark_name' => '用户等级']);

    Route::group(function () {
        Route::get('user/member/card/index', 'v1.user.MemberCardController/index')->name('userMemberCardIndex')->option(['real_name' => '会员权益介绍']);
        Route::post('user/member/card/draw', 'v1.user.MemberCardController/draw_member_card')->name('userMemberCardDraw')->option(['real_name' => '卡密领取会员']);
        Route::post('user/member/card/create', 'v1.order.OtherOrderController/create')->name('userMemberCardCreate')->option(['real_name' => '购买会员创建订单']);
        Route::get('user/member/overdue/time', 'v1.user.MemberCardController/getOverdueTime')->name('userMemberOverdueTime')->option(['real_name' => '会员有效期']);
    })->option(['mark' => 'member_card', 'mark_name' => '会员']);

    Route::group(function () {
        Route::get('order/refund/cart_info/:id', 'v1.order.StoreOrderController/refundCartInfo')->name('refundCartInfo')->option(['real_name' => '退款商品信息']);
        Route::post('order/refund/cart_info', 'v1.order.StoreOrderController/refundCartInfoList')->name('StoreOrderRefundCartInfoList')->option(['real_name' => '退款商品列表']);
        Route::post('order/refund/apply/:id', 'v1.order.StoreOrderController/applyRefund')->name('StoreOrderApplyRefund')->option(['real_name' => '申请退款']);
        Route::get('order/refund/list', 'v1.order.StoreOrderRefundController/refundList')->name('refundList')->option(['real_name' => '退款单列表']);
        Route::get('order/refund/detail/:uni', 'v1.order.StoreOrderRefundController/refundDetail')->name('refundOrderDetail')->option(['real_name' => '退款单详情']);
        Route::post('order/refund/cancel/:uni', 'v1.order.StoreOrderRefundController/cancelApply')->name('cancelApply')->option(['real_name' => '取消退款申请']);
        Route::post('order/refund/express', 'v1.order.StoreOrderRefundController/applyExpress')->name('refundExpress')->option(['real_name' => '填写退货物流']);
        Route::get('order/refund/del/:uni', 'v1.order.StoreOrderRefundController/delRefund')->name('delRefund')->option(['real_name' => '删除退款单']);
    })->option(['mark' => 'refund', 'mark_name' => '售后']);

    Route::group(function () {
        /** 佣金相关 */
        Route::get('commission', 'v1.user.UserBrokerageController/commission')->name('commission')->option(['real_name' => '推广数据']);//推广数据 昨天的佣金 累计提现金额 当前佣金
        Route::get('brokerage_rank', 'v1.user.UserBrokerageController/brokerageRank')->name('brokerageRank')->option(['real_name' => '佣金排行']);//佣金排行
        /** 用户注销 */
        /** 用户浏览记录 */
    })->option(['mark' => 'user', 'mark_name' => '用户']);

    Route::group(function () {
        Route::post('education/assessment_records', 'v1.education.AssessmentRecordController/save')->name('educationAssessmentRecordSave')->option(['real_name' => '提交测评记录']);
    })->option(['mark' => 'education', 'mark_name' => '教育模块']);

    Route::group(function () {
        /** 分销员申请 */
        Route::get('user/spread/apply/info', 'v1.user.SpreadApplyController/applyInfo')->name('申请信息');//申请信息
        Route::post('user/spread/apply/:id', 'v1.user.SpreadApplyController/applyPromoter')->name('申请分销员');//申请分销员
    })->option(['mark' => 'spread', 'mark_name' => '分销员申请']);

})->middleware(\app\http\middleware\AllowOriginMiddleware::class)->middleware(\app\api\middleware\StationOpenMiddleware::class)->middleware(\app\api\middleware\AuthTokenMiddleware::class, true);
//未授权接口
Route::group(function () {
    Route::group(function () {
        Route::get('menu/user', 'v1.PublicController/menu_user')->name('menuUser')->option(['real_name' => '个人中心菜单']);//个人中心菜单
        //公共类
        Route::get('index', 'v1.PublicController/index')->name('index')->option(['real_name' => '首页']);//首页
        Route::get('site_config', 'v1.PublicController/getSiteConfig')->name('getSiteConfig')->option(['real_name' => '获取网站配置']);//获取网站配置
        //DIY接口
        Route::get('home/products', 'v1.PublicController/home_products_list')->name('homeProductsList')->option(['real_name' => '获取首页推荐不同类型商品的轮播图和商品']);//获取首页推荐不同类型商品的轮播图和商品


    })->option(['mark' => 'index', 'mark_name' => '主页接口']);

    Route::group(function () {
        Route::get('search/keyword', 'v1.PublicController/search')->name('searchKeyword')->option(['real_name' => '热门搜索关键字获取']);//热门搜索关键字获取
        //商品分类类
        Route::get('category', 'v1.store.CategoryController/category')->name('category')->option(['real_name' => '商品分类类']);
        Route::get('category_version', 'v1.store.CategoryController/getCategoryVersion')->name('getCategoryVersion')->option(['real_name' => '商品分类类版本']);//商品分类类版本

        //商品类
        Route::post('image_base64', 'v1.PublicController/get_image_base64')->name('getImageBase64')->option(['real_name' => '获取图片base64']);// 获取图片base64
        Route::get('product/detail/:id/[:type]', 'v1.store.StoreProductController/detail')->name('detail')->option(['real_name' => '商品详情']);//商品详情
        Route::get('groom/list/:type', 'v1.store.StoreProductController/groom_list')->name('groomList')->option(['real_name' => '获取首页推荐不同类型商品的轮播图和商品']);//获取首页推荐不同类型商品的轮播图和商品
        Route::get('products', 'v1.store.StoreProductController/lst')->name('products')->option(['real_name' => '商品列表']);//商品列表
        Route::get('product/hot', 'v1.store.StoreProductController/product_hot')->name('productHot')->option(['real_name' => '为你推荐']);//为你推荐
        Route::get('reply/list/:id', 'v1.store.StoreProductController/reply_list')->name('replyList')->option(['real_name' => '商品评价列表']);//商品评价列表
        Route::get('reply/config/:id', 'v1.store.StoreProductController/reply_config')->name('replyConfig')->option(['real_name' => '商品评价数量和好评度']);//商品评价数量和好评度
        Route::get('product/code/:id', 'v1.store.StoreProductController/code')->name('productCode')->option(['real_name' => '商品分享二维码']);//商品分享二维码 推广员
        Route::get('product/real_price/:id/:unique', 'v1.store.StoreProductController/realPrice')->name('realPrice')->option(['real_name' => '商品到手价']);//商品到手价
    })->option(['mark' => 'product', 'mark_name' => '商品']);

    Route::group(function () {

        Route::group(function () {
            //文章分类类
            //文章类
        })->option(['parent' => 'activity_nologin', 'cate_name' => '文章(未授权)']);

        Route::group(function () {
            //活动---秒杀
        })->option(['parent' => 'activity_nologin', 'cate_name' => '秒杀(未授权)']);

        Route::group(function () {
            //活动---砍价
        })->option(['parent' => 'activity_nologin', 'cate_name' => '砍价(未授权)']);

        Route::group(function () {
            //活动---拼团
        })->option(['parent' => 'activity_nologin', 'cate_name' => '拼团(未授权)']);

        //活动-预售

        //用户类
        Route::get('user/activity', 'v1.user.UserController/activity')->name('userActivity')->option(['real_name' => '活动状态']);//活动状态

    })->option(['mark' => 'activity_nologin', 'mark_name' => '活动']);

    Route::group(function () {
        //微信
        Route::get('wechat/config', 'v1.wechat.WechatController/config')->name('wechatConfig')->option(['real_name' => '微信 sdk 配置']);//微信 sdk 配置
        Route::get('wechat/auth', 'v1.wechat.WechatController/auth')->name('wechatAuth')->option(['real_name' => '微信授权']);//微信授权
        Route::post('wechat/app_auth', 'v1.wechat.WechatController/appAuth')->name('appAuth')->option(['real_name' => '微信APP授权']);//微信APP授权

    })->option(['mark' => 'wechat', 'mark_name' => '微信']);

    Route::group(function () {
        //小程序登陆
        Route::post('wechat/mp_auth', 'v1.wechat.AuthController/mp_auth')->name('mpAuth')->option(['real_name' => '小程序登陆']);//小程序登陆
        Route::get('wechat/get_logo', 'v1.wechat.AuthController/get_logo')->name('getLogo')->option(['real_name' => '小程序登陆授权展示logo']);//小程序登陆授权展示logo
        Route::get('wechat/temp_ids', 'v1.wechat.AuthController/temp_ids')->name('wechatTempIds')->option(['real_name' => '小程序订阅消息']);//小程序订阅消息
    })->option(['mark' => 'mini', 'mark_name' => '小程序']);

    Route::group(function () {
        //物流公司
        Route::get('logistics', 'v1.PublicController/logistics')->name('logistics')->option(['real_name' => '物流公司列表']);//物流公司列表

        //分享配置
        Route::get('share', 'v1.PublicController/share')->name('share')->option(['real_name' => '分享配置']);//分享配置

        //优惠券

        //短信购买异步通知
        Route::post('sms/pay/notify', 'v1.PublicController/sms_pay_notify')->name('smsPayNotify')->option(['real_name' => '短信购买异步通知']); //短信购买异步通知

        //获取关注微信公众号海报
        Route::get('wechat/follow', 'v1.wechat.WechatController/follow')->name('Follow')->option(['real_name' => '获取关注微信公众号海报']);
        //用户是否关注
        Route::get('subscribe', 'v1.user.UserController/subscribe')->name('Subscribe')->option(['real_name' => '用户是否关注']);
        //门店列表
        //获取城市列表
        Route::get('city_list', 'v1.PublicController/city_list')->name('cityList')->option(['real_name' => '获取城市列表']);
        //拼团数据
        //获取底部导航
        Route::get('navigation/[:template_name]', 'v1.PublicController/getNavigation')->name('getNavigation')->option(['real_name' => '获取底部导航']);
        //用户访问
        //复制口令接口
        Route::get('copy_words', 'v1.PublicController/copy_words')->name('copyWords')->option(['real_name' => '复制口令接口']);// 复制口令接口
        //获取网站配置
        Route::get('site_config', 'v1.PublicController/getSiteConfig')->name('getSiteConfig')->option(['real_name' => '获取网站配置']);//获取网站配置
    })->option(['mark' => 'setting', 'mark_name' => '商城配置']);

    Route::group(function () {
        //活动---积分商城

    })->option(['mark' => 'integral_nologin', 'mark_name' => '积分商城(未授权)']);

    Route::group(function () {
        //获取app最新版本
        Route::get('get_new_app/:platform', 'v1.PublicController/getNewAppVersion')->name('getNewAppVersion')->option(['real_name' => '获取app最新版本']);//获取app最新版本
        //获取客服类型
        //长链接设置
        //首页开屏广告
        //获取用户协议
        Route::get('user_agreement', 'v1.PublicController/getUserAgreement')->name('getUserAgreement')->option(['real_name' => '获取用户协议']);
        //获取协议
        Route::get('get_agreement/:type', 'v1.PublicController/getAgreement')->name('getAgreement')->option(['real_name' => '获取协议']);

    })->option(['mark' => 'other', 'mark_name' => '其他接口']);

    Route::group(function () {
        //获取多语言类型列表
        Route::get('get_lang_type_list', 'v1.PublicController/getLangTypeList')->name('getLangTypeList')->option(['real_name' => '获取多语言类型列表']);
        //获取当前语言json
        Route::get('get_lang_json', 'v1.PublicController/getLangJson')->name('getLangJson')->option(['real_name' => '获取当前语言json']);
        //获取当前后台设置的默认语言类型
        Route::get('get_default_lang_type', 'v1.PublicController/getDefaultLangType')->name('getLangJson')->option(['real_name' => '获取当前后台设置的默认语言类型']);
        //获取当前后台设置的默认语言类型
        Route::get('lang_version', 'v1.PublicController/getLangVersion')->name('getLangVersion')->option(['real_name' => '获取当前后台设置的默认语言类型']);
    })->option(['mark' => 'lang', 'mark_name' => '多语言']);

    Route::group(function () {
        /** 定时任务接口 */
        //定时任务调用接口
        Route::get('crontab/run', 'v1.CrontabController/crontabRun')->name('crontabRun')->option(['real_name' => '定时任务调用接口']);
        //检测定时任务接口
        Route::get('crontab/check', 'v1.CrontabController/crontabCheck')->name('crontabCheck')->option(['real_name' => '检测定时任务接口']);
        //未支付自动取消订单
        Route::get('crontab/order_cancel', 'v1.CrontabController/orderUnpaidCancel')->name('orderUnpaidCancel')->option(['real_name' => '未支付自动取消订单']);
        //拼团到期订单处理
        //自动解绑上级绑定
        Route::get('crontab/agent_unbind', 'v1.CrontabController/agentUnbind')->name('agentUnbind')->option(['real_name' => '自动解绑上级绑定']);
        //更新直播商品状态
        //更新直播间状态
        //自动收货
        Route::get('crontab/take_delivery', 'v1.CrontabController/autoTakeOrder')->name('autoTakeOrder')->option(['real_name' => '自动收货']);
        //查询预售到期商品自动下架
        //自动好评
        Route::get('crontab/product_replay', 'v1.CrontabController/autoComment')->name('autoComment')->option(['real_name' => '自动好评']);
        //清除昨日海报
        Route::get('crontab/clear_poster', 'v1.CrontabController/emptyYesterdayAttachment')->name('emptyYesterdayAttachment')->option(['real_name' => '清除昨日海报']);

    })->option(['mark' => 'crontab', 'mark_name' => '定时任务']);

})->middleware(\app\http\middleware\AllowOriginMiddleware::class)
    ->middleware(\app\api\middleware\StationOpenMiddleware::class)
    ->middleware(\app\api\middleware\AuthTokenMiddleware::class, false);

Route::miss(function () {
    if (app()->request->isOptions()) {
        $header = Config::get('cookie.header');
        unset($header['Access-Control-Allow-Credentials']);
        return Response::create('ok')->code(200)->header($header);
    } else
        return Response::create()->code(404);
});
