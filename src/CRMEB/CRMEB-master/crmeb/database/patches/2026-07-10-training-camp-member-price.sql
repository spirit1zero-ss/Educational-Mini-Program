-- Keep the active training camp membership price aligned with the miniapp checkout.

UPDATE `eb_member_ship`
SET `pre_price` = 399.00,
    `price` = 599.00
WHERE `id` = 4
  AND `type` = 'ever'
  AND `is_del` = 0;
