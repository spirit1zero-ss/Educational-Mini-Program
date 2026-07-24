-- The project uses manual reconciliation and an on-demand user order check.
-- Keep the implementation available, but never run it as a background timer.
UPDATE `eb_system_timer`
SET
  `is_open` = 0,
  `content` = 'Manual or on-demand reconciliation only; background timer disabled'
WHERE `mark` = 'virtualPaymentReconcile'
  AND `is_del` = 0;
