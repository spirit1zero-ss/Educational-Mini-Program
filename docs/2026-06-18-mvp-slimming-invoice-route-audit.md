# 2026-06-18 MVP Invoice Route Audit

## Scope

This note records the follow-up audit for disabled MVP invoice routes. This round does not delete code, change payment, or change the order state machine.

## Change

- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
  - Added `admin_route_block_patterns.enable_invoice` rules for backend order-invoice routes.
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/order.php`
  - Mounted the existing `MvpRouteBlockMiddleware` on the backend order route group.
  - The middleware only intercepts precisely configured disabled MVP rules. Core order routes continue through the original auth/business flow.

## Docker Validation

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

## Risk Notes

- Invoice remains a P2 cautious deletion candidate. This round only intercepts routes through `enable_invoice=false`; it does not delete invoice controllers, services, models, or data tables.
- The order route group now executes MVP middleware before backend authentication. The current rule is narrow; future route interception rules must avoid broad `order/` matching.
- Logistics and delivery routes are coupled with order fulfillment and remain unchanged in this round.

## 2026-06-22 Invoice Runtime Metadata Recheck

### Result

No physical deletion was made in this slice. Invoice business data is currently empty, but invoice route docs, menu records, install/upgrade seeds, order relations, payment-success hooks, cron hooks, user-invoice services, and order-invoice models are still part of the broader order system.

### Layer Decision Matrix

| Layer | Status | Decision |
| --- | --- | --- |
| Mobile frontend pages | Invoice views remain outside MVP scope. | Keep hidden/blocked for now; do not delete until order-confirmation and order-detail dependencies are reviewed. |
| Admin frontend pages | Invoice management and electronic-invoice menu metadata still exists. | Retain. These rows are seeded by install/upgrade records. |
| Mobile API routes | `v2/invoice/*`, `v2/order/invoice_list`, `v2/order/invoice_detail/*`, and `v2/order/make_up_invoice` are covered by `enable_invoice=false`. | Retain routes with soft blocking. |
| Backend/admin routes | `order/invoice/*`, `order/invoice_order_info/*`, and electronic-invoice helper paths are covered by `enable_invoice=false` where the route exists. | Retain routes with soft blocking. |
| API route docs | Runtime `eb_system_route` still has 15 matching invoice records. | Retain. They are seeded by install SQL and are not isolated stale residue. |
| Controllers | Backend `StoreOrderInvoice`, mobile `UserInvoiceController`, out-api invoice methods, and related order controllers still reference invoice behavior. | Retain. Removing them requires a wider order/integration refactor. |
| Services | `StoreOrderInvoiceServices`, `UserInvoiceServices`, `ServeServices::invoice`, cron, listener, and payment/offline-payment services still reference invoice behavior. | Retain. Disable entry points first; do not cut shared order hooks in this slice. |
| DAO/Model | `StoreOrderInvoice`, `UserInvoice`, and order relation models still exist. | Retain. Table/model removal requires data and order-detail compatibility work. |
| Menu and permission records | Runtime `eb_system_menus` still has 7 matching invoice records. | Retain for now. These records are also present in install/upgrade metadata. |
| Data rows | Checked runtime rows: `eb_user_invoice` is `0`, `eb_store_order_invoice` is `0`, and active order-invoice rows are `0`. | No business-data cleanup needed in this slice. |
| Install SQL and upgrade records | `public/install/crmeb.sql` and `UpgradeController` contain invoice menu/API records. | Retain. Do not partially delete seeded records without install/upgrade compatibility work. |

### Runtime Checks

| Path | HTTP | Payload status | Result |
| --- | --- | --- | --- |
| `/adminapi/order/invoice/list?page=1&limit=1` | `200` | `400` | `MVP module disabled` |
| `/adminapi/order/invoice/chart` | `200` | `400` | `MVP module disabled` |
| `/adminapi/setting/elec_invoice` | `404` | N/A | No active route was found in this runtime. |
| `/api/v2/invoice` | `200` | `400` | `MVP module disabled` |
| `/api/v2/order/invoice_list` | `200` | `400` | `MVP module disabled` |
| `/api/product/detail/1` | `200` | `200` | Control path remains healthy. |

### Next Step

Continue with store pickup/write-off metadata only after confirming whether `order/check_shipping`, order confirmation, delivery selection, and backend order operations still depend on store/self-pickup branches.
