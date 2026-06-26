# MVP Product Extra Template/Temp-Key Permission Cleanup

Date: 2026-06-21

## Scope

This pass audits the remaining product-extra endpoints:

- `GET /adminapi/product/product/get_template`
- `GET /adminapi/product/product/get_temp_keys`

The goal is to verify the soft-slimming guard before any cleanup. This pass intentionally does not delete the runtime route or controller methods because deleting these routes could allow the generic `product/:id` route to catch the same path shape.

## Runtime Evidence

| Endpoint | Result |
| --- | --- |
| `GET /adminapi/product/product/get_template` | `400 MVP module disabled` |
| `GET /adminapi/product/product/get_temp_keys` | `400 MVP module disabled` |
| `GET /adminapi/product/product/1` | `200 success` |

The runtime block is enforced through `enable_product_extras = false` in `config/mvp.php`.

## Changes

- Removed current database menu/permission rows for:
  - `product-product-get_template`
  - `product-product-get_temp_keys`
  - generated duplicate unique auth rows with the same prefixes
- Removed matching menu seed rows from `public/install/crmeb.sql`.
- Removed matching API documentation seed rows from `public/install/crmeb.sql`.
- Removed matching menu seed rows from `UpgradeController.php`.

## Deletion Matrix

| Layer | Status | Notes |
| --- | --- | --- |
| Frontend page | Not physically deleted | Shared product-add/edit pages remain. Frontend guards prevent product-extra workflows from calling these endpoints in MVP mode. |
| Admin page | Not physically deleted | Product pages are shared with normal product management and must remain. |
| API route | Not physically deleted | Routes remain so MVP blocker can return a controlled disabled response and avoid generic route fallback. |
| Controller | Not physically deleted | `StoreProduct::get_template()` and `StoreProduct::getTempKeys()` remain behind the MVP blocker. |
| Service | Not deleted in this pass | Product save sanitizer already neutralizes template/video fields when `enable_product_extras = false`. |
| DAO/Model | No delete needed | Shipping-template tables/models are shared logistics infrastructure and were not removed. |
| Menu records | Deleted for this slice | Exact database menu rows are now `0`. |
| Data tables | Not deleted | `eb_shipping_templates*` tables remain because they are shared shipping infrastructure. |
| Install SQL / migration files | Updated | Matching menu/API documentation seed rows were removed. |

## Verification

- Exact current database menu rows for these endpoints: `0`.
- `rg "product-product-get_template|product-product-get_temp_keys|product/product/get_template|product/product/get_temp_keys"` has no install/upgrade hits after cleanup.
- Remaining frontend API function definitions are intentional and guarded by the product-extra UI flow.
- `php -l app/adminapi/controller/UpgradeController.php` passed.
- `php -l app/adminapi/controller/v1/product/StoreProduct.php` passed.

## Recommendation

Stop at permission/install cleanup for this slice. Do not delete the runtime route or controller methods unless the generic product route is first made safe against `get_template` and `get_temp_keys` path fallback.

The next product-extra audit candidate should be a separate slice, not a combined deletion:

1. Confirm whether the frontend product page still renders no template/video controls in MVP mode.
2. Confirm crafted product save requests still sanitize `temp_id`, `freight`, and `video_link`.
3. Only then decide whether additional physical cleanup is safe.

