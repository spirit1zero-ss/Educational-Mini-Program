# 2026-06-21 MVP Product Extra Final Status Summary

## Goal

Consolidate the verified state of the product-extra soft slimming work. The goal is to prove whether the current soft slimming is safe, then list exactly what has and has not been physically deleted.

## Verified Safety Gates

- `enable_product_extras` is disabled.
- Admin menu/auth output hides product-extra permissions while the switch is disabled.
- Admin route middleware blocks the remaining product-extra API paths.
- Product add/edit UI only exposes normal product selection in MVP mode.
- Product save sanitizes crafted product-extra payloads back to normal-product defaults.
- Product attribute generation sanitizes crafted product-extra payloads back to normal-product defaults.
- Normal product detail and product list APIs still work.
- Normal product order-readiness stays on `virtual_type = 0`.

## Verified Local Data State

- `eb_store_product` rows with virtual flags: `0`.
- `eb_store_product_attr_value` rows with virtual SKU fields populated: `0`.
- `eb_store_order` rows with virtual or fictitious delivery state: `0`.
- `eb_store_product_virtual` rows: `0`.
- Current database menu rows still include product-extra permission records:
  - `product/product/import_card`: `2`.
  - `product/product/get_template`: `2`.
  - `product/product/get_temp_keys`: `2`.
- Admin login auth payload exposes none of those product-extra permission keys while the switch is disabled.

## Physical Deletion Status

| Layer | Status | Evidence |
| --- | --- | --- |
| Frontend page | Not deleted | Product add/edit remains for normal products. Product-extra controls are hidden, blocked, or sanitized. |
| Admin page | Not deleted | No full admin product page was removed. |
| API route | Partially deleted | The dedicated `product/import_card` route was removed. `get_template` and `get_temp_keys` remain and are blocked. |
| Controller | Partially deleted | `StoreProduct::import_card()` was removed. `get_template` and `getTempKeys` remain and are blocked. |
| Service | Not deleted | Product and order services remain. `StoreProductServices` adds sanitizer guards. |
| DAO/Model | Not deleted | `StoreProductVirtualDao` and `StoreProductVirtual` remain because order compatibility paths still reference them. |
| Menu records | Mixed | Install/upgrade seed rows for `import_card` were removed. Current database rows still exist but are hidden at runtime. |
| Data tables | Not deleted | `eb_store_product_virtual` and virtual-related product/order columns remain. |
| Install SQL/migration files | Partially deleted | `import_card` seed/API metadata rows were removed. No table or column DDL was removed. |

## Product-Extra Endpoint State

| Endpoint | Current State | Reason |
| --- | --- | --- |
| `product/product/import_card` | Dedicated implementation deleted; MVP block pattern retained | The catch-all `product/:id` route still exists, so the block pattern prevents `import_card` from being treated as a product ID. |
| `product/product/get_template` | Retained but blocked | Shipping template logic is shared with normal product logistics and should not be physically deleted yet. |
| `product/product/get_temp_keys` | Retained but blocked | Upload key logic is shared with generic upload behavior and should not be physically deleted yet. |

## Why Service, DAO/Model, And Tables Stay

Order and payment compatibility paths still reference virtual-product runtime code:

- `OrderPaySuccessListener` calls `virtualSend()` when `virtual_type` is `1` or `2`.
- `OrderOfflineServices` does the same for offline payment.
- `StoreOrderDeliveryServices::virtualSend()` references `StoreProductVirtualServices`.
- `StoreProductVirtualServices` depends on `StoreProductVirtualDao` and `StoreProductVirtual`.

Current MVP data and save guards prevent normal products from entering those paths, but the references still exist. Deleting those layers would require a separate order/payment compatibility plan.

## Latest Verification Commands/Checks

- Residual search found no `importCard`, `function import_card`, or dedicated `Route::get('product/import_card')` implementation.
- Product-extra route smoke checks:
  - `GET /adminapi/product/product/import_card`: `status=400`, `msg=MVP module disabled`.
  - `GET /adminapi/product/product/get_template`: `status=400`, `msg=MVP module disabled`.
  - `GET /adminapi/product/product/get_temp_keys`: `status=400`, `msg=MVP module disabled`.
  - `GET /adminapi/product/product/1`: `status=200`, `msg=success`.
- Normal frontend product checks:
  - `GET /api/product/detail/1`: `status=200`, `msg=success`, `virtual_type=0`, `is_virtual=0`, `cart_button=1`.
  - `GET /api/pc/get_products`: `status=200`, `msg=success`.
- Admin frontend production build passed with existing CSS order and asset size warnings.
- Docs CJK scan passed: `no-cjk-found-in-docs`.

## Final Recommendation For Product Extras

Stop physical deletion for product extras at the current point. The soft slimming is safe, and the only physical deletion that was safe in this batch was the narrow `import_card` endpoint chain. Do not delete Service, DAO/model, data tables, shared product/order virtual fields, `get_template`, or `get_temp_keys` yet.

The next module should start with the same pattern: verify the soft-slimming boundary first, then physically delete only narrow code paths that are proven inactive and not shared.
