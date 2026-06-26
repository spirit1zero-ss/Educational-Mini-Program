# 2026-06-18 MVP Backend Offline/Store Route Coverage Audit

## Scope

- This round covers backend offline payment, store pickup, store staff, and write-off order routes.
- Strategy: only add MVP route interception. Do not delete route files, controllers, services, models, tables, install SQL, or runtime metadata.
- Target branch: `dev3`.

## Status Checked

- Mobile API routing already intercepts offline payment and store-list interfaces through `api_route_block_patterns`.
- Backend order routing uses `MvpRouteBlockMiddleware`.
- Backend merchant/store routing now uses `MvpRouteBlockMiddleware`, so direct access to `/adminapi/merchant/...` is covered by MVP route interception.

## Change

- `config/mvp.php`
  - Added `admin_route_block_patterns.enable_offline_payment`:
    - `order/pay_offline`
    - `order/offline_scan`
    - `order/scan_list`
  - Added `admin_route_block_patterns.enable_store_pickup`:
    - `merchant/store`
    - `merchant/store_staff`
    - `merchant/verify`
    - `export/verify_order`
- `app/adminapi/route/merchant.php`
  - Mounted the existing `MvpRouteBlockMiddleware` on the merchant/store route group.

## Preserved

- Merchant/store route definitions were not removed.
- Store, store-staff, write-off order, order, and export controllers were not deleted.
- General order list, details, payment, delivery, and refund routes were not modified.
- WeChat payment, payment callback, basic distribution, commission, sign-in, evaluation, and membership functions were not modified.
- This soft-slimming round did not implement mini-program removal.

## Validation Records

- `docker exec -w /var/www/crmeb crmeb php -l config/mvp.php`
  - Result: no syntax errors.
- `docker exec -w /var/www/crmeb crmeb php -l app/adminapi/route/merchant.php`
  - Result: no syntax errors.
- `docker exec -w /var/www/crmeb crmeb php think clear`
  - Result: `Clear Successed`.
- Disabled route checks:
  - `GET /adminapi/merchant/store` returns `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /adminapi/merchant/store_staff` returns `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /adminapi/merchant/verify_order` returns `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /adminapi/order/offline_scan` returns `{"status":400,"msg":"MVP module disabled"}`.
- Preserved route checks:
  - `GET /adminapi/order/info/1` returns the login-expiration response, not `MVP module disabled`.
  - `GET /api/product/detail/1` returns HTTP 200 business success response.

## 2026-06-22 Store Pickup and Write-Off Safety Recheck

### Result

No physical deletion was made in this slice. Store pickup and write-off data is currently empty, but the module still has route docs, menu records, install SQL, upgrade records, frontend pages, route files, controllers, services, DAO/model classes, and shared order dependencies.

The current state is safe as a soft-slimmed module: disabled entry points are blocked, while shared order confirmation and order-detail behavior remains available.

### Deletion Matrix

