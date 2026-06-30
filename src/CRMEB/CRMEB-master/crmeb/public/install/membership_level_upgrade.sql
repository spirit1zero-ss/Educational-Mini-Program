-- ============================================================
-- 会员等级体系升级脚本（按累计购买商品件数自动升级）
-- 适用于已安装的数据库；全新安装无需执行（crmeb.sql 已内置）
-- 表前缀默认为 eb_ ，如不同请自行替换
--
-- 等级规则：
--   会员       累计购买 1   件（首次成功购买即成为会员）
--   高级会员   累计购买 20  件
--   专家       累计购买 50  件
--   合伙人     累计购买 100 件
-- 说明：exp_num 字段复用为“升级所需累计购买商品件数”；
--      discount=100 表示不打折（保留原折扣体系，后台可按需调整）。
-- 执行后请到后台清理一次系统配置缓存。
-- ============================================================

-- 1) 退役旧等级（软删除，不影响历史授予记录）
UPDATE `eb_system_user_level` SET `is_del` = 1 WHERE `is_del` = 0;

-- 2) 写入四个新等级
INSERT INTO `eb_system_user_level`
(`mer_id`, `name`, `money`, `valid_date`, `is_forever`, `is_pay`, `is_show`, `grade`, `discount`, `image`, `icon`, `explain`, `add_time`, `is_del`, `exp_num`)
VALUES
(0, '会员',     '0.00', 0, 1, 0, 1, 1, '100.00', '/statics/system_images/user_level_1_bgimg.jpeg', '/statics/system_images/user_level_1_icon.jpeg', '首次成功购买商品即成为会员',     UNIX_TIMESTAMP(), 0, 1),
(0, '高级会员', '0.00', 0, 1, 0, 1, 2, '100.00', '/statics/system_images/user_level_2_bgimg.jpeg', '/statics/system_images/user_level_2_icon.jpeg', '累计购买满20件商品成为高级会员', UNIX_TIMESTAMP(), 0, 20),
(0, '专家',     '0.00', 0, 1, 0, 1, 3, '100.00', '/statics/system_images/user_level_3_bgimg.jpeg', '/statics/system_images/user_level_3_icon.jpeg', '累计购买满50件商品成为专家',     UNIX_TIMESTAMP(), 0, 50),
(0, '合伙人',   '0.00', 0, 1, 0, 1, 4, '100.00', '/statics/system_images/user_level_4_bgimg.jpeg', '/statics/system_images/user_level_4_icon.jpeg', '累计购买满100件商品成为合伙人', UNIX_TIMESTAMP(), 0, 100);

-- 3) 开启“用户等级”功能（member_func_status = 1，值为纯字符串）
UPDATE `eb_system_config` SET `value` = '1' WHERE `menu_name` = 'member_func_status';

-- 4)（可选）升级指标配置项；不写也默认按购买商品件数(order_num)
--    如需改回经验值模式，把 value 改为 'exp'
INSERT INTO `eb_system_config`
(`menu_name`, `type`, `input_type`, `config_tab_id`, `parameter`, `upload_type`, `required`, `width`, `high`, `value`, `info`, `desc`, `sort`, `status`, `level`, `link_id`, `link_value`)
SELECT 'member_level_metric', 'radio', 'input', 45, 'order_num=>按购买商品件数\nexp=>按经验值', 0, '', 0, 0, 'order_num', '会员升级指标', '会员等级升级依据：按累计购买商品件数 或 按经验值', 0, 0, 0, 0, 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `eb_system_config` WHERE `menu_name` = 'member_level_metric');
