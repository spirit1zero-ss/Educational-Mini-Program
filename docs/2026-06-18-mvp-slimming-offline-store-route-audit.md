# 2026-06-18 MVP Offline Payment and Store Pickup Route Audit

## Goal

Complete MVP disabling protection for mobile offline payment and store-list interfaces. At this stage, code is not deleted, the order state machine is not changed, and WeChat payment plus ordinary order creation remain unaffected.

## Positioning

| Area | Location | Conclusion |
| --- | --- | --- |
| Offline payment API | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `order/offline/check/price`, `order/offline/create`, and `order/offline/pay/type` belong to the offline-payment flow. |
| Store-list API | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `store_list` belongs to the store/self-pickup scenario. |
| Ordinary order API | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `order/create`, `order/pay`, `order/detail`, and `order/list` must be preserved. |
| MVP API protection | `src/CRMEB/CRMEB-master/crmeb/app/api/middleware/MvpRouteBlockMiddleware.php` | Supports route interception and logging based on configuration. |

## Change

- Added MVP switches:
  - `enable_offline_payment=false`
  - `enable_store_pickup=false`
- Added `api_route_block_patterns.enable_offline_payment`:
  - `order/offline/`
- Added `api_route_block_patterns.enable_store_pickup`:
  - `store_list`

## Preservation Boundary

The following MVP core flows are not affected by this change:

- General order confirmation, order creation, order payment, order details, order list, and receipt confirmation.
- WeChat payment initiation and payment callback.
- Basic secondary distribution relationships, commission generation, and commission viewing.
- Sign-in, membership, and evaluation.
- Backend order viewing.

`order/check_shipping` was not intercepted in this round because it may participate in delivery-method decisions on the order confirmation page. Run a second dependency check before physically deleting store/self-pickup code.

## Docker Validation

PHP lint:

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

Disabled interface spot checks:

```bash
curl -i http://127.0.0.1:8080/api/order/offline/pay/type
curl -i -X POST http://127.0.0.1:8080/api/order/offline/check/price
curl -i -X POST http://127.0.0.1:8080/api/order/offline/create
curl -i http://127.0.0.1:8080/api/store_list
```

Expected result:

```json
{"status":400,"msg":"MVP module disabled"}
```

Preserved interface sampling:

```bash
curl -i http://127.0.0.1:8080/api/order/list
curl -i http://127.0.0.1:8080/api/order/detail/test
curl -i -X POST http://127.0.0.1:8080/api/order/pay
curl -i http://127.0.0.1:8080/adminapi/order/info/1
```

Expected result:

- The response does not return `MVP module disabled`.
- When unauthenticated, the original CRMEB login-state error can be returned.

## Risk Notes

- Offline payment and store pickup may be coupled with the old order confirmation UI. Currently only the independent API entry is intercepted, and the page is not physically deleted.
- After `store_list` is intercepted, the store selection page is unavailable. This matches the current MVP boundary of not supporting store pickup.
- `order/check_shipping` is temporarily preserved to avoid breaking order confirmation if it depends on this API.

## 2026-06-22 Offline Payment Runtime Recheck

### Result

No physical deletion was made in this slice. Offline payment has no runtime business rows in the checked tables, but its route docs, menu/permission records, order service branches, statistics, refund, bill, membership-right, and install/upgrade seeds are still interwoven with the broader order system. Treat it as a soft-disabled shared order capability for now.

### Layer Decision Matrix

| Layer | Status | Decision |
| --- | --- | --- |
| Mobile frontend pages | Offline payment pages and store-pickup pages are outside MVP scope. | Keep hidden/blocked for now; do not delete until order-confirmation dependencies are rechecked. |
| Admin frontend pages | Backend offline cashier and offline confirmation entries still exist in menu metadata. | Retain. They are blocked at route level and reseeded by install/upgrade records. |
| Mobile API routes | `order/offline/check/price`, `order/offline/create`, and `order/offline/pay/type` are covered by `enable_offline_payment=false`. | Retain routes with soft blocking. |
| Backend/admin routes | `order/pay_offline/<id>`, `order/offline_scan`, and `order/scan_list` are covered by `enable_offline_payment=false`. | Retain routes with soft blocking. |
| API route docs | Runtime `eb_system_route` still has 6 matching offline-payment records. | Retain. They are seeded by install/upgrade metadata and are not isolated stale residue. |
| Controllers | `OtherOrderController`, backend `OtherOrder`, backend `StoreOrder`, and related order controllers still contain offline-payment or offline-scan branches. | Retain. Removal would require a larger order/payment refactor. |
| Services | `OrderOfflineServices`, `OtherOrderServices`, `StoreOrderServices`, `StoreOrderComputedServices`, stats, bill, refund, and membership-right services still reference offline payment. | Retain. Disable entry points first; do not cut shared order logic in this slice. |
| DAO/Model | `StoreOrder` and related order models still allow `pay_type='offline'` branches. | Retain. Enum cleanup needs a wider order data migration plan. |
| Menu and permission records | Runtime `eb_system_menus` still has 5 matching offline-payment records. | Retain for now. These records are also present in upgrade metadata. |
| Data rows | Checked runtime rows: `eb_store_order.pay_type='offline'` is `0`, `eb_other_order.type='offline_scan'` is `0`, and `eb_user_bill.type='offline_scan'` is `0`. | No business-data cleanup needed in this slice. |
| Install SQL and upgrade records | `UpgradeController` contains offline cashier, confirmation, and offline scan menu records. | Retain. Do not partially remove seeded records without install/upgrade compatibility work. |

### Runtime Checks

| Path | HTTP | Payload status | Result |
| --- | --- | --- | --- |
| `/api/order/offline/pay/type` | `200` | `400` | `MVP module disabled` |
| `/api/order/offline/check/price` | `200` | `400` | `MVP module disabled` |
| `/api/order/offline/create` | `200` | `400` | `MVP module disabled` |
| `/adminapi/order/pay_offline/1` | `200` | `400` | `MVP module disabled` |
| `/adminapi/order/offline_scan` | `200` | `400` | `MVP module disabled` |
| `/adminapi/order/scan_list?page=1&limit=1` | `200` | `400` | `MVP module disabled` |
| `/api/product/detail/1` | `200` | `200` | Control path remains healthy. |

### Next Step

Continue with invoice metadata next. It has a similar profile: disabled routes exist, but controller/service/table and seeded metadata should be retained unless a narrower stale residue can be proven.
