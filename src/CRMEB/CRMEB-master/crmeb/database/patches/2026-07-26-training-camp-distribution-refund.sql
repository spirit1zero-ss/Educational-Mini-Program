-- 2026-07-26 training-camp distribution quota and refund-account controls.
-- Prerequisite: 2026-07-24-release.sql and
-- 2026-07-24-admin-distribution-ui-merged.sql.

-- The training camp no longer reads the legacy mall master switch. Hide it
-- from the old distribution settings form while retaining its stored value
-- and implementation for historical compatibility.
UPDATE `eb_system_config`
SET `status` = 0
WHERE `menu_name` = 'brokerage_func_status';

-- Keep this patch idempotent on MySQL 5.7 and MySQL 8.
SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'eb_user_brokerage'
     AND COLUMN_NAME = 'review_time') = 0,
  'ALTER TABLE `eb_user_brokerage` ADD COLUMN `review_time` int unsigned NOT NULL DEFAULT 0 COMMENT ''人工审核时间'' AFTER `frozen_time`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'eb_miniapp_training_camp_order'
     AND COLUMN_NAME = 'refund_account_frozen') = 0,
  'ALTER TABLE `eb_miniapp_training_camp_order` ADD COLUMN `refund_account_frozen` tinyint unsigned NOT NULL DEFAULT 0 COMMENT ''是否由本订单退款冻结账号'' AFTER `refund_state`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

-- Dedicated switch: it controls only training-camp referral capture and new
-- commissions. Existing team, commission and withdrawal history is retained.
INSERT INTO `eb_system_config`
(`menu_name`,`type`,`input_type`,`config_tab_id`,`parameter`,`upload_type`,`required`,`width`,`high`,`value`,`info`,`desc`,`sort`,`status`,`level`,`link_id`,`link_value`)
SELECT
  'training_camp_distribution_enabled','radio','input',74,'1=>开启\n0=>关闭',
  1,'',0,0,'1','训练营分销',
  '控制训练营推广关系和新佣金发放，关闭后历史团队、佣金和提现记录仍保留',
  99,1,0,0,0
WHERE NOT EXISTS (
  SELECT 1 FROM `eb_system_config`
  WHERE `menu_name` = 'training_camp_distribution_enabled'
);

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT
  `id`,'修改训练营分销开关','agent/level/distribution-switch','PUT','[]',
  1,1,1,1,2,'admin-user-grade-distribution-policy-switch',0,
  '开启或关闭训练营推广关系和新佣金发放'
FROM `eb_system_menus`
WHERE `unique_auth` = 'admin-user-grade-distribution-policy'
  AND `is_del` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-user-grade-distribution-policy-switch'
  )
LIMIT 1;