| Layer | Deleted? | Evidence | Decision |
| --- | --- | --- | --- |
| Frontend pages | No | Backend pages still exist under `template/admin/src/pages/setting/storeList`, `template/admin/src/pages/setting/clerkList`, and `template/admin/src/pages/setting/verifyOrder`; order and customer-service pages still reference `shipping_type=2`. | Retain. Hide or block by MVP configuration until order UI dependencies are isolated. |
| Backend pages | No | Runtime `eb_system_menus` still has 27 matching store/write-off menu or permission rows. | Retain. Records are also seeded by install/upgrade metadata. |
| API routes | No | `order/write`, `order/write_update`, `merchant/store*`, `merchant/store_staff*`, `merchant/verify*`, `export/verify_order`, `store_list`, `order/order_verific`, and `order/check_shipping` route definitions still exist. | Retain route files. Disabled entry points are soft-blocked; `order/check_shipping` remains intentionally unblocked as an order-confirmation dependency. |
| Controllers | No | `SystemStore`, `SystemStoreStaff`, `SystemVerifyOrder`, `StoreOrderController`, `PublicController`, and `ExportExcel` controller methods still exist. | Retain. Removal requires a wider order/store refactor. |
| Services | No | `SystemStoreServices`, `SystemStoreStaffServices`, `StoreOrderWriteOffServices`, `StoreOrderServices`, and export services still contain store or write-off logic. | Retain. Shared order confirmation, delivery, write-off, and order-detail paths still depend on related branches. |
| DAO/Model | No | `SystemStoreDao`, `SystemStoreStaffDao`, `SystemStore`, and `SystemStoreStaff` still exist. `StoreOrder` still carries `shipping_type`, `store_id`, and `verify_code` behavior. | Retain. DAO/model deletion would require schema and order-service changes. |
| Menu records | No | Runtime `eb_system_menus` has 27 matching store/write-off rows. | Retain for now. They are hidden by MVP menu rules and seeded by install/upgrade records. |
| Data tables | No | `eb_system_store` and `eb_system_store_staff` exist. Runtime row counts are both `0`. `eb_store_order` has no pickup orders, no nonzero `store_id`, and no `verify_code` rows. | Retain. Empty data alone is not enough to delete shared schema. |
| Install SQL / migration files | No | `public/install/crmeb.sql` and `UpgradeController` contain store, staff, write-off menu/API seed records and table definitions. | Retain. Do not partially remove seeded metadata without a full install/upgrade compatibility plan. |

### Runtime Checks

| Path | HTTP | Payload status | Result |
| --- | --- | --- | --- |
| `/adminapi/merchant/store?page=1&limit=1` | `200` | `400` | `MVP module disabled` |
| `/adminapi/merchant/store_staff?page=1&limit=1` | `200` | `400` | `MVP module disabled` |
| `/adminapi/merchant/verify_order?page=1&limit=1` | `200` | `400` | `MVP module disabled` |
| `/adminapi/export/verify_order` | `200` | `400` | `MVP module disabled` |
| `/api/store_list` | `200` | `400` | `MVP module disabled` |
| `/api/order/order_verific` | `200` | `400` | `MVP module disabled` |
| `/api/order/check_shipping` | `200` | `401` | Preserved control path; original login requirement remains. |
| `/api/product/detail/1` | `200` | `200` | Control path remains healthy. |

### Data Checks

| Metric | Count |
| --- | ---: |
| `eb_system_store` rows | `0` |
| `eb_system_store_staff` rows | `0` |
| `eb_store_order.shipping_type=2` rows | `0` |
| `eb_store_order.store_id<>0` rows | `0` |
| `eb_store_order.verify_code<>''` rows | `0` |
| Matching route-doc rows | `20` |
| Matching menu rows | `27` |

### Next Step

Before physical deletion, run an order-confirmation dependency pass over `order/check_shipping`, `StoreOrderServices::getOrderConfirmData`, `StoreOrderCreateServices::createOrder`, `StoreOrderComputedServices`, backend order list/detail actions, and customer-service order views. If those paths can be forced to express-only delivery without regressions, then store-pickup deletion can be split into a later small batch.

## 2026-06-22 Checkout Dependency Follow-Up

The order-confirmation dependency pass found one backend soft-slimming gap: a direct confirmation request with `shipping_type=2` could clear the address before price calculation while store pickup was disabled. This was hardened in the order service layer.

Updated guards:

- `StoreOrderServices::getOrderConfirmData` now forces `shipping_type=1` when `store_self_mention=0`.
- `StoreOrderServices::checkShipping` now returns express-only `type=1` when `store_self_mention=0`.
- `StoreOrderComputedServices::computedOrder` now forces `shippingType=1` when `store_self_mention=0`.

Authenticated checkout smoke result:

