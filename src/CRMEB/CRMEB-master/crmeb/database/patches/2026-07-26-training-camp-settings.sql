-- 2026-07-26 training-camp settings and withdrawal controls.
-- Apply even if 2026-07-26-training-camp-distribution-refund.sql was already run.

-- Reuse the three existing setting tabs and hide mall-only controls.
UPDATE `eb_system_config`
SET `status` = 0
WHERE `config_tab_id` IN (72, 73)
  AND `menu_name` NOT LIKE 'training_camp_%';

UPDATE `eb_system_config`
SET `status` = 0
WHERE `config_tab_id` = 74
  AND `menu_name` NOT IN (
    'training_camp_withdraw_enabled',
    'miniapp_withdraw_start_day',
    'miniapp_withdraw_end_day',
    'user_extract_min_price',
    'withdrawal_fee'
  );

INSERT INTO `eb_system_config`
(`menu_name`,`type`,`input_type`,`config_tab_id`,`parameter`,`upload_type`,`required`,`width`,`high`,`value`,`info`,`desc`,`sort`,`status`,`level`,`link_id`,`link_value`)
SELECT
  'training_camp_c_first_commission','text','number',73,'',
  1,'required:true,number:true,min:0',100,0,'120','C 普通会员一级返佣',
  '普通会员固定显示1个名额且暂不消耗；这里设置每个有效一级订单的返佣金额',
  100,1,0,0,0
WHERE NOT EXISTS (SELECT 1 FROM `eb_system_config` WHERE `menu_name` = 'training_camp_c_first_commission');

INSERT INTO `eb_system_config`
(`menu_name`,`type`,`input_type`,`config_tab_id`,`parameter`,`upload_type`,`required`,`width`,`high`,`value`,`info`,`desc`,`sort`,`status`,`level`,`link_id`,`link_value`)
SELECT
  'training_camp_m_initial_quota','text','number',73,'',
  1,'required:true,number:true,min:0',100,0,'30','M 盟友初始名额',
  '盟友可享受名额内高返佣的一级有效支付订单数量',
  95,1,0,0,0
WHERE NOT EXISTS (SELECT 1 FROM `eb_system_config` WHERE `menu_name` = 'training_camp_m_initial_quota');

INSERT INTO `eb_system_config`
(`menu_name`,`type`,`input_type`,`config_tab_id`,`parameter`,`upload_type`,`required`,`width`,`high`,`value`,`info`,`desc`,`sort`,`status`,`level`,`link_id`,`link_value`)
SELECT
  'training_camp_m_first_commission','text','number',73,'',
  1,'required:true,number:true,min:0',100,0,'150','M 盟友名额内一级返佣',
  '盟友名额未用完时，每个有效一级订单的返佣金额',
  94,1,0,0,0
WHERE NOT EXISTS (SELECT 1 FROM `eb_system_config` WHERE `menu_name` = 'training_camp_m_first_commission');

INSERT INTO `eb_system_config`
(`menu_name`,`type`,`input_type`,`config_tab_id`,`parameter`,`upload_type`,`required`,`width`,`high`,`value`,`info`,`desc`,`sort`,`status`,`level`,`link_id`,`link_value`)
SELECT
  'training_camp_d_initial_quota','text','number',73,'',
  1,'required:true,number:true,min:0',100,0,'50','D 代理初始名额',
  '代理可享受名额内高返佣的一级有效支付订单数量',
  90,1,0,0,0
WHERE NOT EXISTS (SELECT 1 FROM `eb_system_config` WHERE `menu_name` = 'training_camp_d_initial_quota');

INSERT INTO `eb_system_config`
(`menu_name`,`type`,`input_type`,`config_tab_id`,`parameter`,`upload_type`,`required`,`width`,`high`,`value`,`info`,`desc`,`sort`,`status`,`level`,`link_id`,`link_value`)
SELECT
  'training_camp_d_first_commission','text','number',73,'',
  1,'required:true,number:true,min:0',100,0,'200','D 代理名额内一级返佣',
  '代理名额未用完时，每个有效一级订单的返佣金额',
  89,1,0,0,0
WHERE NOT EXISTS (SELECT 1 FROM `eb_system_config` WHERE `menu_name` = 'training_camp_d_first_commission');

