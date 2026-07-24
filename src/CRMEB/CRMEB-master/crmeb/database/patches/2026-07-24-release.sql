-- Education System consolidated release patch for 2026-07-24.
-- Import this file once in a production database that has not imported the
-- four 2026-07-23 atomic patches or the 2026-07-24 distribution patch.
-- Do not import both this bundle and the individual files.

-- 1. Disable automatic virtual-payment reconciliation.
UPDATE `eb_system_timer`
SET
  `is_open` = 0,
  `content` = 'Manual or on-demand reconciliation only; background timer disabled'
WHERE `mark` = 'virtualPaymentReconcile'
  AND `is_del` = 0;

-- 2. Backend-managed offline locations.
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

-- 3. Mini program agreements.
UPDATE `eb_agreement`
SET
  `title` = '训练营服务协议',
  `content` = '<h2>一、服务内容</h2><p>21天线上特训营提供直播课程、打卡陪跑及约定期限内的答疑服务。支付完成并经微信确认后，系统开通永久会员身份；开营、入群及具体学习安排由工作人员联系。</p><h2>二、支付与售后</h2><p>订单价格以支付确认页展示为准。如发生重复扣款、支付成功未开通或需要申请退款，请联系客服。退款由工作人员核实后人工处理，并同步处理会员权益。</p><h2>三、学习效果</h2><p>学习效果受参与程度、家庭配合和个人情况影响，训练营不承诺特定分数、排名或升学结果。</p><h2>四、用户责任</h2><p>用户应提供真实必要的信息，合理使用课程资料，不得擅自传播、转售或用于违法用途。</p>'
WHERE `type` = 1
  AND `title` = '付费会员协议';

UPDATE `eb_agreement`
SET
  `title` = '隐私政策',
  `content` = '<h2>一、我们处理的信息</h2><p>为提供登录、报名、支付、训练营服务、邀请和提现功能，我们会处理微信身份标识、联系方式、报名信息、订单、邀请和服务记录。</p><h2>二、使用目的</h2><p>信息用于身份识别、订单履行、训练营服务联系、安全审计及依法处理售后事项，不用于与本项目无关的用途。</p><h2>三、未成年人信息</h2><p>孩子姓名、年龄、性别和学习情况应由监护人填写或在监护人授权下填写，仅用于训练营服务。</p><h2>四、信息保护与权利</h2><p>我们采取合理措施保护信息安全。您可通过客服申请查询、更正或删除依法可以处理的信息；订单、支付和必要审计记录将按法律要求保留。</p>'
WHERE `type` = 3
  AND `title` = '隐私协议';

INSERT INTO `eb_agreement`
(`type`, `title`, `content`, `sort`, `status`, `add_time`)
SELECT
  9,
  '报名信息使用说明',
  '<h2>一、信息用途</h2><p>孩子姓名、年龄、性别、学习问题和联系电话用于老师了解情况、安排训练营服务和后续沟通，不用于与训练营无关的营销。</p><h2>二、监护人确认</h2><p>提交未成年人信息前，请确认您是其监护人或已取得监护人授权，并确保填写内容真实、必要。</p><h2>三、修改与删除</h2><p>您可以在小程序内修改报名信息。如需删除或停止使用，请联系客服处理，法律法规要求保留的订单和审计记录除外。</p><h2>四、退款与权益</h2><p>退款由工作人员人工审核处理；退款完成后，会员权益和相关业务资格将按审核结论人工撤销或保留。</p>',
  0,
  1,
  UNIX_TIMESTAMP()
WHERE NOT EXISTS (
  SELECT 1 FROM `eb_agreement` WHERE `type` = 9
);

UPDATE `eb_system_menus`
SET `menu_name` = '小程序协议', `mark` = '训练营服务协议、隐私政策和报名信息说明'
WHERE `unique_auth` = 'admin-user-grade-agreement';

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'读取小程序协议','setting/get_agreement/<type>','GET','[]',2,1,1,1,2,'admin-user-miniapp-agreement-read',0,'读取训练营、隐私和报名信息协议'
FROM `eb_system_menus`
WHERE `unique_auth` = 'admin-user-grade-agreement'
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus` WHERE `unique_auth` = 'admin-user-miniapp-agreement-read'
  );

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'保存小程序协议','setting/save_agreement','POST','[]',1,1,1,1,2,'admin-user-miniapp-agreement-save',0,'保存训练营、隐私和报名信息协议'
FROM `eb_system_menus`
WHERE `unique_auth` = 'admin-user-grade-agreement'
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus` WHERE `unique_auth` = 'admin-user-miniapp-agreement-save'
  );

-- 4. Monthly withdrawal application window.
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

-- 5. Training-camp distribution identities and fixed commissions.
-- eb_user.agent_level mapping:
-- 0 = C普通会员（系统默认，不在等级表中）
-- 1 = M盟友，2 = D代理，3及以上按H合伙人处理

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
