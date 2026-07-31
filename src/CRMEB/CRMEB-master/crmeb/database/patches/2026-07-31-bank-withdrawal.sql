-- 2026-07-31 secure manual bank withdrawal.
-- Prerequisite: all required baselines listed in database/patches/README.md.
-- Idempotent on MySQL 5.7 and MySQL 8.

-- Feature flag: code is deployed but the mini-program keeps the bank option
-- completely hidden until operations deliberately enables it.
INSERT INTO `eb_system_config`
(`menu_name`,`type`,`input_type`,`config_tab_id`,`parameter`,`upload_type`,`required`,`width`,`high`,`value`,`info`,`desc`,`sort`,`status`,`level`,`link_id`,`link_value`)
SELECT
  'training_camp_bank_withdraw_enabled','radio','input',74,'1=>开启\n0=>关闭',
  1,'',0,0,'0','银行卡人工提现',
  '控制小程序是否显示并允许银行卡人工提现；默认关闭，关闭不影响已有申请和历史记录',
  10,1,0,0,0
WHERE NOT EXISTS (
  SELECT 1 FROM `eb_system_config`
  WHERE `menu_name` = 'training_camp_bank_withdraw_enabled'
);

UPDATE `eb_system_config`
SET `config_tab_id` = 74, `status` = 1
WHERE `menu_name` = 'training_camp_bank_withdraw_enabled';

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_user_extract' AND COLUMN_NAME = 'bank_secure_payload') = 0,
  'ALTER TABLE `eb_user_extract` ADD COLUMN `bank_secure_payload` text NULL COMMENT ''银行卡收款资料AES-256-GCM密文'' AFTER `bank_address`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_user_extract' AND COLUMN_NAME = 'bank_code_last4') = 0,
  'ALTER TABLE `eb_user_extract` ADD COLUMN `bank_code_last4` char(4) NOT NULL DEFAULT '''' COMMENT ''银行卡尾号，仅用于脱敏展示'' AFTER `bank_secure_payload`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_user_extract' AND COLUMN_NAME = 'bank_consent_at') = 0,
  'ALTER TABLE `eb_user_extract` ADD COLUMN `bank_consent_at` int unsigned NOT NULL DEFAULT 0 COMMENT ''用户单独授权银行卡资料处理时间'' AFTER `bank_code_last4`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_user_extract' AND COLUMN_NAME = 'bank_consent_version') = 0,
  'ALTER TABLE `eb_user_extract` ADD COLUMN `bank_consent_version` varchar(32) NOT NULL DEFAULT '''' COMMENT ''银行卡资料授权文案版本'' AFTER `bank_consent_at`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_user_extract' AND COLUMN_NAME = 'reviewed_at') = 0,
  'ALTER TABLE `eb_user_extract` ADD COLUMN `reviewed_at` int unsigned NOT NULL DEFAULT 0 COMMENT ''后台审核通过时间'' AFTER `fail_reason`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_user_extract' AND COLUMN_NAME = 'reviewed_admin_id') = 0,
  'ALTER TABLE `eb_user_extract` ADD COLUMN `reviewed_admin_id` int unsigned NOT NULL DEFAULT 0 COMMENT ''审核管理员ID'' AFTER `reviewed_at`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_user_extract' AND COLUMN_NAME = 'payout_reference') = 0,
  'ALTER TABLE `eb_user_extract` ADD COLUMN `payout_reference` varchar(96) NOT NULL DEFAULT '''' COMMENT ''银行付款流水号'' AFTER `reviewed_admin_id`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_user_extract' AND COLUMN_NAME = 'payout_proof') = 0,
  'ALTER TABLE `eb_user_extract` ADD COLUMN `payout_proof` varchar(255) NOT NULL DEFAULT '''' COMMENT ''银行付款凭证图片'' AFTER `payout_reference`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_user_extract' AND COLUMN_NAME = 'payout_time') = 0,
  'ALTER TABLE `eb_user_extract` ADD COLUMN `payout_time` int unsigned NOT NULL DEFAULT 0 COMMENT ''确认银行付款时间'' AFTER `payout_proof`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_user_extract' AND COLUMN_NAME = 'payout_admin_id') = 0,
  'ALTER TABLE `eb_user_extract` ADD COLUMN `payout_admin_id` int unsigned NOT NULL DEFAULT 0 COMMENT ''确认付款管理员ID'' AFTER `payout_time`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

ALTER TABLE `eb_user_extract`
  MODIFY COLUMN `status` tinyint(2) NOT NULL DEFAULT 0
  COMMENT '-1 未通过 0 审核中 1 已提现 2 银行卡待付款';

-- New endpoints inherit the existing Finance > Withdrawal role boundary.
INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'查看银行卡提现资料','finance/extract/bank-details/<id>','GET','[]',2,1,1,1,2,
       'admin-finance-extract-bank-details',0,'仅可查看未结束的加密银行卡收款资料，操作写入后台审计日志'
FROM `eb_system_menus`
WHERE `unique_auth` = 'finance-user_extract'
  AND `is_del` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-finance-extract-bank-details'
  )
LIMIT 1;

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'确认银行卡提现到账','finance/extract/bank-paid/<id>','PUT','[]',1,1,1,1,2,
       'admin-finance-extract-bank-paid',0,'财务核对转账后凭银行流水号和图片凭证确认到账'
FROM `eb_system_menus`
WHERE `unique_auth` = 'finance-user_extract'
  AND `is_del` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-finance-extract-bank-paid'
  )
LIMIT 1;

-- Keep the editable privacy agreement aligned with the new collection flow.
UPDATE `eb_agreement`
SET `content` = '<h2>一、我们处理的信息</h2><p>为提供登录、报名、支付、训练营服务、邀请和提现功能，我们会处理微信身份标识、联系方式、报名信息、订单、邀请和服务记录。您选择银行卡提现时，我们还会处理开户姓名、银行卡号、开户银行及授权记录。</p><h2>二、银行卡提现信息用途</h2><p>银行卡资料仅用于审核提现申请、完成银行转账、核对到账状态和必要的安全审计。完整资料采用加密保存，仅授权财务人员可在未结束的提现处理中按需查看，不用于营销；确认到账或驳回后删除可解密的完整资料，仅保留必要的尾号和审计记录。</p><h2>三、未成年人信息</h2><p>孩子姓名、年龄、性别和学习情况应由监护人填写或在监护人授权下填写，仅用于训练营服务。</p><h2>四、信息保护与权利</h2><p>我们采取访问控制、操作审计和加密等措施保护信息安全。您可通过客服申请查询、更正或删除依法可以处理的信息；订单、支付、提现和必要审计记录将按法律要求保留。</p>'
WHERE `type` = 3;
