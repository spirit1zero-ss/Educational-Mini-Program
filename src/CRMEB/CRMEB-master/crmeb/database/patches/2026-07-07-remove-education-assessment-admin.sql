-- Retire the unused education assessment admin module.
-- The miniapp static assessment pages are not touched by this patch.

UPDATE `eb_system_menus`
SET `is_del` = 1,
    `is_show` = 0,
    `is_show_path` = 0
WHERE `is_del` = 0
  AND (
    `menu_path` LIKE '/education%'
    OR `api_url` LIKE 'education/assessment_records%'
    OR `unique_auth` IN (
      'admin-education',
      'education-assessment-records',
      'education-assessment-records-index',
      'education-assessment-records-read'
    )
    OR `unique_auth` LIKE 'education-assessment%'
    OR `mark` = 'education-assessment-mvp'
  );
