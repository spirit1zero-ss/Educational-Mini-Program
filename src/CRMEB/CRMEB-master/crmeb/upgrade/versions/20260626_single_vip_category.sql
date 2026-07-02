-- up
-- 商品分类收口：仅保留唯一分类 VIP，其余分类隐藏（数据保留，可恢复）
-- 1) 隐藏除 VIP 外的全部分类
UPDATE `eb_store_category` SET `is_show` = 0 WHERE `cate_name` <> 'VIP';
-- 2) 若不存在 VIP 分类则创建一个顶级 VIP 分类
INSERT INTO `eb_store_category` (`pid`, `cate_name`, `sort`, `pic`, `is_show`, `add_time`)
SELECT 0, 'VIP', 0, '', 1, UNIX_TIMESTAMP()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `eb_store_category` WHERE `cate_name` = 'VIP');
-- 3) 确保 VIP 分类为显示状态
UPDATE `eb_store_category` SET `is_show` = 1 WHERE `cate_name` = 'VIP';

-- down
-- 回滚：重新显示所有分类（注意：无法精确还原此前各分类的显隐状态，此处统一显示）
UPDATE `eb_store_category` SET `is_show` = 1;