- A temporary user address and direct-buy cart were created through the mobile API.
- `POST /api/order/confirm` was submitted with `shipping_type=2` while store pickup was disabled.
- The confirmation response returned business success, kept the address payload, returned `store_self_mention=false`, did not return a store-pickup payload, and returned an `orderKey`.
- `POST /api/order/computed/{orderKey}` with `shipping_type=2` returned business success through the guarded express-only path.
- The temporary address was deleted after the smoke test.
- Data side-effect checks stayed clean: active smoke addresses `0`, pickup orders `0`, nonzero store-id orders `0`, and verify-code orders `0`.

No store-pickup files, routes, controllers, services, DAO/model classes, menu records, data tables, install SQL, or upgrade records were deleted in this follow-up. The change only strengthens the current soft-slimming safety boundary.

Next small batch: inspect order creation, payment callback, order detail, admin order list/detail, and customer-service order views before any store-pickup physical deletion is attempted.

## 2026-06-22 Order Write-Off Route Hardening

This pass found one additional soft-slimming gap: backend order write-off routes were still routed to normal authentication instead of the MVP disabled-module response.

Config hardening:

- `admin_route_block_patterns.enable_store_pickup` now includes `order/write`.
- `admin_route_block_patterns.enable_store_pickup` now includes `order/write_update`.
- `api_route_block_patterns.enable_store_pickup` now includes `order/order_verific`.
- `order/order_verific` was removed from `enable_complex_logistics` ownership so the write-off route is controlled by the store-pickup switch only.

Runtime checks after cache clear:

| Path | HTTP | Payload status | Result |
| --- | --- | --- | --- |
| `POST /adminapi/order/write` | `200` | `400` | `MVP module disabled` |
| `PUT /adminapi/order/write_update/NO_SUCH_ORDER` | `200` | `400` | `MVP module disabled` |
| `POST /api/order/order_verific` | `200` | `400` | `MVP module disabled` |
| `GET /adminapi/order/list?page=1&limit=1` | `200` | `401` | Preserved control path; original login requirement remains. |
| `GET /api/product/detail/1` | `200` | `200` | Control path remains healthy. |

Data checks after this pass:

| Metric | Count |
| --- | ---: |
| `eb_system_store` rows | `0` |
| `eb_system_store_staff` rows | `0` |
| `eb_store_order.shipping_type=2` rows | `0` |
| `eb_store_order.store_id<>0` rows | `0` |
| `eb_store_order.verify_code<>''` rows | `0` |
| Matching store/write-off menu rows sampled by path/API/name | `25` |

Deletion status for this pass:

| Layer | Deleted? | Current decision |
| --- | --- | --- |
| Frontend page | No | Retained. Admin and customer-service write-off UI branches still exist, but write-off routes are now soft-blocked. |
| Backend page | No | Retained. Backend order pages remain part of normal order management. |
| API route | No | Retained. Write-off routes now return `MVP module disabled` while store pickup is off. |
| Controller | No | Retained. `StoreOrder::write_order`, `StoreOrder::write_update`, and mobile admin write-off controller code still exist. |
| Service | No | Retained. `StoreOrderWriteOffServices` remains because physical removal requires a wider order-service cleanup. |
| DAO/Model | No | Retained. Order and store models still carry shared schema fields. |
| Menu records | No | Retained. Matching menu records still exist and are handled by MVP menu hiding rules. |
| Data tables | No | Retained. Store tables are empty, and order write-off fields have no active rows. |
| Install SQL / migration files | No | Retained. Seed and upgrade metadata are unchanged in this pass. |

Next small batch: hide admin/customer-service write-off UI controls as UI-only safety polish, then verify payment callback and order-detail rendering against normal express orders before any physical deletion.

## 2026-06-22 Write-Off UI Safety Polish

This pass hides write-off controls from the admin and customer-service order screens while `enable_store_pickup=false`. No pages, components, routes, controllers, services, DAO/model classes, menu records, tables, install SQL, or upgrade records were deleted.

Frontend guard changes:

