-- Backend-managed offline locations shown by the native mini program.
CREATE TABLE IF NOT EXISTS `eb_miniapp_offline_location` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '' COMMENT 'location name',
  `city` varchar(30) NOT NULL DEFAULT '' COMMENT 'city',
  `address` varchar(200) NOT NULL DEFAULT '' COMMENT 'full address',
  `phone` varchar(30) NOT NULL DEFAULT '' COMMENT 'contact phone',
  `business_hours` varchar(100) NOT NULL DEFAULT '' COMMENT 'business hours',
  `service` varchar(200) NOT NULL DEFAULT '' COMMENT 'service summary',
  `status_text` varchar(20) NOT NULL DEFAULT '营业中' COMMENT 'visible status label',
  `latitude` decimal(10,6) NOT NULL DEFAULT '0.000000',
  `longitude` decimal(10,6) NOT NULL DEFAULT '0.000000',
  `sort` int unsigned NOT NULL DEFAULT '0',
  `is_show` tinyint unsigned NOT NULL DEFAULT '1',
  `add_time` int unsigned NOT NULL DEFAULT '0',
  `update_time` int unsigned NOT NULL DEFAULT '0',
  `is_del` tinyint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_offline_visible_sort` (`is_del`, `is_show`, `sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='miniapp offline locations';

INSERT INTO `eb_system_menus`
(`pid`,`icon`,`menu_name`,`module`,`sort`,`is_show`,`is_show_path`,`access`,`menu_path`,`path`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'','线下地址','admin',1,1,1,1,'/user/grade/offlineLocations','',1,'admin-user-grade-offline-locations',0,'维护小程序线下体验点'
FROM `eb_system_menus`
WHERE `unique_auth` = 'user-user-grade'
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus` WHERE `unique_auth` = 'admin-user-grade-offline-locations'
  );

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'线下地址列表','user/member/offline_location','GET','[]',3,1,1,1,2,'admin-user-offline-location-list',0,'线下地址列表'
FROM `eb_system_menus`
WHERE `unique_auth` = 'admin-user-grade-offline-locations'
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus` WHERE `unique_auth` = 'admin-user-offline-location-list'
  );

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'保存线下地址','user/member/offline_location/save/<id>','POST','[]',2,1,1,1,2,'admin-user-offline-location-save',0,'新增或编辑线下地址'
FROM `eb_system_menus`
WHERE `unique_auth` = 'admin-user-grade-offline-locations'
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus` WHERE `unique_auth` = 'admin-user-offline-location-save'
  );

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'删除线下地址','user/member/offline_location/<id>','DELETE','[]',1,1,1,1,2,'admin-user-offline-location-delete',0,'软删除线下地址'
FROM `eb_system_menus`
WHERE `unique_auth` = 'admin-user-grade-offline-locations'
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus` WHERE `unique_auth` = 'admin-user-offline-location-delete'
  );
