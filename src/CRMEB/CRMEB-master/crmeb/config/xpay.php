<?php

use think\facade\Env;

return [
    // Keep disabled until the virtual-payment merchant account and membership entitlement are approved.
    'enabled' => Env::get('xpay.enabled', false),
    // 1 = sandbox, 0 = production. Development should always start in sandbox.
    'env' => (int)Env::get('xpay.env', 1),
    'offer_id' => Env::get('xpay.offer_id', ''),
    'app_keys' => [
        0 => Env::get('xpay.production_app_key', ''),
        1 => Env::get('xpay.sandbox_app_key', ''),
    ],
    // The membership entitlement product id published in MP -> Virtual Payment.
    'training_camp_product_id' => Env::get('xpay.training_camp_product_id', ''),
];
