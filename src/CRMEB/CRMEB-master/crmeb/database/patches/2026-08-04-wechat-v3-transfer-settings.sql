-- Clarify WeChat Pay V3 public-key and merchant-transfer settings.
-- Safe to run repeatedly against an existing CRMEB database.

USE `crmeb`;

UPDATE `eb_system_config`
SET `info` = '微信支付公钥ID',
    `desc` = '填写商户平台中的微信支付公钥ID，通常以PUB_KEY_ID_开头'
WHERE `menu_name` = 'v3_pay_public_key';

UPDATE `eb_system_config`
SET `info` = '微信支付公钥文件',
    `desc` = '上传与微信支付公钥ID对应的wxp_pub.pem文件'
WHERE `menu_name` = 'v3_pay_public_pem';

UPDATE `eb_system_config`
SET `info` = '商家转账场景ID',
    `desc` = '填写商户平台已获批的transfer_scene_id；训练营支持1000现金营销或1005佣金报酬',
    `width` = 100
WHERE `menu_name` = 'v3_transfer_scene_id';