- `template/admin/src/config/mvp.js` now exposes `isMvpStorePickupEnabled()`.
- `template/admin/src/pages/order/orderList/components/tableList.vue` hides the write-off tab, write-off button, immediate write-off action, and related divider when store pickup is disabled.
- `template/admin/src/pages/order/orderList/components/tableExpand.vue` hides write-off store/code fields when store pickup is disabled.
- `template/admin/src/pages/kefu/mobile/orderList/index.vue` hides the customer-service write-off action and write-off dialog when store pickup is disabled.
- Click handlers keep a defensive guard so the hidden write-off actions cannot run through these UI paths while store pickup is disabled.

Validation:

- Backend admin build passed with `npm.cmd run build`.
- The build only reported existing CSS order and asset-size warnings.
- Store-pickup write-off APIs remain soft-blocked through `MVP module disabled`.
- Normal admin order list routing remains preserved and reaches its original login requirement when called without an admin token.

Deletion status for this pass:

| Layer | Deleted? | Current decision |
| --- | --- | --- |
| Frontend page | No | Retained. Write-off controls are hidden by MVP UI guards, but the pages/components remain. |
| Backend page | No | Retained. Backend order pages still serve normal order management. |
| API route | No | Retained. Write-off routes remain soft-blocked. |
| Controller | No | Retained. No controller code was removed. |
| Service | No | Retained. No service code was removed. |
| DAO/Model | No | Retained. No DAO/model code was removed. |
| Menu records | No | Retained. Runtime menu records still exist and are handled by MVP menu hiding rules. |
| Data tables | No | Retained. Store/write-off related tables remain, with no active store-pickup rows in the latest checks. |
| Install SQL / migration files | No | Retained. No install or upgrade metadata was changed in this pass. |

Next small batch: verify payment callback and order-detail rendering against normal express orders. Physical deletion should still wait until the complete normal order flow is proven stable with store pickup disabled.

## 2026-06-22 Payment Callback and Order Detail Boundary Audit

This pass reviewed the preserved normal-order payment callback and order-detail boundaries after store-pickup/write-off soft-slimming. No business code was changed in this pass.

Code-path findings:

- `PayNotifyServices::wechatProduct` resolves product payment callbacks by `order_id`, returns success for missing orders, and delegates real product payments to `StoreOrderSuccessServices::paySuccess`.
- `StoreOrderSuccessServices::paySuccess` updates payment state and dispatches order payment events. It does not branch on `shipping_type`, `store_id`, or `verify_code`.
- `OrderShippingListener` can read `shipping_type` after payment-related events, but its normal express branch is `shipping_type=1`; store pickup only maps to a separate logistics type when such an order exists.
- `StoreOrderCreateServices::createOrder` now normalizes `shippingType=1` before pricing and address/write-off validation when `store_self_mention=0`, after the API-level smoke below exposed that the old normalization point was too late.
- Mobile order detail code still contains legacy write-off display handling, but `StoreOrderServices::getUserOrderByKey` forces `shipping_type=1` for display when `store_self_mention=0`.

Runtime checks:

| Check | Result |
| --- | --- |
| Direct service call `PayNotifyServices::wechatProduct('MVP_SMOKE_NO_ORDER', 'MVP_SMOKE_TRADE')` | Returned `true`; missing-order callback path is safe and does not require store-pickup data. |
| `POST /api/pay/notify/wechat` with non-XML smoke payload | Reached the original WeChat notify parser and returned the original invalid-XML error; it was not blocked by MVP route rules. |
| `GET /api/order/detail/MVP_SMOKE_NO_ORDER` without token | Returned original login requirement (`401`), not `MVP module disabled`. |
| `GET /api/order/list?page=1&limit=1` without token | Returned original login requirement (`401`), not `MVP module disabled`. |
| `GET /api/product/detail/1` | Returned business success (`status=200`). |

Data availability:

| Metric | Count |
| --- | ---: |
| `eb_store_order` rows | `0` |
| Normal express orders | `0` |
| Paid normal express orders | `0` |
| Store-pickup orders | `0` |

