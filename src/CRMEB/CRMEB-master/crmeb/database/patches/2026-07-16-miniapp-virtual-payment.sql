-- Training-camp order scope and durable wx.requestVirtualPayment attempts.
-- Run once before enabling XPAY_ENABLED. The unique keys are the final safety net
-- behind Redis locks and database row locks.

CREATE TABLE IF NOT EXISTS `eb_miniapp_training_camp_order` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'training camp order id',
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT 'local user id',
  `other_order_id` int unsigned NOT NULL DEFAULT '0' COMMENT 'eb_other_order primary key',
  `order_id` varchar(32) NOT NULL DEFAULT '' COMMENT 'local business order id',
  `active_uid_key` varchar(16) DEFAULT NULL COMMENT 'one active training camp order per user',
  `plan_id` int unsigned NOT NULL DEFAULT '0' COMMENT 'membership plan snapshot id',
  `member_type` varchar(32) NOT NULL DEFAULT '' COMMENT 'membership type snapshot',
  `product_id` varchar(64) NOT NULL DEFAULT '' COMMENT 'xpay product snapshot',
  `price_fen` int unsigned NOT NULL DEFAULT '0' COMMENT 'price snapshot in fen',
  `order_state` varchar(16) NOT NULL DEFAULT 'pending' COMMENT 'pending/paying/paid/closed/refunded/exception',
  `entitlement_state` varchar(16) NOT NULL DEFAULT 'not_granted' COMMENT 'not_granted/granted/review',
  `delivery_state` varchar(16) NOT NULL DEFAULT 'not_delivered' COMMENT 'not_delivered/delivered/failed',
  `refund_state` varchar(16) NOT NULL DEFAULT 'none' COMMENT 'none/refunding/refunded/failed',
  `active_attempt_id` bigint unsigned DEFAULT NULL COMMENT 'current payment attempt',
  `last_error` varchar(500) NOT NULL DEFAULT '',
  `add_time` int unsigned NOT NULL DEFAULT '0',
  `update_time` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_training_other_order` (`other_order_id`),
  UNIQUE KEY `uniq_training_order_id` (`order_id`),
  UNIQUE KEY `uniq_training_active_uid` (`active_uid_key`),
  KEY `idx_training_uid_state` (`uid`, `order_state`),
  KEY `idx_training_delivery` (`delivery_state`, `update_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='miniapp training camp orders';

CREATE TABLE IF NOT EXISTS `eb_miniapp_virtual_payment_attempt` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'attempt id',
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT 'local user id',
  `order_id` varchar(32) NOT NULL DEFAULT '' COMMENT 'local other_order order id',
  `out_trade_no` varchar(32) NOT NULL DEFAULT '' COMMENT 'xpay business order id',
  `active_order_key` varchar(32) DEFAULT NULL COMMENT 'one active payment attempt per local order',
  `openid` varchar(255) NOT NULL DEFAULT '' COMMENT 'mini program openid',
  `environment` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '0 production 1 sandbox',
  `product_id` varchar(64) NOT NULL DEFAULT '' COMMENT 'published membership entitlement product id',
  `amount` int unsigned NOT NULL DEFAULT '0' COMMENT 'amount in fen',
  `wx_status` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'xpay order status',
  `local_state` varchar(16) NOT NULL DEFAULT 'prepared' COMMENT 'prepared/paying/confirmed/delivered/closed/refunded/failed',
  `wx_order_id` varchar(64) NOT NULL DEFAULT '' COMMENT 'xpay internal order id',
  `transaction_id` varchar(64) NOT NULL DEFAULT '' COMMENT 'wechat pay transaction id',
  `retry_count` int unsigned NOT NULL DEFAULT '0',
  `delivery_retry_count` int unsigned NOT NULL DEFAULT '0',
  `next_retry_at` int unsigned NOT NULL DEFAULT '0',
  `last_error` varchar(500) NOT NULL DEFAULT '',
  `confirmed_at` int unsigned NOT NULL DEFAULT '0',
  `delivered_at` int unsigned NOT NULL DEFAULT '0',
  `refunded_at` int unsigned NOT NULL DEFAULT '0',
  `add_time` int unsigned NOT NULL DEFAULT '0',
  `update_time` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_out_trade_no` (`out_trade_no`),
  UNIQUE KEY `uniq_active_order_key` (`active_order_key`),
  KEY `idx_uid_order` (`uid`, `order_id`),
  KEY `idx_order_status` (`order_id`, `wx_status`),
  KEY `idx_retry_due` (`next_retry_at`, `local_state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='miniapp virtual payment attempts';

