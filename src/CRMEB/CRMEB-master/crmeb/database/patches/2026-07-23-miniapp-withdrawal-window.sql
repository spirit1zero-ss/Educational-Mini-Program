-- Mini program withdrawal application window.
-- Users may submit requests only from day 1 through day 7 of each month.
-- Administrators may review pending requests on any date.

INSERT INTO `eb_system_config`
(`menu_name`, `type`, `input_type`, `config_tab_id`, `parameter`, `upload_type`, `required`, `width`, `high`, `value`, `info`, `desc`, `sort`, `status`, `level`, `link_id`, `link_value`)
SELECT
    'miniapp_withdraw_start_day', 'text', 'number', 74, '', 1,
    'required:true,number:true,min:1,max:31', 100, 0, '"1"',
    '提现开放开始日', '小程序用户每月可提交提现申请的开始日期，管理员审核不受此日期限制',
    12, 1, 0, 0, 0
WHERE NOT EXISTS (
    SELECT 1 FROM `eb_system_config` WHERE `menu_name` = 'miniapp_withdraw_start_day'
);

INSERT INTO `eb_system_config`
(`menu_name`, `type`, `input_type`, `config_tab_id`, `parameter`, `upload_type`, `required`, `width`, `high`, `value`, `info`, `desc`, `sort`, `status`, `level`, `link_id`, `link_value`)
SELECT
    'miniapp_withdraw_end_day', 'text', 'number', 74, '', 1,
    'required:true,number:true,min:1,max:31', 100, 0, '"7"',
    '提现开放结束日', '小程序用户每月可提交提现申请的结束日期，管理员审核不受此日期限制',
    11, 1, 0, 0, 0
WHERE NOT EXISTS (
    SELECT 1 FROM `eb_system_config` WHERE `menu_name` = 'miniapp_withdraw_end_day'
);

UPDATE `eb_system_config`
SET `value` = '"0"',
    `desc` = '训练营佣金不按固定天数自动冻结，用户仅能在提现窗口申请并由管理员审核'
WHERE `menu_name` = 'extract_time';
