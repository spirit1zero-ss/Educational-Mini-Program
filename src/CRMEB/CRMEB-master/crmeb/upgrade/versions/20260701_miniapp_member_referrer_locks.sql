-- up
CREATE TABLE IF NOT EXISTS `eb_miniapp_member_referrer_locks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'lock id',
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT 'invited user id',
  `spread_uid` int unsigned NOT NULL DEFAULT '0' COMMENT 'pending referrer user id',
  `status` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '0 pending 1 bound 2 expired 3 cancelled',
  `locked_at` int unsigned NOT NULL DEFAULT '0' COMMENT 'lock unix time',
  `expires_at` int unsigned NOT NULL DEFAULT '0' COMMENT 'lock expiry unix time',
  `bound_at` int unsigned NOT NULL DEFAULT '0' COMMENT 'formal bind unix time',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  KEY `idx_uid_status_expires` (`uid`, `status`, `expires_at`),
  KEY `idx_spread_uid_status` (`spread_uid`, `status`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='miniapp member first referrer locks';

-- down
DROP TABLE IF EXISTS `eb_miniapp_member_referrer_locks`;
