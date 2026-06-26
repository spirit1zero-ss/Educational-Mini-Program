# MVP Product Extra Save Sanitizer Runtime Audit

Date: 2026-06-21

## Scope

This pass verifies the backend save sanitizer for product-extra fields while `enable_product_extras = false`.

The goal is not to delete runtime code in this pass. The goal is to prove that crafted save payloads cannot persist product-extra fields after frontend guards and route blockers are bypassed.

## Runtime Verification

A temporary product save payload was executed inside an explicit database transaction and rolled back after reading the inserted values.

The crafted payload included:

- `is_virtual = 1`
- `virtual_type = 2`
- `video_link = https://example.com/video.mp4`
- `temp_id = 88`
- `freight = 3`
- SKU `is_virtual = 1`
- SKU `disk_info = disk-secret`
- SKU `coupon_id = 99`

Observed values inside the transaction:

| Field | Observed value |
| --- | --- |
| `store_product.is_virtual` | `0` |
| `store_product.virtual_type` | `0` |
| `store_product.video_link` | empty string |
| `store_product.temp_id` | `0` |
| `store_product.freight` | `2` |
| `store_product_attr_value.is_virtual` | `0` |
| `store_product_attr_value.disk_info` | empty string |
| `store_product_attr_value.coupon_id` | `0` |

The outer transaction was rolled back. A follow-up query confirmed `0` rows with the temporary product name.

## Current Data Checks

| Check | Result |
| --- | --- |
| Temporary product rows | `0` |
| Template/temp-key menu rows | `0` |
| Install/upgrade seed hits for template/temp-key permissions | `0` |

## Deletion Matrix

| Layer | Status | Notes |
| --- | --- | --- |
| Frontend page | Not deleted | Product add/edit pages remain because normal product management depends on them. |
| Admin page | Not deleted | Shared product admin pages remain. |
| API route | Not deleted | Runtime routes remain behind the MVP blocker to avoid generic route fallback. |
| Controller | Not deleted | Controller methods remain blocked by MVP route middleware. |
| Service | Verified safe | `StoreProductServices::save()` calls `applyMvpProductExtraDefaults()` before persistence. |
| DAO/Model | No delete needed | No dedicated DAO/model is specific to these disabled extra fields. |
| Menu records | Deleted for template/temp-key permissions | Exact database rows are `0`. |
| Data tables | Not deleted | Product and SKU tables are shared core tables. |
| Install SQL / migration files | Updated | Permission/API seed rows were already removed in the previous cleanup pass. |

## Notes

The sanitizer test used full ThinkPHP application initialization. A bare Composer autoload-only check is not sufficient because it does not load `mvp_enabled()`.

Top-level `attr` in some response payloads is not a `store_product` table column. The persistence risk is covered by the product table fields and the SKU `attrs` list used by the save path.

## Recommendation

Treat the product-extra save path as safe under the current soft-slimming guard.

Do not delete the product save route, controller, DAO/model, or shared product tables. The next safe check is a frontend build/runtime review to confirm product-extra UI controls are still hidden or inert in MVP mode.

