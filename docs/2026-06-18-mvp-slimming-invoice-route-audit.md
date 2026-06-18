# 2026-06-18 MVP invoice route audit

## Scope

This note records the follow-up audit for disabled MVP invoice routes. It does not delete code, change payment, or change the order state machine.

## Change

- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
  - Added `admin_route_block_patterns.enable_invoice` rules for backend order invoice routes.
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/order.php`
  - Mounted the existing `MvpRouteBlockMiddleware` on the backend order route group.
  - The middleware only blocks exact disabled MVP patterns. Core order routes still pass through the original auth/business flow.

## Docker validation

PHP lint:

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php -l app/adminapi/route/order.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

HTTP checks:

| Path | Expected result |
| --- | --- |
| `/adminapi/order/invoice/list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/order/invoice/chart` | `{"status":400,"msg":"MVP module disabled"}` |
| `/api/v2/invoice` | `{"status":400,"msg":"MVP module disabled"}` |
| `/api/v2/order/invoice_list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/order/info/1` | Original backend auth response: `401` |
| `/adminapi/marketing/sign/rewards` | Original backend auth response: `401` |
| `/api/sign/config` | Original mobile auth response: `401` |

## Risk notes

- Invoice is a P2 cautious deletion candidate. This change only blocks routes while `enable_invoice=false`; it does not remove invoice controllers, services, models, or tables.
- The order route group now executes the MVP middleware before admin auth. Current rules are narrow, but future route block patterns must avoid broad `order/` matches.
- Logistics and delivery routes remain untouched because they are coupled to order fulfillment.
