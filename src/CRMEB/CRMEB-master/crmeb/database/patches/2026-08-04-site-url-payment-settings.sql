-- Expose the public callback base URL in the existing WeChat Pay settings form.
-- The current value is preserved. Safe to run repeatedly.

USE `crmeb`;

INSERT INTO `eb_system_config`
(`menu_name`,`type`,`input_type`,`config_tab_id`,`parameter`,`upload_type`,`required`,`width`,`high`,`value`,`info`,`desc`,`sort`,`status`,`level`,`link_id`,`link_value`)
SELECT
    'site_url','text','input',4,'',1,'required:true,url:true',100,0,'""',
    '站点回调地址',
    '填写云托管服务的公网 HTTPS 根地址，不要带 /admin。用于微信支付和商家转账回调；云环境变量 PHP_SITE_URL 已配置时优先使用环境变量。',
    110,1,0,0,0
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `eb_system_config` WHERE `menu_name` = 'site_url'
);

UPDATE `eb_system_config`
SET `type` = 'text',
    `input_type` = 'input',
    `config_tab_id` = 4,
    `parameter` = '',
    `upload_type` = 1,
    `required` = 'required:true,url:true',
    `width` = 100,
    `info` = '站点回调地址',
    `desc` = '填写云托管服务的公网 HTTPS 根地址，不要带 /admin。用于微信支付和商家转账回调；云环境变量 PHP_SITE_URL 已配置时优先使用环境变量。',
    `sort` = 110,
    `status` = 1
WHERE `menu_name` = 'site_url';

UPDATE `eb_system_config_tab`
SET `pid` = 23,
    `title` = '微信支付配置',
    `status` = 1
WHERE `id` = 4;
