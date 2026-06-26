# 2026-06-21 MVP Product Extra Menu Permission Consistency Audit

## Goal

Verify whether the current product-extra menu and permission state is safe after the `import_card` endpoint chain was physically removed. This pass did not change code or delete data.

## Database Menu State

Current local `eb_system_menus` records still contain product-extra permission rows:

- `product/product/import_card`: `2` rows.
- `product/product/get_template`: `2` rows.
- `product/product/get_temp_keys`: `2` rows.

This means the current database menu records were not physically deleted. The previous physical deletion only removed `import_card` seed/API metadata from install SQL and upgrade seed files.

## Runtime Menu/Auth State

Admin login output was checked for the relevant permission keys:

- `product-product-import_card`: `0` visible auth entries.
- `product-product-get_template`: `0` visible auth entries.
- `product-product-get_temp_keys`: `0` visible auth entries.

`SystemMenusDao` injects `mvp_admin_hidden_menu_patterns()` into menu and unique-auth queries, so the current database rows are hidden from the runtime admin permission payload while `enable_product_extras` is disabled.

## Route State

Authenticated route smoke checks:

- `GET /adminapi/product/product/import_card`: `status=400`, `msg=MVP module disabled`.
- `GET /adminapi/product/product/get_template`: `status=400`, `msg=MVP module disabled`.
- `GET /adminapi/product/product/get_temp_keys`: `status=400`, `msg=MVP module disabled`.
- `GET /adminapi/product/product/1`: `status=200`, `msg=success`.

The `import_card` route-block pattern should remain for now. Even though the dedicated `product/import_card` route was deleted, `product/:id` still exists as a catch-all product detail route. Keeping `product/product/import_card` in `admin_route_block_patterns` prevents that path from being handled as a product detail request with `id = import_card`.

## Deletion Checklist Update

- Frontend page: not deleted.
- Admin page: not deleted.
- API route: `product/import_card` dedicated route deleted; `get_template` and `get_temp_keys` remain blocked.
- Controller: `StoreProduct::import_card()` deleted; `get_template` and `getTempKeys` remain blocked.
- Service: not deleted.
- DAO/Model: not deleted.
- Menu records: current database rows not deleted; runtime auth/menu payload hides them. Install/upgrade seed rows for `import_card` were deleted.
- Data tables: not deleted.
- Install SQL/migration files: `import_card` seed/API metadata rows deleted; `get_template` and `get_temp_keys` rows remain.

## Assessment

The current soft-slimming menu and permission state is safe:

- Disabled product-extra permissions do not appear in the admin login auth payload.
- Disabled product-extra routes return the MVP block response.
- Normal product detail routing still works.
- The remaining `import_card` route-block config is intentional safety, not an unsafe stale reference.

## Next Recommendation

Do not remove the `import_card` MVP block pattern yet unless the product detail catch-all route is also constrained to numeric IDs or a dedicated not-found route is added before `product/:id`. The safer next pass is to verify normal product add/edit UI behavior with product extras disabled, then stop before deleting Service, DAO/model, data table, or shared order fields.
