-- up
CREATE TABLE IF NOT EXISTS `eb_education_assessment_records` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT 'assessment record id',
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT 'user id',
  `nickname` varchar(100) NOT NULL DEFAULT '' COMMENT 'user nickname',
  `mobile` varchar(32) DEFAULT NULL COMMENT 'mobile phone',
  `score` decimal(8,2) DEFAULT NULL COMMENT 'assessment score',
  `result_text` varchar(500) NOT NULL DEFAULT '' COMMENT 'assessment result text',
  `answers_json` longtext NOT NULL COMMENT 'assessment answers json',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='education assessment records';

INSERT INTO `eb_system_menus` (`pid`, `icon`, `menu_name`, `module`, `controller`, `action`, `api_url`, `methods`, `params`, `sort`, `is_show`, `is_show_path`, `access`, `menu_path`, `path`, `auth_type`, `header`, `is_header`, `unique_auth`, `is_del`, `mark`)
SELECT 0, 's-data', '教育', 'admin', 'education', 'index', '', '', '[]', 90, 1, 1, 1, '/education', '', 1, 'home', 1, 'admin-education', 0, 'education-assessment-mvp'
WHERE NOT EXISTS (SELECT 1 FROM `eb_system_menus` WHERE `unique_auth` = 'admin-education');

SET @education_menu_id := (SELECT `id` FROM `eb_system_menus` WHERE `unique_auth` = 'admin-education' LIMIT 1);

INSERT INTO `eb_system_menus` (`pid`, `icon`, `menu_name`, `module`, `controller`, `action`, `api_url`, `methods`, `params`, `sort`, `is_show`, `is_show_path`, `access`, `menu_path`, `path`, `auth_type`, `header`, `is_header`, `unique_auth`, `is_del`, `mark`)
SELECT @education_menu_id, '', '测评记录', 'admin', 'education.assessment_record', 'index', '', '', '[]', 10, 1, 1, 1, '/education/assessment-records', CAST(@education_menu_id AS CHAR), 1, 'education', 0, 'education-assessment-records', 0, 'education-assessment-mvp'
WHERE @education_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM `eb_system_menus` WHERE `unique_auth` = 'education-assessment-records');

SET @assessment_menu_id := (SELECT `id` FROM `eb_system_menus` WHERE `unique_auth` = 'education-assessment-records' LIMIT 1);

INSERT INTO `eb_system_menus` (`pid`, `icon`, `menu_name`, `module`, `controller`, `action`, `api_url`, `methods`, `params`, `sort`, `is_show`, `is_show_path`, `access`, `menu_path`, `path`, `auth_type`, `header`, `is_header`, `unique_auth`, `is_del`, `mark`)
SELECT @assessment_menu_id, '', '测评记录列表', '', '', '', 'education/assessment_records', 'GET', '[]', 1, 1, 1, 1, '', '', 2, '', 0, 'education-assessment-records-index', 0, 'education-assessment-mvp'
WHERE @assessment_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM `eb_system_menus` WHERE `unique_auth` = 'education-assessment-records-index');

INSERT INTO `eb_system_menus` (`pid`, `icon`, `menu_name`, `module`, `controller`, `action`, `api_url`, `methods`, `params`, `sort`, `is_show`, `is_show_path`, `access`, `menu_path`, `path`, `auth_type`, `header`, `is_header`, `unique_auth`, `is_del`, `mark`)
SELECT @assessment_menu_id, '', '测评记录详情', '', '', '', 'education/assessment_records/:id', 'GET', '[]', 1, 1, 1, 1, '', '', 2, '', 0, 'education-assessment-records-read', 0, 'education-assessment-mvp'
WHERE @assessment_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM `eb_system_menus` WHERE `unique_auth` = 'education-assessment-records-read');

-- down
DELETE FROM `eb_system_menus`
WHERE `unique_auth` IN (
  'education-assessment-records-read',
  'education-assessment-records-index',
  'education-assessment-records',
  'admin-education'
)
AND `mark` = 'education-assessment-mvp';
DROP TABLE IF EXISTS `eb_education_assessment_records`;
