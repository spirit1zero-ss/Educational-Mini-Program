-- Repair an already-imported 2026-07-31 environment where the payment menu
-- appears but the form is blank. Safe to run repeatedly.

USE `crmeb`;

INSERT INTO `eb_system_config`
(`menu_name`,`type`,`input_type`,`config_tab_id`,`parameter`,`upload_type`,`required`,`width`,`high`,`value`,`info`,`desc`,`sort`,`status`,`level`,`link_id`,`link_value`)
SELECT `defaults`.`menu_name`,`defaults`.`type`,`defaults`.`input_type`,4,
       `defaults`.`parameter`,`defaults`.`upload_type`,'',`defaults`.`width`,0,
       `defaults`.`value`,`defaults`.`info`,`defaults`.`description`,
       `defaults`.`sort`,1,0,0,0
FROM (
    SELECT 'pay_wechat_type' AS `menu_name`,'radio' AS `type`,'input' AS `input_type`,
           '0=>V2（旧版）\n1=>V3（商家转账）' AS `parameter`,1 AS `upload_type`,
           0 AS `width`,'0' AS `value`,'支付接口类型' AS `info`,
           '请选择V3后再配置商户证书、公钥和商家转账场景' AS `description`,100 AS `sort`
    UNION ALL
    SELECT 'pay_weixin_mchid','text','input','',1,100,'""','微信支付商户号',
           '微信支付商户平台中的商户号（MchID）',90
    UNION ALL
    SELECT 'pay_weixin_client_cert','upload','input','',3,0,'""','商户API证书',
           '上传微信支付商户API证书 apiclient_cert.pem',80
    UNION ALL
    SELECT 'pay_weixin_client_key','upload','input','',3,0,'""','商户API证书私钥',
           '上传微信支付商户API证书私钥 apiclient_key.pem',70
    UNION ALL
    SELECT 'pay_weixin_serial_no','text','input','',1,100,'""','商户API证书序列号',
           '填写商户API证书对应的证书序列号',60
    UNION ALL
    SELECT 'pay_weixin_key_v3','text','input','',1,100,'""','API v3密钥',
           '填写微信支付商户平台设置的API v3密钥',50
    UNION ALL
    SELECT 'v3_pay_public_key','text','input','',1,100,'""','微信支付公钥ID',
           '新版本微信支付公钥模式填写PUB_KEY_ID开头的公钥ID',40
    UNION ALL
    SELECT 'v3_pay_public_pem','upload','input','',3,0,'""','微信支付公钥文件',
           '新版本微信支付公钥模式上传微信支付公钥PEM文件',30
    UNION ALL
    SELECT 'v3_transfer_scene_id','text','input','',1,100,'"1000"','商家转账场景ID',
           '填写微信支付商家转账产品中获批的转账场景ID',20
    UNION ALL
    SELECT 'pay_weixin_key','text','input','',1,100,'""','API v2密钥',
           '仅旧版V2接口使用；选择V3时不需要填写',10
) AS `defaults`
LEFT JOIN `eb_system_config` AS `existing`
  ON `existing`.`menu_name` = `defaults`.`menu_name`
WHERE `existing`.`id` IS NULL;

UPDATE `eb_system_config`
SET `config_tab_id` = 4, `status` = 1
WHERE `menu_name` IN (
    'pay_wechat_type',
    'pay_weixin_mchid',
    'pay_weixin_client_cert',
    'pay_weixin_client_key',
    'pay_weixin_serial_no',
    'pay_weixin_key_v3',
    'v3_pay_public_key',
    'v3_pay_public_pem',
    'v3_transfer_scene_id',
    'pay_weixin_key'
);

UPDATE `eb_system_config_tab`
SET `pid` = 23, `title` = '微信支付配置', `status` = 1
WHERE `id` = 4;
