-- 本轮兑换码功能增量：用于已有训练营/会员业务的数据库，表前缀 eb_。
-- 执行前选择正确的业务数据库并备份；不要导入安装整库或本地测试数据。
-- 本文件包含并替代 2026-09-14-admin-local-data-repair.sql。
SET NAMES utf8mb4;

-- 老库缺少兑换截止字段时补齐；已有字段和历史批次值保持不变。
SET @redemption_expiry_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_member_card_batch'
     AND COLUMN_NAME = 'expire_time') = 0,
  'ALTER TABLE `eb_member_card_batch` ADD COLUMN `expire_time` int unsigned NOT NULL DEFAULT 0 COMMENT ''兑换截止时间'' AFTER `use_day`',
  'SELECT ''expire_time already exists'' AS result'
);
PREPARE redemption_expiry_stmt FROM @redemption_expiry_sql;
EXECUTE redemption_expiry_stmt;
DEALLOCATE PREPARE redemption_expiry_stmt;

-- 与训练营订单表的订单号排序规则统一；保留原长度、默认值和空值约束。
ALTER TABLE `eb_other_order`
  MODIFY COLUMN `order_id` varchar(32) CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '订单号';

-- 开放现有兑换能力，不创建或修改任何用户会员、订单和兑换码。
UPDATE `eb_system_config` SET `value` = '1'
WHERE `menu_name` = 'member_card_status';

UPDATE `eb_system_menus`
SET `is_show` = 1, `is_show_path` = 1
WHERE `is_del` = 0 AND `unique_auth` IN (
  'user-user-grade', 'admin-user-grade-card', 'admin-user-grade-record'
);

-- 修复旧连接编码错误写入的两个报名菜单名。
UPDATE `eb_system_menus`
SET `menu_name` = '报名登记表', `mark` = '报名登记表'
WHERE `unique_auth` = 'admin-user-grade-registration' AND `is_del` = 0;

UPDATE `eb_system_menus`
SET `menu_name` = '报名登记表列表', `mark` = '报名登记表列表'
WHERE `unique_auth` = 'admin-user-grade-registration-list' AND `is_del` = 0;

-- 导入后的核对结果：应有开关值 1，卡密/记录菜单显示，order_id 为 general_ci。
SELECT `menu_name`, `value` FROM `eb_system_config` WHERE `menu_name` = 'member_card_status';
SELECT `menu_name`, `is_show`, `is_show_path` FROM `eb_system_menus`
WHERE `is_del` = 0 AND `unique_auth` IN ('admin-user-grade-card', 'admin-user-grade-record', 'admin-user-grade-registration');
SELECT TABLE_NAME, COLUMN_NAME, COLLATION_NAME FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_other_order' AND COLUMN_NAME = 'order_id';
