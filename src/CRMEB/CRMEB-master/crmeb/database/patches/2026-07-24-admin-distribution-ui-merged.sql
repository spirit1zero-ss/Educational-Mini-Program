-- 2026-07-24 post-release merged admin increment.
--
-- Prerequisite:
--   2026-07-24-release.sql has already been imported.
--
-- This single file merges the remaining database-side work for:
--   1. admin menu cleanup;
--   2. mini-program agreement content and editor permissions;
--   3. fixed-commission distribution policy menu and read permission;
--   4. per-user distribution overview/team permissions;
--   5. training-camp commission settlement review permissions.
--
-- All INSERT statements are guarded by unique_auth checks. Re-importing this
-- file does not create duplicate menu permissions.

-- Hide the legacy paid-member switches. The training-camp checkout has its own
-- order and payment flow, while member-card redemption remains enabled in data.
UPDATE `eb_system_menus`
SET `is_show` = 0,
    `is_show_path` = 0
WHERE `unique_auth` = 'setting-member-config'
  AND `is_del` = 0;

-- Hide legacy integrations: logistics, electronic waybills, SMS, mall payment,
-- Yihaotong and storage configuration. Keep the implementation for future use.
UPDATE `eb_system_menus`
SET `is_show` = 0,
    `is_show_path` = 0
WHERE `is_del` = 0
  AND (
    `unique_auth` = 'setting-other'
    OR `path` = '12/1056'
    OR `path` LIKE '12/1056/%'
  );

-- Hide the generic CRMEB agreement menu. The current admin bundle has no
-- matching /setting/agreement route, so this entry only opens a blank page.
-- Mini-program agreement APIs and stored agreement data remain untouched.
UPDATE `eb_system_menus`
SET `is_show` = 0,
    `is_show_path` = 0
WHERE `is_del` = 0
  AND (
    `unique_auth` = 'setting-agreement'
    OR `path` = '12/1061'
    OR `path` LIKE '12/1061/%'
  );

-- Keep the database-managed agreement copy initially identical to the current
-- mini-program fallback copy. Administrators can update it later from the
-- focused Paid Membership > Mini Program Agreements page.
UPDATE `eb_agreement`
SET `title` = '训练营服务协议',
    `content` = '<h2>训练营服务说明</h2><p>训练营提供直播课程、打卡陪跑和约定期限内的答疑服务。支付完成并经微信确认后开通永久会员身份；具体开营和入群安排由工作人员联系。</p><h3>支付与退款</h3><p>如发生重复扣款、支付成功未开通或需要退款，请联系客服。退款由工作人员核实后人工处理，并同步处理会员权益。</p><h3>学习效果</h3><p>学习效果受参与程度和个体情况影响，训练营不承诺特定分数或升学结果。</p>',
    `status` = 1
WHERE `type` = 1;

UPDATE `eb_agreement`
SET `title` = '隐私政策',
    `content` = '<h2>我们收集的信息</h2><p>为提供登录、报名、支付、训练营服务、邀请和提现功能，我们会处理微信身份标识、联系方式、报名信息、订单和服务记录。</p><h3>信息用途</h3><p>上述信息仅用于身份识别、订单履行、服务联系、安全审计和依法处理售后事项。未成年人信息应由监护人填写并授权。</p><h3>信息保护</h3><p>我们采取合理措施保护信息安全。您可通过客服申请查询、更正或删除依法可以处理的信息。</p>',
    `status` = 1
WHERE `type` = 3;

UPDATE `eb_agreement`
SET `title` = '报名信息使用说明',
    `content` = '<h2>信息用途</h2><p>孩子姓名、年龄、性别、学习问题和联系电话用于老师了解情况、安排训练营服务和后续沟通，不用于与训练营无关的营销。</p><h3>监护人确认</h3><p>提交未成年人信息前，请确认您是其监护人或已取得监护人授权，并确保填写内容真实、必要。</p><h3>修改与删除</h3><p>您可以在小程序内修改报名信息；如需删除或停止使用，请联系客服处理，法律法规要求保留的订单和审计记录除外。</p>',
    `status` = 1
WHERE `type` = 9;

INSERT INTO `eb_agreement`
(`type`,`title`,`content`,`sort`,`status`,`add_time`)
SELECT
  9,
  '报名信息使用说明',
  '<h2>信息用途</h2><p>孩子姓名、年龄、性别、学习问题和联系电话用于老师了解情况、安排训练营服务和后续沟通，不用于与训练营无关的营销。</p><h3>监护人确认</h3><p>提交未成年人信息前，请确认您是其监护人或已取得监护人授权，并确保填写内容真实、必要。</p><h3>修改与删除</h3><p>您可以在小程序内修改报名信息；如需删除或停止使用，请联系客服处理，法律法规要求保留的订单和审计记录除外。</p>',
  0,
  1,
  UNIX_TIMESTAMP()
