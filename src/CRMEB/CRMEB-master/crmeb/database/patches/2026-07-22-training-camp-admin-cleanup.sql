-- Hide only legacy user-classification menus that are not used by the current miniapp.
-- Keep member-card, member-record and member-right menus visible: the miniapp uses
-- redemption codes and member entitlements, and operators need their audit records.
UPDATE `eb_system_menus`
SET `is_show` = 0,
    `is_show_path` = 0
WHERE `is_del` = 0
  AND (
    `unique_auth` IN (
      'user-user-level',
      'user-user-group',
      'user-user-label'
    )
    OR `menu_path` IN (
      '/user/level',
      '/user/group',
      '/user/label'
    )
  );

-- Add authorization metadata for the new soft-delete action when missing.
INSERT INTO `eb_system_menus`
(`pid`, `icon`, `menu_name`, `module`, `controller`, `action`, `api_url`, `methods`, `params`, `sort`, `is_show`, `is_show_path`, `access`, `menu_path`, `path`, `auth_type`, `header`, `is_header`, `unique_auth`, `is_del`, `mark`)
SELECT
  `id`, '', '删除训练营报名记录', '', '', '', 'user/member/registration/<id>', 'DELETE', '[]',
  1, 1, 1, 1, '', '', 2, '', 0, 'admin-user-training-camp-registration-delete', 0, '软删除报名记录，保留审计数据'
FROM `eb_system_menus`
WHERE `unique_auth` = 'admin-user-grade-registration'
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus` m2
    WHERE m2.`unique_auth` = 'admin-user-training-camp-registration-delete'
  )
LIMIT 1;

INSERT INTO `eb_system_menus`
(`pid`, `icon`, `menu_name`, `module`, `controller`, `action`, `api_url`, `methods`, `params`, `sort`, `is_show`, `is_show_path`, `access`, `menu_path`, `path`, `auth_type`, `header`, `is_header`, `unique_auth`, `is_del`, `mark`)
SELECT
  `id`, '', '注销用户', '', '', '', 'user/user/<id>', 'DELETE', '[]',
  1, 1, 1, 1, '', '', 2, '', 0, 'admin-user-delete', 0, '软删除用户并撤销登录、会员和分销资格'
FROM `eb_system_menus`
WHERE `unique_auth` = 'admin-user-user-index'
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus` m2
    WHERE m2.`unique_auth` = 'admin-user-delete'
  )
LIMIT 1;
