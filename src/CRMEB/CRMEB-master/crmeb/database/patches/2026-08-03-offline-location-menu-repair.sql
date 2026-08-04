-- Repair the admin entry and permissions for mini-program offline locations.
-- This patch is idempotent and does not recreate or modify the business table.

SET @offline_parent_id := COALESCE(
  (
    SELECT `id`
    FROM `eb_system_menus`
    WHERE `unique_auth` = 'user-user-grade'
      AND `is_del` = 0
    ORDER BY `id` ASC
    LIMIT 1
  ),
  (
    SELECT `id`
    FROM `eb_system_menus`
    WHERE `menu_name` = '付费会员'
      AND `auth_type` = 1
      AND `is_del` = 0
    ORDER BY `id` ASC
    LIMIT 1
  )
);

-- Reuse an existing row by route if an earlier import created it without the
-- expected unique_auth value.
SET @offline_menu_id := COALESCE(
  (
    SELECT `id`
    FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-user-grade-offline-locations'
    ORDER BY `id` ASC
    LIMIT 1
  ),
  (
    SELECT `id`
    FROM `eb_system_menus`
    WHERE `menu_path` = '/user/grade/offlineLocations'
    ORDER BY `id` ASC
    LIMIT 1
  )
);

INSERT INTO `eb_system_menus`
(`pid`,`icon`,`menu_name`,`module`,`controller`,`action`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`menu_path`,`path`,`auth_type`,`header`,`is_header`,`unique_auth`,`is_del`,`mark`)
SELECT
  @offline_parent_id,'','线下地址','admin','','','','','[]',1,1,1,1,
  '/user/grade/offlineLocations','',1,'',0,
  'admin-user-grade-offline-locations',0,'维护小程序线下体验点'
WHERE @offline_parent_id IS NOT NULL
  AND @offline_menu_id IS NULL;

SET @offline_menu_id := COALESCE(
  @offline_menu_id,
  (
    SELECT `id`
    FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-user-grade-offline-locations'
    ORDER BY `id` ASC
    LIMIT 1
  )
);

UPDATE `eb_system_menus`
SET
  `pid` = @offline_parent_id,
  `icon` = '',
  `menu_name` = '线下地址',
  `module` = 'admin',
  `controller` = '',
  `action` = '',
  `api_url` = '',
  `methods` = '',
  `params` = '[]',
  `sort` = 1,
  `is_show` = 1,
  `is_show_path` = 1,
  `access` = 1,
  `menu_path` = '/user/grade/offlineLocations',
  `path` = '',
  `auth_type` = 1,
  `header` = '',
  `is_header` = 0,
  `unique_auth` = 'admin-user-grade-offline-locations',
  `is_del` = 0,
  `mark` = '维护小程序线下体验点'
WHERE `id` = @offline_menu_id
  AND @offline_parent_id IS NOT NULL;

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT @offline_menu_id,'线下地址列表','user/member/offline_location','GET','[]',3,1,1,1,2,
       'admin-user-offline-location-list',0,'线下地址列表'
WHERE @offline_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-user-offline-location-list'
  );

UPDATE `eb_system_menus`
SET `pid` = @offline_menu_id,
    `menu_name` = '线下地址列表',
    `api_url` = 'user/member/offline_location',
    `methods` = 'GET',
    `params` = '[]',
    `sort` = 3,
    `is_show` = 1,
    `is_show_path` = 1,
    `access` = 1,
    `auth_type` = 2,
    `is_del` = 0,
    `mark` = '线下地址列表'
WHERE `unique_auth` = 'admin-user-offline-location-list'
  AND @offline_menu_id IS NOT NULL;

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT @offline_menu_id,'保存线下地址','user/member/offline_location/save/<id>','POST','[]',2,1,1,1,2,
       'admin-user-offline-location-save',0,'新增或编辑线下地址'
WHERE @offline_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-user-offline-location-save'
  );

UPDATE `eb_system_menus`
SET `pid` = @offline_menu_id,
    `menu_name` = '保存线下地址',
    `api_url` = 'user/member/offline_location/save/<id>',
    `methods` = 'POST',
    `params` = '[]',
    `sort` = 2,
    `is_show` = 1,
    `is_show_path` = 1,
    `access` = 1,
    `auth_type` = 2,
    `is_del` = 0,
    `mark` = '新增或编辑线下地址'
