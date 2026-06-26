# 2026-06-18 MVP system routing audit
## scope
This article records the supplementary audit of backend routing that has hidden front-end entries in MVP mode. In this round, codes will not be deleted, payments will not be modified, order behavior will not be modified, and membership or check-in functions will not be affected.
## Change
- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
  - Added `enable_receipt_printer=false`.
  - Added background routing interception rules for receipt printers.
  - Supplement external API account/interface background routing interception rules.
  - Supplement the back-end invoice setting matching rules to be consistent with the hidden front-end entrance.
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/system.php`
  - Mount the existing `MvpRouteBlockMiddleware` for the main system routing group.
  - Only configured disabled path matching is intercepted; core system routing continues with the original authentication and business processes.
## Docker verification
PHP syntax check:
```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php -l app/adminapi/route/system.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

HTTP inspection:
| Path | Expected results || --- | --- |
| `/adminapi/system/ticket/list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/setting/system_out_account/index` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/setting/system_out_interface/list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/order/elec_invoice_config` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/system/config/storage` | Keep the original background authentication response: `401` || `/adminapi/user/member/ship` | Keep the original background authentication response: `401` || `/api/sign/config` | Keep the original mobile terminal authentication response: `401` |
## illustrate
- `/adminapi/setting/elec_invoice` is the background front-end route, not the back-end route in the current code; direct HTTP access returns `404`.
- The currently valid backend e-invoice configuration route is `/adminapi/order/elec_invoice_config`, which is blocked by the invoice rule.
- Subsequent system routing interception rules must remain precise and do not add broad `system/` matching.