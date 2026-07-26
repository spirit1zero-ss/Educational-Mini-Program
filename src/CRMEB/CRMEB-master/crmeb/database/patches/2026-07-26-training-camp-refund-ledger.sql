-- 2026-07-26 dedicated training-camp commission refund ledger type.
-- Prerequisite: 2026-07-26-training-camp-distribution-refund.sql.
--
-- Older code used the generic "refund" type. Rename only rows linked to a
-- training-camp order so miniapp commission history can display them safely.

UPDATE `eb_user_brokerage` AS `b`
INNER JOIN `eb_miniapp_training_camp_order` AS `c`
  ON `b`.`link_id` = CAST(`c`.`other_order_id` AS CHAR)
SET `b`.`type` = 'training_camp_commission_refund',
    `b`.`title` = '训练营退款扣回佣金'
WHERE `b`.`type` = 'refund'
  AND `b`.`pm` = 0;
