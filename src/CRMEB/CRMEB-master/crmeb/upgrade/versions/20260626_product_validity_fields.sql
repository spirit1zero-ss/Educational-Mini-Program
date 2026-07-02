-- up
-- 商品有效期改造：将原繁琐的虚拟商品类型简化为两种有效期类型
--   validity_type = 0 长期有效商品
--   validity_type = 1 有限期商品
--     expire_mode = 1 固定到期日（valid_end_time，过期后全场不可购买）
--     expire_mode = 2 购买后 N 天（valid_days，按用户购买时间起算）
--   validity_name 为可选的自定义类型名称，支持后台/前端传入覆盖默认名称
ALTER TABLE `eb_store_product`
  ADD COLUMN `validity_type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '商品有效期类型 0长期有效 1有限期' AFTER `gift_price`,
  ADD COLUMN `validity_name` varchar(64) NOT NULL DEFAULT '' COMMENT '商品类型自定义名称' AFTER `validity_type`,
  ADD COLUMN `expire_mode` tinyint(1) NOT NULL DEFAULT '0' COMMENT '有限期失效方式 0无 1固定到期日 2购买后N天' AFTER `validity_name`,
  ADD COLUMN `valid_end_time` int(11) NOT NULL DEFAULT '0' COMMENT '固定到期日时间戳' AFTER `expire_mode`,
  ADD COLUMN `valid_days` int(11) NOT NULL DEFAULT '0' COMMENT '购买后有效天数' AFTER `valid_end_time`;

-- down
ALTER TABLE `eb_store_product`
  DROP COLUMN `validity_type`,
  DROP COLUMN `validity_name`,
  DROP COLUMN `expire_mode`,
  DROP COLUMN `valid_end_time`,
  DROP COLUMN `valid_days`;
