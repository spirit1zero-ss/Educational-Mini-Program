-- Hide unused CRMEB points/integral admin menu entries for the mini-program deployment.
-- This only changes backend menu visibility. It does not delete menu rows,
-- database fields, permissions, or points-related code.

UPDATE `eb_system_menus`
SET `is_show` = 0,
    `is_show_path` = 0
WHERE `is_del` = 0
  AND (
    `id` = 34
    OR `path` = '27/34'
    OR `path` LIKE '27/34/%'
    OR `pid` IN (
      34, 79, 905, 912, 1001, 1002, 2457, 2501, 2713, 2714,
      2715, 2716, 2723, 2724, 2725, 2726, 2727, 2728, 2742
    )
    OR `menu_path` LIKE '%integral%'
    OR `api_url` LIKE '%integral%'
    OR `api_url` LIKE '%point%'
    OR `unique_auth` LIKE '%integral%'
    OR `unique_auth` LIKE '%point%'
  );