WHERE NOT EXISTS (
  SELECT 1 FROM `eb_agreement` WHERE `type` = 9
);

-- The old distribution-level entry belongs to the retired marketing tree.
UPDATE `eb_system_menus`
SET `is_show` = 0,
    `is_show_path` = 0
WHERE `unique_auth` = 'admin-setting-membership_level-index'
  AND `is_del` = 0;

-- Add the fixed training-camp distribution policy to Paid Membership.
INSERT INTO `eb_system_menus`
(`pid`,`icon`,`menu_name`,`module`,`sort`,`is_show`,`is_show_path`,`access`,`menu_path`,`path`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'','分销政策','admin',1,1,1,1,'/setting/membership_level/index','',1,'admin-user-grade-distribution-policy',0,'训练营分销身份、初始名额和固定返佣'
FROM `eb_system_menus`
WHERE `unique_auth` = 'user-user-grade'
  AND `is_del` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-user-grade-distribution-policy'
  )
LIMIT 1;

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'读取训练营分销政策','agent/level','GET','[]',2,1,1,1,2,'admin-user-grade-distribution-policy-read',0,'读取C/M/D/H固定返佣与团队初始名额'
FROM `eb_system_menus`
WHERE `unique_auth` = 'admin-user-grade-distribution-policy'
  AND `is_del` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-user-grade-distribution-policy-read'
  )
LIMIT 1;

-- User management keeps the entry; these permissions expose the on-demand
-- distribution account drawer without adding another top-level menu.
INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'查看用户分销详情','user/user/<uid>/distribution','GET','[]',2,1,1,1,2,'admin-user-distribution-overview',0,'查看用户身份、名额、团队与收入状态'
FROM `eb_system_menus`
WHERE `unique_auth` = 'admin-user-user-index'
  AND `is_del` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-user-distribution-overview'
  )
LIMIT 1;

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'查看用户有效团队','user/user/<uid>/distribution/team','GET','[]',1,1,1,1,2,'admin-user-distribution-team',0,'查看一级、二级有效支付团队明细'
FROM `eb_system_menus`
WHERE `unique_auth` = 'admin-user-user-index'
  AND `is_del` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-user-distribution-team'
  )
LIMIT 1;

-- Finance > Commission Records now includes an explicit manual settlement
-- review for training-camp fixed commissions.
INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'读取训练营佣金结算','finance/finance/member_commission_list','GET','[]',2,1,1,1,2,'admin-finance-member-commission-list',0,'读取一级、二级固定佣金的待结算、可提现和撤销记录'
FROM `eb_system_menus`
WHERE `unique_auth` = 'finance-finance-commission'
  AND `is_del` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-finance-member-commission-list'
  )
LIMIT 1;

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'审核训练营佣金结算','finance/finance/member_commission/<id>/review','PUT','[]',1,1,1,1,2,'admin-finance-member-commission-review',0,'人工通过或驳回训练营固定佣金结算'
FROM `eb_system_menus`
WHERE `unique_auth` = 'finance-finance-commission'
  AND `is_del` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-finance-member-commission-review'
  )
LIMIT 1;

-- Add a focused mini-program agreement editor to Paid Membership.
INSERT INTO `eb_system_menus`
(`pid`,`icon`,`menu_name`,`module`,`sort`,`is_show`,`is_show_path`,`access`,`menu_path`,`path`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'','小程序协议','admin',0,1,1,1,'/user/grade/agreement','',1,'admin-user-grade-agreement',0,'训练营服务协议、隐私政策和报名信息说明'
FROM `eb_system_menus`
WHERE `unique_auth` = 'user-user-grade'
  AND `is_del` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-user-grade-agreement'
  )
LIMIT 1;

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'读取小程序协议','setting/get_agreement/<type>','GET','[]',2,1,1,1,2,'admin-user-miniapp-agreement-read',0,'读取训练营、隐私和报名信息协议'
FROM `eb_system_menus`
WHERE `unique_auth` = 'admin-user-grade-agreement'
  AND `is_del` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-user-miniapp-agreement-read'
  )
LIMIT 1;

INSERT INTO `eb_system_menus`
(`pid`,`menu_name`,`api_url`,`methods`,`params`,`sort`,`is_show`,`is_show_path`,`access`,`auth_type`,`unique_auth`,`is_del`,`mark`)
SELECT `id`,'保存小程序协议','setting/save_agreement','POST','[]',1,1,1,1,2,'admin-user-miniapp-agreement-save',0,'保存训练营、隐私和报名信息协议'
FROM `eb_system_menus`
WHERE `unique_auth` = 'admin-user-grade-agreement'
  AND `is_del` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `eb_system_menus`
    WHERE `unique_auth` = 'admin-user-miniapp-agreement-save'
  )
LIMIT 1;
