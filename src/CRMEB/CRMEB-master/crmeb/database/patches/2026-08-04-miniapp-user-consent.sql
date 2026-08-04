-- Durable, authenticated record of the login agreement bundle accepted in the mini program.
-- agreement_version must be changed whenever the displayed agreement bundle changes materially.
CREATE TABLE IF NOT EXISTS `eb_miniapp_user_consent` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'consent record id',
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT 'local user id',
  `agreement_type` varchar(32) NOT NULL DEFAULT 'login_bundle' COMMENT 'accepted agreement bundle',
  `agreement_version` varchar(64) NOT NULL DEFAULT '' COMMENT 'frontend agreement version',
  `privacy_contract_name` varchar(128) NOT NULL DEFAULT '' COMMENT 'wechat privacy contract name shown to user',
  `source` varchar(32) NOT NULL DEFAULT 'miniapp_login' COMMENT 'consent source',
  `agreed_at` int unsigned NOT NULL DEFAULT '0' COMMENT 'authoritative server consent time',
  `add_time` int unsigned NOT NULL DEFAULT '0',
  `update_time` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_consent_version` (`uid`, `agreement_type`, `agreement_version`),
  KEY `idx_user_consent_time` (`uid`, `agreed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='miniapp user agreement consent records';
