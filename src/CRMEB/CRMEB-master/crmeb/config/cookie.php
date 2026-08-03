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
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006~2018 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: liu21st <liu21st@gmail.com>
// +----------------------------------------------------------------------

// +----------------------------------------------------------------------
// | Cookie设置
// +----------------------------------------------------------------------

use think\facade\Env;

$corsAllowedOrigins = array_values(array_filter(array_map('trim', explode(',', (string)Env::get('cors.allowed_origins', '')))));

return [
    // cookie 保存时间
    'expire'    => 0,
    // cookie 保存路径
    'path'      => '/',
    // cookie 有效域名
    'domain'    => '',
    // cookie 启用安全传输
    'secure'    => filter_var(Env::get('cookie.secure', false), FILTER_VALIDATE_BOOLEAN),
    // httponly设置
    'httponly'  => filter_var(Env::get('cookie.httponly', false), FILTER_VALIDATE_BOOLEAN),
    // 是否使用 setcookie
    'setcookie' => true,
    // 浏览器跨域白名单，多个完整 Origin 使用英文逗号分隔
    'cors_allowed_origins' => $corsAllowedOrigins,
    // 跨域header；Origin 和 Credentials 仅在来源通过校验后动态添加
    'header'    => [
        'Access-Control-Allow-Headers'      => 'Authori-zation,Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-Requested-With, Form-type, Cb-lang, Invalid-zation',
        'Access-Control-Allow-Methods'      => 'GET,POST,PATCH,PUT,DELETE,OPTIONS,DELETE',
        'Access-Control-Max-Age'            => '1728000',
    ],
    // token名称
    'token_name' => 'Authori-zation',
];
