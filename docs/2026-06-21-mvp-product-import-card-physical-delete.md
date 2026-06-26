# 2026-06-21 MVP Product Import Card Physical Delete

## Scope

This pass physically removed only the virtual product card import endpoint chain after the softer MVP guards had already passed validation.

## Deleted

- Frontend API wrapper: removed `importCard()` from `template/admin/src/api/product.js`.
- Frontend caller: removed the `importCard` dependency from `template/admin/src/pages/product/productAdd/index.vue`.
- Backend route: removed `product/import_card` from `crmeb/app/adminapi/route/product.php`.
- Controller method: removed `StoreProduct::import_card()` from `crmeb/app/adminapi/controller/v1/product/StoreProduct.php`.
- Unused controller import: removed `crmeb\services\FileService` from `StoreProduct.php`.
- Upgrade seed records: removed the two `product/product/import_card` auth menu rows from `crmeb/app/adminapi/controller/UpgradeController.php`.
- Install SQL seed records: removed the two `product/product/import_card` auth menu rows and the one API metadata row from `crmeb/public/install/crmeb.sql`.

## Not Deleted

- Frontend page: `productAdd` remains; its upload callback now only reports that virtual card import is unavailable in MVP mode.
- Admin page: no full admin page was deleted.
- Service: no product service was deleted in this pass.
- DAO or model: no DAO/model was deleted in this pass.
- Runtime data table: no table was dropped or altered.
- Shipping template, video upload keys, order, payment, product detail, distribution, commission, check-in, member, and review modules were not changed.

## Verification

- Residual search: no remaining matches for `importCard`, `import_card`, `product-product-import_card`, `product/product/import_card`, or `product/import_card` in the admin frontend, backend app code, or install SQL.
- PHP syntax:
  - `app/adminapi/controller/v1/product/StoreProduct.php`: passed.
  - `app/adminapi/route/product.php`: passed.
  - `app/adminapi/controller/UpgradeController.php`: passed.
- Admin frontend build: passed with the existing CSS order and asset size warnings.
- Smoke checks:
  - `GET /adminapi/product/product/import_card`: `status=400`, `msg=MVP module disabled`.
  - `GET /adminapi/product/product/get_template`: `status=400`, `msg=MVP module disabled`.
  - `GET /adminapi/product/product/get_temp_keys`: `status=400`, `msg=MVP module disabled`.
  - `GET /api/product/detail/1`: `status=200`, `msg=success`.
  - `GET /api/pc/get_products`: `status=200`, `msg=success`.

## Next Recommendation

Keep the next pass small. Do not delete shipping templates or video upload keys yet; they are still shared with normal products or generic upload behavior. The safest next pass is to audit whether any virtual product delivery/runtime code can be left as dead-compatible code or needs its own later module boundary.
