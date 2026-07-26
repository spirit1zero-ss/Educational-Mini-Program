-- 2026-07-26 audited offline refund registration for training-camp orders.
-- Prerequisite: 2026-07-26-training-camp-distribution-refund.sql.

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'eb_miniapp_training_camp_order'
     AND COLUMN_NAME = 'refund_source') = 0,
  'ALTER TABLE `eb_miniapp_training_camp_order` ADD COLUMN `refund_source` varchar(16) NOT NULL DEFAULT '''' COMMENT ''退款来源：wechat/offline'' AFTER `refund_account_frozen`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'eb_miniapp_training_camp_order'
     AND COLUMN_NAME = 'refund_amount_fen') = 0,
  'ALTER TABLE `eb_miniapp_training_camp_order` ADD COLUMN `refund_amount_fen` int unsigned NOT NULL DEFAULT 0 COMMENT ''实际退款金额（分）'' AFTER `refund_source`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'eb_miniapp_training_camp_order'
     AND COLUMN_NAME = 'refund_channel') = 0,
  'ALTER TABLE `eb_miniapp_training_camp_order` ADD COLUMN `refund_channel` varchar(32) NOT NULL DEFAULT '''' COMMENT ''线下退款渠道'' AFTER `refund_amount_fen`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'eb_miniapp_training_camp_order'
     AND COLUMN_NAME = 'refund_reference') = 0,
  'ALTER TABLE `eb_miniapp_training_camp_order` ADD COLUMN `refund_reference` varchar(96) NOT NULL DEFAULT '''' COMMENT ''外部退款流水号'' AFTER `refund_channel`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'eb_miniapp_training_camp_order'
     AND COLUMN_NAME = 'refund_time') = 0,
  'ALTER TABLE `eb_miniapp_training_camp_order` ADD COLUMN `refund_time` int unsigned NOT NULL DEFAULT 0 COMMENT ''实际退款时间'' AFTER `refund_reference`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'eb_miniapp_training_camp_order'
     AND COLUMN_NAME = 'refund_operator_id') = 0,
  'ALTER TABLE `eb_miniapp_training_camp_order` ADD COLUMN `refund_operator_id` int unsigned NOT NULL DEFAULT 0 COMMENT ''线下退款登记管理员ID'' AFTER `refund_time`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'eb_miniapp_training_camp_order'
     AND COLUMN_NAME = 'refund_operator_name') = 0,
  'ALTER TABLE `eb_miniapp_training_camp_order` ADD COLUMN `refund_operator_name` varchar(64) NOT NULL DEFAULT '''' COMMENT ''线下退款登记管理员'' AFTER `refund_operator_id`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'eb_miniapp_training_camp_order'
     AND COLUMN_NAME = 'refund_note') = 0,
  'ALTER TABLE `eb_miniapp_training_camp_order` ADD COLUMN `refund_note` varchar(255) NOT NULL DEFAULT '''' COMMENT ''线下退款原因及备注'' AFTER `refund_operator_name`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT
  `id`,'登记训练营线下退款','user/member/training_camp/order/<id>/offline_refund','POST','[]',
  1,1,1,1,2,'admin-user-training-camp-order-offline-refund',0,
  '仅登记已经在线下实际完成的全额退款，不执行付款'
FROM `eb_system_menus`
WHERE `unique_auth` = 'admin-user-grade-training-camp-orders'
  AND `is_del` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-user-training-camp-order-offline-refund'
  )
LIMIT 1;