INSERT INTO `eb_system_config`
(`menu_name`,`type`,`input_type`,`config_tab_id`,`parameter`,`upload_type`,`required`,`width`,`high`,`value`,`info`,`desc`,`sort`,`status`,`level`,`link_id`,`link_value`)
SELECT
  'training_camp_h_initial_quota','text','number',73,'',
  1,'required:true,number:true,min:0',100,0,'200','H 合伙人初始名额',
  '合伙人可享受名额内高返佣的一级有效支付订单数量',
  85,1,0,0,0
WHERE NOT EXISTS (SELECT 1 FROM `eb_system_config` WHERE `menu_name` = 'training_camp_h_initial_quota');

INSERT INTO `eb_system_config`
(`menu_name`,`type`,`input_type`,`config_tab_id`,`parameter`,`upload_type`,`required`,`width`,`high`,`value`,`info`,`desc`,`sort`,`status`,`level`,`link_id`,`link_value`)
SELECT
  'training_camp_h_first_commission','text','number',73,'',
  1,'required:true,number:true,min:0',100,0,'300','H 合伙人名额内一级返佣',
  '合伙人名额未用完时，每个有效一级订单的返佣金额',
  84,1,0,0,0
WHERE NOT EXISTS (SELECT 1 FROM `eb_system_config` WHERE `menu_name` = 'training_camp_h_first_commission');

INSERT INTO `eb_system_config`
(`menu_name`,`type`,`input_type`,`config_tab_id`,`parameter`,`upload_type`,`required`,`width`,`high`,`value`,`info`,`desc`,`sort`,`status`,`level`,`link_id`,`link_value`)
SELECT
  'training_camp_fallback_commission','text','number',73,'',
  1,'required:true,number:true,min:0',100,0,'120','名额用完后一级返佣',
  'M/D/H 的高返佣名额用完后，每个有效一级订单统一按此金额返佣',
  80,1,0,0,0
WHERE NOT EXISTS (SELECT 1 FROM `eb_system_config` WHERE `menu_name` = 'training_camp_fallback_commission');

INSERT INTO `eb_system_config`
(`menu_name`,`type`,`input_type`,`config_tab_id`,`parameter`,`upload_type`,`required`,`width`,`high`,`value`,`info`,`desc`,`sort`,`status`,`level`,`link_id`,`link_value`)
SELECT
  'training_camp_second_commission','text','number',73,'',
  1,'required:true,number:true,min:0',100,0,'20','二级固定返佣',
  '所有有效二级订单统一按此金额返佣，二级成交不占用上级高返佣名额',
  79,1,0,0,0
WHERE NOT EXISTS (SELECT 1 FROM `eb_system_config` WHERE `menu_name` = 'training_camp_second_commission');

INSERT INTO `eb_system_config`
(`menu_name`,`type`,`input_type`,`config_tab_id`,`parameter`,`upload_type`,`required`,`width`,`high`,`value`,`info`,`desc`,`sort`,`status`,`level`,`link_id`,`link_value`)
SELECT
  'training_camp_withdraw_enabled','radio','input',74,'1=>开启\n0=>关闭',
  1,'',0,0,'1','训练营微信提现',
  '控制小程序是否允许提交新的提现申请；关闭后不影响已提交申请和历史记录',
  100,1,0,0,0
WHERE NOT EXISTS (SELECT 1 FROM `eb_system_config` WHERE `menu_name` = 'training_camp_withdraw_enabled');

-- Normalize pre-existing rows so this patch is safe after partial deployment.
UPDATE `eb_system_config`
SET `config_tab_id` = 72, `status` = 1, `sort` = 99
WHERE `menu_name` = 'training_camp_distribution_enabled';

UPDATE `eb_system_config`
SET `config_tab_id` = 73, `status` = 1
WHERE `menu_name` IN (
  'training_camp_c_first_commission',
  'training_camp_m_initial_quota',
  'training_camp_m_first_commission',
  'training_camp_d_initial_quota',
  'training_camp_d_first_commission',
  'training_camp_h_initial_quota',
  'training_camp_h_first_commission',
  'training_camp_fallback_commission',
  'training_camp_second_commission'
);

UPDATE `eb_system_config`
SET `config_tab_id` = 74, `status` = 1
WHERE `menu_name` IN (
  'training_camp_withdraw_enabled',
  'miniapp_withdraw_start_day',
  'miniapp_withdraw_end_day',
  'user_extract_min_price',
  'withdrawal_fee'
);
