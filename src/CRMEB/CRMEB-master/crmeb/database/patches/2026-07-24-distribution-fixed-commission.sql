-- 21天训练营分销身份：复用 eb_user.agent_level
-- 0 = C普通会员（系统默认，不在等级表中）
-- 1 = M盟友，2 = D代理，3及以上按H合伙人处理

START TRANSACTION;

UPDATE `eb_agent_level`
SET `name` = 'M 盟友', `grade` = 1, `status` = 1, `is_del` = 0
WHERE `id` = 1;

UPDATE `eb_agent_level`
SET `name` = 'D 代理', `grade` = 2, `status` = 1, `is_del` = 0
WHERE `id` = 2;

UPDATE `eb_agent_level`
SET `name` = 'H 合伙人', `grade` = 3, `status` = 1, `is_del` = 0
WHERE `id` = 3;

UPDATE `eb_agent_level`
SET `status` = 0
WHERE `id` IN (4, 5);

UPDATE `eb_agent_level_task`
SET `status` = 0
WHERE `level_id` IN (1, 2, 3);

UPDATE `eb_system_config`
SET `value` = '"0.6"'
WHERE `menu_name` = 'withdrawal_fee';

COMMIT;
