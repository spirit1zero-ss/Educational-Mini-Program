-- Public-facing training-camp branding for an existing database.
-- This patch intentionally has no USE statement for restricted cloud accounts.
-- It is safe to run repeatedly and only changes untouched CRMEB seed values.

UPDATE `eb_system_config`
SET `value` = '"自主学习训练营"'
WHERE `menu_name` = 'site_name'
  AND (
    `value` IS NULL
    OR TRIM(`value`) IN ('', '""', '"CRMEB"', '"CRMEB系统"')
  );

UPDATE `eb_store_service`
SET `nickname` = '训练营客服'
WHERE `id` = 1
  AND `nickname` = 'CRMEB';

UPDATE `eb_system_admin`
SET `real_name` = '管理员'
WHERE `id` = 1
  AND `account` = 'admin'
  AND `real_name` = 'CRMEB';

UPDATE `eb_user`
SET `real_name` = '训练营用户'
WHERE `uid` = 1
  AND `real_name` = 'CRMEB';

UPDATE `eb_user`
SET `nickname` = '训练营用户'
WHERE `uid` = 1
  AND `nickname` = 'CRMEB';
