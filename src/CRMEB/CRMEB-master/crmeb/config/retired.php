<?php

return [
    // Database menu rows are intentionally not deleted. These fragments keep
    // retired entries out of every menu query until the data is cleaned later.
    'admin_menu_patterns' => [
        'store_coupon', 'coupon', 'store_bargain', 'bargain',
        'store_combination', 'combination', 'store_seckill', 'seckill',
        'presell', 'advance', 'store_integral', 'user_recharge',
        'recharge_config', 'finance/recharge', 'marketing/recharge',
        'user-user-recharge', 'finance-user-recharge', 'live/', 'live_',
        'live-room', 'live-goods', 'lottery', 'cms/', 'article',
        'special', 'news', 'kefu', 'customer_service', 'store_service',
        'speechcraft', 'feedback', 'auto_reply', 'app/', 'wechat/',
        'system_out_account', 'system_out_interface', 'pages', 'diy',
        'system_config_logistics', 'freight/', 'shipping_templates',
        'delivery_service', 'delivery-service', 'freight-express',
        'system-city', 'invoice', 'elec_invoice',
        'offline_payment', 'offline-pay', 'store_pickup', 'self_pick',
        'self-pick', 'verify_order', 'system_store', 'store-staff',
        'theme', 'micro_page', 'theme_style', 'my_theme', 'mall_theme',
        'edit_theme', 'ticket', 'division', 'agent-division',
        'product-product-get_template', 'product-product-get_temp_keys',
        'product-product-import_card',
        '/product', 'product/', 'product-', 'store_product', 'store-product',
        '/order', 'order/', 'order-', 'store_order', 'store-order',
        'refund/', 'refund-', 'store_refund', 'store-refund',
        '/marketing', 'marketing/', 'sign/', 'point/', 'integral',
        '/app', 'routine/ci', 'routine/download', 'routine/scheme',
        'wechat_qrcode', 'system/upgrade', 'system/crud',
        'system/file', 'file/', 'upload', 'video_upload', 'online_upload',
        '/education', 'education/', 'education-assessment', 'admin-education',
        'user-user-level', 'user-user-group', 'user-user-label',
        'admin-user-grade-card', 'admin-user-grade-record', 'admin-user-grade-right',
        '/user/level', '/user/group', '/user/label', '/user/grade/card',
        '/user/grade/record', '/user/grade/right',
    ],

    // Exact authenticated endpoints still required by retained admin features.
    // These paths pass through role checks and the original upload validation.
    'admin_api_allow_paths' => [
        'file/upload',
        'file/upload/1',
    ],

    // Reversible denylist for retired admin API surfaces. Removing a fragment
    // re-enables the endpoint without restoring deleted code.
    'admin_api_patterns' => [
        'marketing/',
        'app/wechat',
        'app/wechat_qrcode',
        'app/routine/download',
        'app/routine/ci',
        'app/routine/scheme',
        'file/',
        'system/file',
        'system/write_md5',
        'system/upgrade',
        'system/package_download',
        'system/upgrade_download',
        'system/upgrade_progress',
        'system/cross_version',
        'system/rollback',
        'system/crud',
        'system/clear/',
        'system/replace_site_url',
        'export/userPoint',
        'education/assessment_records',
    ],
];
