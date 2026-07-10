-- Training camp member registration form.
-- Stores structured miniapp form data only; no file upload is introduced.

CREATE TABLE IF NOT EXISTS `eb_training_camp_registration` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `uid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户UID',
  `order_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '关联已支付other_order.id',
  `order_sn` varchar(32) NOT NULL DEFAULT '' COMMENT '关联已支付other_order.order_id',
  `child_name` varchar(32) NOT NULL DEFAULT '' COMMENT '孩子姓名',
  `child_age` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '年龄',
  `child_gender` varchar(16) NOT NULL DEFAULT '' COMMENT '性别：male/female/unknown',
  `problems` varchar(255) NOT NULL DEFAULT '[]' COMMENT '主要问题JSON数组',
  `other_problem` varchar(255) NOT NULL DEFAULT '' COMMENT '其它问题说明',
  `contact_phone` varchar(20) NOT NULL DEFAULT '' COMMENT '联系电话',
  `add_time` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '添加时间',
  `update_time` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '更新时间',
  `is_del` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid_unique` (`uid`),
  KEY `order_id` (`order_id`),
  KEY `order_sn` (`order_sn`),
  KEY `contact_phone` (`contact_phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='训练营会员登记表';

INSERT INTO `eb_system_menus`
(`pid`, `icon`, `menu_name`, `module`, `controller`, `action`, `api_url`, `methods`, `params`, `sort`, `is_show`, `is_show_path`, `access`, `menu_path`, `path`, `auth_type`, `header`, `is_header`, `unique_auth`, `is_del`, `mark`)
SELECT 731, '', '报名登记表', 'admin', '', '', '', '', '[]', 3, 1, 1, 1, '/user/grade/registration', '', 1, '', 0, 'admin-user-grade-registration', 0, '报名登记表'
WHERE NOT EXISTS (
  SELECT 1 FROM `eb_system_menus` WHERE `unique_auth` = 'admin-user-grade-registration'
);

INSERT INTO `eb_system_menus`
(`pid`, `icon`, `menu_name`, `module`, `controller`, `action`, `api_url`, `methods`, `params`, `sort`, `is_show`, `is_show_path`, `access`, `menu_path`, `path`, `auth_type`, `header`, `is_header`, `unique_auth`, `is_del`, `mark`)
SELECT 731, '', '报名登记表列表', 'adminapi', 'v1.user.member.TrainingCampRegistration', 'index', 'user/member/registration', 'GET', '[]', 0, 0, 0, 1, '', '', 2, '', 0, 'admin-user-grade-registration-list', 0, '报名登记表列表'
WHERE NOT EXISTS (
  SELECT 1 FROM `eb_system_menus` WHERE `unique_auth` = 'admin-user-grade-registration-list'
);
