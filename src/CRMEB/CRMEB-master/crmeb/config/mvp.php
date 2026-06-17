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
    'enable_customer_service' => false,
    'enable_cms' => false,
    'enable_app_admin' => false,
    'enable_page_diy' => false,
    'enable_complex_logistics' => false,
    'enable_invoice' => false,
    'enable_multi_terminal_diy' => false,
    'enable_distribution' => true,
    'enable_wechat_pay' => true,
    'enable_training_camp_product' => true,

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
        'enable_multi_terminal_diy' => [
            'theme',
            'micro_page',
            'theme_style',
            'my_theme',
            'mall_theme',
            'edit_theme',
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
        ],
        'enable_combination' => [
            'marketing/combination',
        ],
        'enable_seckill' => [
            'marketing/seckill',
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
        'enable_app_admin' => [
            'app/',
        ],
        'enable_page_diy' => [
            'diy/',
            'diy_pro/',
            'theme/',
            'theme_module/',
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
        'enable_page_diy' => [
            'diy/color_change',
        ],
    ],
];