WHERE `unique_auth` = 'admin-user-offline-location-save'
  AND @offline_menu_id IS NOT NULL;

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT @offline_menu_id,'删除线下地址','user/member/offline_location/<id>','DELETE','[]',1,1,1,1,2,
       'admin-user-offline-location-delete',0,'软删除线下地址'
WHERE @offline_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-user-offline-location-delete'
  );

UPDATE `eb_system_menus`
SET `pid` = @offline_menu_id,
    `menu_name` = '删除线下地址',
    `api_url` = 'user/member/offline_location/<id>',
    `methods` = 'DELETE',
    `params` = '[]',
    `sort` = 1,
    `is_show` = 1,
    `is_show_path` = 1,
    `access` = 1,
    `auth_type` = 2,
    `is_del` = 0,
    `mark` = '软删除线下地址'
WHERE `unique_auth` = 'admin-user-offline-location-delete'
  AND @offline_menu_id IS NOT NULL;

SET @offline_list_id := (
  SELECT `id` FROM `eb_system_menus`
  WHERE `unique_auth` = 'admin-user-offline-location-list'
  ORDER BY `id` ASC LIMIT 1
);
SET @offline_save_id := (
  SELECT `id` FROM `eb_system_menus`
  WHERE `unique_auth` = 'admin-user-offline-location-save'
  ORDER BY `id` ASC LIMIT 1
);
SET @offline_delete_id := (
  SELECT `id` FROM `eb_system_menus`
  WHERE `unique_auth` = 'admin-user-offline-location-delete'
  ORDER BY `id` ASC LIMIT 1
);

-- A non-super-admin role that already owns the paid-membership parent menu
-- should inherit this newly restored child menu and its three operations.
UPDATE `eb_system_role`
SET `rules` = CONCAT_WS(',', NULLIF(TRIM(BOTH ',' FROM COALESCE(`rules`, '')), ''), @offline_menu_id)
WHERE `status` = 1
  AND @offline_parent_id IS NOT NULL
  AND @offline_menu_id IS NOT NULL
  AND FIND_IN_SET(CAST(@offline_parent_id AS CHAR), COALESCE(`rules`, '')) > 0
  AND FIND_IN_SET(CAST(@offline_menu_id AS CHAR), COALESCE(`rules`, '')) = 0;

UPDATE `eb_system_role`
SET `rules` = CONCAT_WS(',', NULLIF(TRIM(BOTH ',' FROM COALESCE(`rules`, '')), ''), @offline_list_id)
WHERE `status` = 1
  AND @offline_parent_id IS NOT NULL
  AND @offline_list_id IS NOT NULL
  AND FIND_IN_SET(CAST(@offline_parent_id AS CHAR), COALESCE(`rules`, '')) > 0
  AND FIND_IN_SET(CAST(@offline_list_id AS CHAR), COALESCE(`rules`, '')) = 0;

UPDATE `eb_system_role`
SET `rules` = CONCAT_WS(',', NULLIF(TRIM(BOTH ',' FROM COALESCE(`rules`, '')), ''), @offline_save_id)
WHERE `status` = 1
  AND @offline_parent_id IS NOT NULL
  AND @offline_save_id IS NOT NULL
  AND FIND_IN_SET(CAST(@offline_parent_id AS CHAR), COALESCE(`rules`, '')) > 0
  AND FIND_IN_SET(CAST(@offline_save_id AS CHAR), COALESCE(`rules`, '')) = 0;

UPDATE `eb_system_role`
SET `rules` = CONCAT_WS(',', NULLIF(TRIM(BOTH ',' FROM COALESCE(`rules`, '')), ''), @offline_delete_id)
WHERE `status` = 1
  AND @offline_parent_id IS NOT NULL
  AND @offline_delete_id IS NOT NULL
  AND FIND_IN_SET(CAST(@offline_parent_id AS CHAR), COALESCE(`rules`, '')) > 0
  AND FIND_IN_SET(CAST(@offline_delete_id AS CHAR), COALESCE(`rules`, '')) = 0;

-- Import-tool verification result: all five IDs must be non-null.
SELECT
  @offline_parent_id AS `paid_membership_menu_id`,
  @offline_menu_id AS `offline_location_menu_id`,
  @offline_list_id AS `list_permission_id`,
  @offline_save_id AS `save_permission_id`,
  @offline_delete_id AS `delete_permission_id`;