Because the current database has no order rows, this pass did not perform a real persisted order-detail rendering check. It intentionally avoided creating a new order because order creation decrements stock and creates order side effects. The verified evidence is therefore a route/code-path boundary check, not a full real-order regression test.

Deletion status for this pass:

| Layer | Deleted? | Current decision |
| --- | --- | --- |
| Frontend page | No | No frontend page was deleted. |
| Backend page | No | No backend page was deleted. |
| API route | No | Payment callback, order list, and order detail routes remain preserved. |
| Controller | No | No controller code was removed. |
| Service | No | No service code was removed. |
| DAO/Model | No | No DAO/model code was removed. |
| Menu records | No | No menu records were removed. |
| Data tables | No | No data tables were removed. |
| Install SQL / migration files | No | No install or migration metadata was changed. |

Next small batch: use a controlled fixture or a reversible test-data plan before creating a real order. The next verification should prove persisted normal express order creation, detail rendering, and payment-success behavior without leaving stock/order side effects behind.

## 2026-06-22 Transactional Normal Express Order Fixture

This pass used a database transaction fixture to verify normal express order detail rendering and payment-success service behavior without leaving persisted order data. No business code was changed in this pass.

Fixture design:

- Inserted one temporary `eb_store_order` row inside an explicit database transaction.
- Inserted one matching `eb_store_order_cart_info` row inside the same transaction.
- The fixture order used `shipping_type=1`, `store_id=0`, and an empty `verify_code`.
- Called `StoreOrderServices::getUserOrderByKey` to exercise the mobile order-detail service path.
- Called `StoreOrderSuccessServices::paySuccess` to exercise product payment-success behavior.
- Cleared order cart-info cache keys and rolled back the transaction.

Fixture result:

| Check | Result |
| --- | --- |
| Detail loaded | `true` |
| Detail `shipping_type` | `1` |
| Detail `system_store` | `false` |
| Detail `verify_code` | Empty string |
| Detail write-off code image | Empty string |
| Detail cart count | `1` |
| Payment-success service result | `true` |
| Post-payment fixture fields before rollback | `paid=1`, `pay_type=weixin`, `trade_no=MVP_TXN_TRADE`, `shipping_type=1`, `store_id=0`, `verify_code=''` |
| Transaction rollback | `true` |
| Orders after rollback | `0` |
| Order cart-info rows after rollback | `0` |
| Fixture order remaining after rollback | `0` |
| Fixture cart-info rows remaining after rollback | `0` |

Interpretation:

- The normal express order-detail path can render without store-pickup data.
- The product payment-success service can complete for a normal express order without entering a store-pickup/write-off branch.
- The temporary fixture did not leave persisted order or order-cart rows.
- This is stronger than the previous route-only check, but it is still a controlled service-level fixture rather than a full end-to-end payment-provider callback.

Deletion status for this pass:

| Layer | Deleted? | Current decision |
| --- | --- | --- |
| Frontend page | No | No frontend page was deleted. |
| Backend page | No | No backend page was deleted. |
| API route | No | No route was deleted. |
| Controller | No | No controller code was removed. |
| Service | No | No service code was removed. |
| DAO/Model | No | No DAO/model code was removed. |
| Menu records | No | No menu records were removed. |
| Data tables | No | No data tables were removed; fixture rows were rolled back. |
| Install SQL / migration files | No | No install or migration metadata was changed. |

Next small batch: if a fuller end-to-end smoke is required, create a reversible API-level order test plan that snapshots stock/order/cart counts, creates one normal express order, verifies detail and payment behavior, then restores or removes all side effects before considering any physical deletion.

## 2026-06-22 Reversible API-Level Normal Express Order Smoke

This pass created one real mobile API order through the normal order endpoints, intentionally submitted `shipping_type=2`, verified that MVP mode stores and renders the order as normal express, and then removed all test side effects. One backend guard was changed in this pass.

Code change:

