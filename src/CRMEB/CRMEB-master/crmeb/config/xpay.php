<?php

use think\facade\Env;

return [
    // Keep disabled until the virtual-payment merchant account and membership entitlement are approved.
    'enabled' => Env::get('xpay.enabled', false),
    // 0 = production, 1 = sandbox. Sandbox must now be selected explicitly.
    'env' => (int)Env::get('xpay.env', 0),
    'offer_id' => Env::get('xpay.offer_id', ''),
    'app_keys' => [
        0 => Env::get('xpay.production_app_key', ''),
        1 => Env::get('xpay.sandbox_app_key', ''),
    ],
    // The membership entitlement product id published in MP -> Virtual Payment.
    'training_camp_product_id' => Env::get('xpay.training_camp_product_id', ''),
];
