<?php

return [
    'enable_coupon' => false,
    'enable_bargain' => false,
    'enable_combination' => false,
    'enable_seckill' => false,
    'enable_presell' => false,
    'enable_points' => false,
    'enable_recharge' => false,
    'enable_member_level' => true,
    'enable_live' => false,
    'enable_lottery' => false,
    'enable_activity_status' => false,
    'enable_customer_service' => false,
    'enable_cms' => false,
    'enable_app_admin' => false,
    'enable_page_diy' => false,
    'enable_complex_logistics' => false,
    'enable_invoice' => false,
    'enable_offline_payment' => false,
    'enable_store_pickup' => false,
    'enable_optional_user_features' => false,
    'enable_multi_terminal_diy' => false,
    'enable_receipt_printer' => false,
    'enable_distribution' => true,
    'enable_advanced_distribution' => false,
    'enable_wechat_pay' => true,
    'enable_training_camp_product' => true,
    'enable_product_extras' => false,

    'admin_menu_hidden_patterns' => [
        'enable_coupon' => [
            'store_coupon',
            'coupon',
        ],
        'enable_bargain' => [
            'store_bargain',
            'bargain',
        ],
        'enable_combination' => [
            'store_combination',
            'combination',
        ],
        'enable_seckill' => [
            'store_seckill',
            'seckill',
        ],
        'enable_presell' => [
            'presell',
            'advance',
        ],
        'enable_points' => [
            'store_integral',
        ],
        'enable_recharge' => [
            'user_recharge',
            'recharge_config',
            'finance/recharge',
            'marketing/recharge',
            'user-user-recharge',
            'finance-user-recharge',
        ],
        'enable_member_level' => [],
        'enable_live' => [
            'live/',
            'live_',
            'live-room',
            'live-goods',
        ],
        'enable_lottery' => [
            'lottery',
        ],
        'enable_cms' => [
            'cms/',
            'article',
            'special',
            'news',
        ],
        'enable_customer_service' => [
            'kefu',
            'customer_service',
            'store_service',
            'speechcraft',
            'feedback',
            'auto_reply',
        ],
        'enable_app_admin' => [
            'app/',
            'wechat/',
            'system_out_account',
            'system_out_interface',
        ],
        'enable_page_diy' => [
            'pages',
            'diy',
        ],
        'enable_complex_logistics' => [
            'system_config_logistics',
            'freight/',
            'shipping_templates',
            'delivery_service',
            'delivery-service',
            'freight-express',
            'system-city',
        ],
        'enable_invoice' => [
            'invoice',
            'elec_invoice',
        ],
        'enable_offline_payment' => [
            'offline',
            'offline_payment',
            'offline-pay',
        ],
        'enable_store_pickup' => [
            'store_pickup',
            'self_pick',
            'self-pick',
            'verify_order',
            'system_store',
            'store-staff',
        ],
        'enable_multi_terminal_diy' => [
            'theme',
            'micro_page',
            'theme_style',
            'my_theme',
            'mall_theme',
            'edit_theme',
        ],
        'enable_receipt_printer' => [
            'ticket',
        ],
        'enable_advanced_distribution' => [
            'division',
            'agent-division',
        ],
        'enable_product_extras' => [
            'product-crawl',
            'product-copy',
            'product-copy_config',
            'product-product-get_template',
            'product-product-get_temp_keys',
            'product-product-import_card',
        ],
    ],

    'admin_route_allow_patterns' => [
        'marketing/sign',
        'marketing/integral$',
        'marketing/integral/statistics$',
        'marketing/integral_config',
        'marketing/point_record',
        'marketing/point/',
        'member_config',
    ],

    'admin_route_block_patterns' => [
        'enable_coupon' => [
            'marketing/coupon',
        ],
        'enable_bargain' => [
            'marketing/bargain',
            'export/bargain_list',
        ],
        'enable_combination' => [
            'marketing/combination',
            'export/combination_list',
        ],
        'enable_seckill' => [
            'marketing/seckill',
            'export/seckill_list',
        ],
        'enable_presell' => [
            'marketing/presell',
        ],
        'enable_points' => [
            'marketing/integral_product',
            'marketing/integral/',
            'marketing/integral/order',
        ],
        'enable_recharge' => [
            'marketing/recharge',
            'finance/recharge',
            'export/userRecharge',
        ],
        'enable_live' => [
            'live/',
        ],
        'enable_lottery' => [
            'marketing/lottery',
        ],
        'enable_cms' => [
            'cms/',
        ],
        'enable_customer_service' => [
            'get_workerman_url',
            'app/feedback',
            'app/wechat/speechcraft',
            'app/wechat/speechcraftcate',
            'app/wechat/kefu',
            'app/kefu/auto_reply',
        ],
        'enable_app_admin' => [
            'app/',
            'setting/system_out_account',
            'setting/system_out_interface',
        ],
        'enable_page_diy' => [
            'diy/',
            'diy_pro/',
            'theme/',
            'theme_module/',
        ],
        'enable_invoice' => [
            'setting/elec_invoice',
            'order/invoice',
            'order/invoice_order_info',
            'order/invoice_issuance_url',
            'order/save_invoice_info',
            'order/invoice_category',
            'order/invoice_issuance',
            'order/invoice_info',
            'order/red_invoice_issuance',
            'order/down_invoice',
            'order/elec_invoice_config',
        ],
        'enable_offline_payment' => [
            'order/pay_offline',
            'order/offline_scan',
            'order/scan_list',
        ],
        'enable_store_pickup' => [
            'merchant/store',
            'merchant/store_staff',
            'merchant/verify',
            'export/verify_order',
        ],
        'enable_optional_user_features' => [
            'export/userFinance',
            'user/cancel_list',
            'user/cancel/',
            'user/new_gift',
        ],
        'enable_complex_logistics' => [
            'freight/',
            'setting/city/',
            'setting/shipping_templates',
        ],
        'enable_receipt_printer' => [
            'system/ticket',
        ],
        'enable_advanced_distribution' => [
            'agent/division',
        ],
        'enable_product_extras' => [
            'product/product/get_template',
            'product/product/get_temp_keys',
            'product/product/import_card',
        ],
    ],

    'api_route_allow_patterns' => [
        'pay/notify',
        'order/create',
        'order/pay',
        'order/detail',
        'order/list',
        'order/take',
        'product/detail',
        'products',
        'sign/',
        'integral/list',
        'user/member/',
        'user/level/',
        'commission',
        'spread/',
        'education/assessment_records',
        'diy/sign',
    ],

    'api_route_force_block_patterns' => [
        'enable_app_admin' => [
            'admin/',
        ],
        'enable_advanced_distribution' => [
            'agent/',
            'v2/agent/',
        ],
    ],

    'api_route_block_patterns' => [
        'enable_coupon' => [
            'coupon/',
            'coupons',
            'new_coupon',
            'get_today_coupon',
            'order/product_coupon',
            'theme/coupon',
        ],
        'enable_bargain' => [
            'bargain/',
        ],
        'enable_combination' => [
            'combination/',
        ],
        'enable_seckill' => [
            'seckill/',
        ],
        'enable_presell' => [
            'advance/',
        ],
        'enable_points' => [
            'store_integral/',
        ],
        'enable_recharge' => [
            'recharge/',
        ],
        'enable_live' => [
            'wechat/live',
        ],
        'enable_lottery' => [
            'lottery',
        ],
        'enable_activity_status' => [
            'user/activity',
            'product/product/check_activity',
        ],
        'enable_cms' => [
            'article/',
            'theme/article',
            'get_news_',
        ],
        'enable_customer_service' => [
            'user/service/',
            'get_customer_type',
            'get_workerman_url',
        ],
        'enable_invoice' => [
            'invoice',
            'order/invoice',
            'order/make_up_invoice',
            'order/down_invoice',
        ],
        'enable_complex_logistics' => [
            'order/order_verific',
        ],
        'enable_offline_payment' => [
            'order/offline/',
        ],
        'enable_store_pickup' => [
            'store_list',
        ],
        'enable_optional_user_features' => [
            'collect/',
            'get_collect_list',
            'get_balance_record',
            'user/visit',
            'user/set_visit',
            'user/share',
            'user/message_system',
            'user_cancel',
            'order/friend_detail',
            'order/receive_gift',
            'order/gift_detail',
            'user/balance',
        ],
        'enable_advanced_distribution' => [
            'division/order',
        ],
        'enable_page_diy' => [
            'diy/color_change',
            'diy/get_diy',
            'diy/get_version',
            'diy/get_store_status',
        ],
    ],

    'kefuapi_route_block_patterns' => [
        'enable_customer_service' => [
            'login$',
            'key$',
            'scan/',
            'config$',
            'wechat$',
            'upload$',
            'user/',
            'order/',
            'product/',
            'service/',
            'tourist/',
        ],
    ],
];