- `StoreOrderCreateServices::createOrder` now normalizes `shippingType` immediately after loading the cached cart group and before `computedOrder` plus address/write-off validation.
- This aligns order creation with the existing confirm and computed-order guards.
- The previous normalization happened after the address/write-off validation branch, so a client could still submit `shipping_type=2` and hit the legacy pickup-only `real_name`/`phone` validation before the value was forced back to express delivery.

API smoke flow:

| Step | Result |
| --- | --- |
| Starting snapshot | `orders_total=0`, `order_cart_info_total=0`, `active_smoke_addresses=0`, product `id=1` stock/sales `400/0`, attr `id=76` stock/sales `100/0`, product cart rows `0` |
| `POST /api/address/edit` | Created temporary address `id=4` with detail `MVP API Smoke Address 20260622` |
| `POST /api/cart/add` | Created direct-buy cart id `1592064709595758592` |
| `POST /api/order/confirm` with `shipping_type=2` | Returned success, `store_self_mention=false`, order key `800437876297826304` |
| First create attempt before the fix | Returned `400` with the legacy pickup validation message `Please fill in name and phone` |
| `POST /api/order/create/800437876297826304` after the fix, still with `shipping_type=2` | Returned business success and created order `cp592065016862081024` |
| Database order fields | `shipping_type=1`, `store_id=0`, `verify_code=''`, `paid=0`, `pay_type=weixin`, `mark=MVP API Smoke` |
| `GET /api/order/detail/cp592065016862081024` | Returned success with `shipping_type=1`, `store_id=0`, `verify_code=''`, `system_store=false` |

Cleanup and restore:

| Cleanup target | Result |
| --- | --- |
| Test order row | Deleted exact row `id=3`, `order_id=cp592065016862081024`, `uid=1`, `mark=MVP API Smoke` |
| Test order cart-info row | Deleted exact row with `oid=3` |
| Temporary cart rows | Deleted exact test cart ids `1592064709595758592` and the earlier failed-attempt id `1592063466269835264` if present |
| Temporary address | Deleted exact address `id=4`, `uid=1`, detail `MVP API Smoke Address 20260622` |
| Product stock/sales | Restored product `id=1` to `stock=400`, `sales=0` |
| Attr stock/sales | Restored attr `id=76`, `unique=a1a5e606` to `stock=100`, `sales=0` |
| Redis scan for test order/cart keys | No matching key output for `800437876` or `1592064709595758592` after authenticated scan |

Final database recheck:

| Metric | Count / value |
| --- | ---: |
| `eb_store_order` rows | `0` |
| `eb_store_order_cart_info` rows | `0` |
| Store-pickup orders | `0` |
| Non-zero `store_id` orders | `0` |
| Non-empty `verify_code` orders | `0` |
| Active smoke addresses | `0` |
| Product cart rows for uid `1`, product `1` | `0` |
| Product `id=1` stock/sales | `400/0` |
| Attr `id=76` stock/sales | `100/0` |

Deletion status for this pass:

| Layer | Deleted? | Current decision |
| --- | --- | --- |
| Frontend page | No | No frontend page was deleted. |
| Backend page | No | No backend page was deleted. |
| API route | No | Normal order create, confirm, and detail routes remain preserved. |
| Controller | No | No controller code was removed. |
| Service | No | Service code was retained; one guard was moved earlier inside `StoreOrderCreateServices::createOrder`. |
| DAO/Model | No | No DAO/model code was removed. |
| Menu records | No | No menu records were removed. |
| Data tables | No | No data tables were removed; exact test rows were cleaned after the smoke. |
| Install SQL / migration files | No | No install or migration metadata was changed. |

Next small batch: keep store pickup/write-off in soft-slimming status and move to the next low-risk slice only after another focused review. A good next slice is product collection/product migration permission and upgrade metadata cleanup; do not expand into shipping templates, video upload keys, virtual-card import, order/payment deletion, product detail, base distribution, commission, sign-in, membership, or assessment flows yet.