-- Upgrade installations that already ran the first version of this patch.
-- Dynamic DDL keeps the migration idempotent on both MySQL 5.7 and MySQL 8.
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_miniapp_training_camp_order' AND COLUMN_NAME = 'active_uid_key') = 0, 'ALTER TABLE `eb_miniapp_training_camp_order` ADD COLUMN `active_uid_key` varchar(16) DEFAULT NULL AFTER `order_id`', 'SELECT 1');
PREPARE migration_stmt FROM @ddl; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_miniapp_training_camp_order' AND INDEX_NAME = 'uniq_training_active_uid') = 0, 'ALTER TABLE `eb_miniapp_training_camp_order` ADD UNIQUE KEY `uniq_training_active_uid` (`active_uid_key`)', 'SELECT 1');
PREPARE migration_stmt FROM @ddl; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_miniapp_virtual_payment_attempt' AND COLUMN_NAME = 'active_order_key') = 0, 'ALTER TABLE `eb_miniapp_virtual_payment_attempt` ADD COLUMN `active_order_key` varchar(32) DEFAULT NULL AFTER `out_trade_no`', 'SELECT 1');
PREPARE migration_stmt FROM @ddl; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_miniapp_virtual_payment_attempt' AND COLUMN_NAME = 'local_state') = 0, 'ALTER TABLE `eb_miniapp_virtual_payment_attempt` ADD COLUMN `local_state` varchar(16) NOT NULL DEFAULT ''prepared'' AFTER `wx_status`', 'SELECT 1');
PREPARE migration_stmt FROM @ddl; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_miniapp_virtual_payment_attempt' AND COLUMN_NAME = 'retry_count') = 0, 'ALTER TABLE `eb_miniapp_virtual_payment_attempt` ADD COLUMN `retry_count` int unsigned NOT NULL DEFAULT 0 AFTER `transaction_id`', 'SELECT 1');
PREPARE migration_stmt FROM @ddl; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_miniapp_virtual_payment_attempt' AND COLUMN_NAME = 'delivery_retry_count') = 0, 'ALTER TABLE `eb_miniapp_virtual_payment_attempt` ADD COLUMN `delivery_retry_count` int unsigned NOT NULL DEFAULT 0 AFTER `retry_count`', 'SELECT 1');
PREPARE migration_stmt FROM @ddl; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_miniapp_virtual_payment_attempt' AND COLUMN_NAME = 'next_retry_at') = 0, 'ALTER TABLE `eb_miniapp_virtual_payment_attempt` ADD COLUMN `next_retry_at` int unsigned NOT NULL DEFAULT 0 AFTER `delivery_retry_count`', 'SELECT 1');
PREPARE migration_stmt FROM @ddl; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_miniapp_virtual_payment_attempt' AND COLUMN_NAME = 'last_error') = 0, 'ALTER TABLE `eb_miniapp_virtual_payment_attempt` ADD COLUMN `last_error` varchar(500) NOT NULL DEFAULT '''' AFTER `next_retry_at`', 'SELECT 1');
PREPARE migration_stmt FROM @ddl; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_miniapp_virtual_payment_attempt' AND COLUMN_NAME = 'confirmed_at') = 0, 'ALTER TABLE `eb_miniapp_virtual_payment_attempt` ADD COLUMN `confirmed_at` int unsigned NOT NULL DEFAULT 0 AFTER `last_error`', 'SELECT 1');
PREPARE migration_stmt FROM @ddl; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_miniapp_virtual_payment_attempt' AND COLUMN_NAME = 'delivered_at') = 0, 'ALTER TABLE `eb_miniapp_virtual_payment_attempt` ADD COLUMN `delivered_at` int unsigned NOT NULL DEFAULT 0 AFTER `confirmed_at`', 'SELECT 1');
PREPARE migration_stmt FROM @ddl; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_miniapp_virtual_payment_attempt' AND COLUMN_NAME = 'refunded_at') = 0, 'ALTER TABLE `eb_miniapp_virtual_payment_attempt` ADD COLUMN `refunded_at` int unsigned NOT NULL DEFAULT 0 AFTER `delivered_at`', 'SELECT 1');
PREPARE migration_stmt FROM @ddl; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_miniapp_virtual_payment_attempt' AND INDEX_NAME = 'uniq_active_order_key') = 0, 'ALTER TABLE `eb_miniapp_virtual_payment_attempt` ADD UNIQUE KEY `uniq_active_order_key` (`active_order_key`)', 'SELECT 1');
PREPARE migration_stmt FROM @ddl; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_miniapp_virtual_payment_attempt' AND INDEX_NAME = 'idx_retry_due') = 0, 'ALTER TABLE `eb_miniapp_virtual_payment_attempt` ADD KEY `idx_retry_due` (`next_retry_at`, `local_state`)', 'SELECT 1');
PREPARE migration_stmt FROM @ddl; EXECUTE migration_stmt; DEALLOCATE PREPARE migration_stmt;

-- Backfill only orders created by the already-released training-camp virtual-pay
-- path. Other CRMEB membership/payment types are deliberately excluded.
INSERT IGNORE INTO `eb_miniapp_training_camp_order`
(`uid`, `other_order_id`, `order_id`, `active_uid_key`, `plan_id`, `member_type`, `product_id`, `price_fen`, `order_state`, `entitlement_state`, `delivery_state`, `refund_state`, `add_time`, `update_time`)
SELECT
  `uid`, `id`, `order_id`, NULL, 0, `member_type`, '', ROUND(`pay_price` * 100),
  CASE WHEN `paid` = 1 THEN 'paid' WHEN `is_del` = 1 THEN 'closed' ELSE 'pending' END,
  CASE WHEN `paid` = 1 THEN 'granted' ELSE 'not_granted' END,
  'not_delivered', 'none', `add_time`, UNIX_TIMESTAMP()
FROM `eb_other_order`
WHERE `pay_type` = 'virtual' AND `member_type` <> '';

INSERT INTO `eb_system_timer`
(`name`, `mark`, `content`, `type`, `week`, `day`, `hour`, `minute`, `second`, `last_execution_time`, `next_execution_time`, `add_time`, `is_del`, `is_open`)
SELECT 'Training camp virtual payment reconciliation', 'virtualPaymentReconcile', 'Query XPay and retry entitlement delivery every minute', 2, 1, 1, 1, 1, 0, 0, 0, UNIX_TIMESTAMP(), 0, 1
WHERE NOT EXISTS (
  SELECT 1 FROM `eb_system_timer` WHERE `mark` = 'virtualPaymentReconcile' AND `is_del` = 0
);
