# 2026-06-18 MVP system route audit

## Scope

This note records a follow-up audit for admin routes whose frontend entries are hidden in MVP mode. It does not delete code, change payment, change order behavior, or change member/sign-in behavior.

## Change

- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
  - Added `enable_receipt_printer=false`.
  - Added admin route block rules for receipt-printer routes.
  - Added admin route block rules for external API account/interface routes.
  - Added a backend invoice setting pattern for consistency with the hidden admin frontend entry.
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/system.php`
  - Mounted the existing `MvpRouteBlockMiddleware` on the main system route group.
  - Only configured disabled-path matches are blocked. Core system routes continue through the original auth/business flow.

## Docker validation

PHP lint:

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php -l app/adminapi/route/system.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

HTTP checks:

| Path | Expected result |
| --- | --- |
| `/adminapi/system/ticket/list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/setting/system_out_account/index` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/setting/system_out_interface/list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/order/elec_invoice_config` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/system/config/storage` | Original backend auth response: `401` |
| `/adminapi/user/member/ship` | Original backend auth response: `401` |
| `/api/sign/config` | Original mobile auth response: `401` |

## Notes

- `/adminapi/setting/elec_invoice` is an admin frontend route, not a backend route in the current code; direct HTTP access returns `404`.
- The active backend electronic-invoice configuration route is `/adminapi/order/elec_invoice_config`, which is blocked by the invoice rules.
- Future system route block patterns must remain narrow; do not add broad `system/` matches.
