-- Hide maintenance entries that are unsafe or incomplete in the current
-- WeChat Cloud Hosting deployment.
--
-- This patch only changes menu visibility. It does not delete routes,
-- permissions, source code, scheduled-task records, files, or business data.
--
-- Kept visible:
--   system-maintain-system-log  (system logs)
--   system-clear                (cache/runtime-log maintenance)
--   system-maintain-auth        (local system diagnostics)

UPDATE `eb_system_menus`
SET
  `is_show` = 0,
  `is_show_path` = 0
WHERE `is_del` = 0
  AND (
    `unique_auth` IN (
      'system-maintain-system-cleardata',
      'system-maintain-system-databackup',
      'system-database-index',
      'system-crontab-index',
      'admin-tool'
    )
    OR `path` = '25/1073'
    OR `path` LIKE '25/1073/%'
    OR `path` = '25/1695'
    OR `path` LIKE '25/1695/%'
    OR `path` = '25/56/1076'
    OR `path` LIKE '25/56/1076/%'
  );

-- To restore an intentionally reintroduced menu later, set its is_show and
-- is_show_path fields back to 1 after its cloud-hosting dependencies have
-- been implemented and verified.
