-- 2026-07-26 training-camp premium commission quota effective time.
-- Prerequisite: 2026-07-26-training-camp-settings.sql.
--
-- Existing M/D/H identities start a fresh premium quota at migration time.
-- Direct members bound before this time remain in team history, but do not
-- consume the new identity quota and receive only the fallback commission.

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'eb_user'
     AND COLUMN_NAME = 'agent_level_time') = 0,
  'ALTER TABLE `eb_user` ADD COLUMN `agent_level_time` int unsigned NOT NULL DEFAULT 0 COMMENT ''训练营分销身份生效时间'' AFTER `agent_level`',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

-- Historical identity assignment times were not recorded. The migration time
-- is therefore the deterministic cut-over point for every existing M/D/H user.
UPDATE `eb_user`
SET `agent_level_time` = UNIX_TIMESTAMP()
WHERE `agent_level` > 0
  AND `agent_level_time` = 0;
