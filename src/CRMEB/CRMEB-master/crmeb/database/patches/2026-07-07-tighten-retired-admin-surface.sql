-- Hide retired CRMEB mall/admin surfaces for the education miniapp build.
-- This is reversible: set is_show/is_show_path back to 1 for specific rows if
-- a disabled module is intentionally reintroduced.

UPDATE `eb_system_config`
SET `value` = '0'
WHERE `menu_name` = 'product_chain_enabled';

UPDATE `eb_system_menus`
SET `is_show` = 0,
    `is_show_path` = 0
WHERE `is_del` = 0
  AND (
    `id` IN (4, 135)
    OR `path` = '4' OR `path` LIKE '4/%'
    OR `path` = '135' OR `path` LIKE '135/%'
    OR `menu_path` IN ('/order', '/app', '/product', '/marketing')
    OR `unique_auth` IN ('admin-order', 'admin-app', 'admin-product', 'admin-marketing')
    OR
    LOWER(CONCAT_WS(' ', `menu_name`, `menu_path`, `api_url`, `unique_auth`, `mark`, `module`, `controller`, `action`)) REGEXP
      '(product|store_product|store-product|order/|store_order|store-order|refund|store_refund|marketing|integral|point|sign/|coupon|bargain|combination|seckill|presell|advance|recharge|live|lottery|cms|article|news|special|kefu|customer_service|store_service|speechcraft|feedback|auto_reply|wechat|wechat_qrcode|routine/ci|routine/download|routine/scheme|pages|diy|theme|micro_page|freight|shipping|delivery_service|invoice|offline_payment|store_pickup|self_pick|system_store|store-staff|ticket|division|system_out_account|system_out_interface|system/upgrade|system/crud|system/file|file/|upload|video_upload|online_upload)'
  );

-- Keep the member system enabled. CRMEB stores the member menus under the
-- marketing root by default, so move that subtree under User before hiding
-- the retired marketing surface.
UPDATE `eb_system_menus`
SET `pid` = 9,
    `path` = '9',
    `is_show` = 1,
    `is_show_path` = 1
WHERE `id` = 731;

UPDATE `eb_system_menus`
SET `path` = REPLACE(`path`, '27/731', '9/731')
WHERE `is_del` = 0
  AND (`path` = '27/731' OR `path` LIKE '27/731/%');

UPDATE `eb_system_menus`
SET `is_show` = 1,
    `is_show_path` = 1
WHERE `is_del` = 0
  AND (
    `id` IN (731, 751, 762, 763, 765, 1075, 2798, 2799, 2800, 2801, 2811, 2812, 2815, 2816, 2817, 2818, 2819)
    OR `path` = '9/731' OR `path` LIKE '9/731/%'
    OR `api_url` LIKE 'user/member%'
    OR `api_url` LIKE 'export/member_card%'
    OR `unique_auth` IN ('user-user-grade', 'admin-user-member-type', 'admin-user-grade-card', 'admin-user-grade-record', 'admin-user-grade-right', 'setting-member-config')
    OR `unique_auth` LIKE 'user-member%'
    OR `unique_auth` LIKE 'member-%'
    OR `unique_auth` LIKE 'export-member_card%'
  );
