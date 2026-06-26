# 2026-06-21 MVP Product Extra Admin UI Safety Audit

## Goal

Verify that the admin product add/edit UI remains safe while product extras are disabled. This pass did not delete code and did not change runtime behavior.

## UI Entry Points Reviewed

- Product type selector in `productAdd/index.vue`.
- Video upload entry in `productAdd/components/BasicInfo.vue`.
- Freight template entry in `productAdd/index.vue`.
- Virtual card/coupon SKU entry points in `SpecStock.vue` and `PriceCommission.vue`.
- Product-extra API calls in product add/edit and shared upload video components.

## Findings

- `mvpGoodsType` filters product type choices down to normal product when `enable_product_extras` is disabled.
- `virtualbtn()` blocks non-normal product type selection while product extras are disabled.
- `applyMvpProductExtraDefaults()` resets product extra fields before save:
  - `virtual_type = 0`
  - `is_virtual = 0`
  - `video_link = ''`
  - `temp_id = 0`
  - `freight = 2` when a freight template value was selected
  - SKU virtual/card/coupon fields reset to normal defaults
- `BasicInfo.vue` hides the add-video entry unless product extras are enabled or an old video value exists.
- `addVideo()`, `zh_uploadFile_change()`, and shared upload video components guard calls to `productGetTempKeysApi`.
- `productGetTemplate()` returns an empty `templateList` while product extras are disabled.
- The virtual SKU templates still exist in child components, but they depend on `formValidate.virtual_type == 1` or `2`. The parent component and backend sanitizer keep MVP products at `virtual_type = 0`, so those templates are inactive in normal MVP use.

## Verification

- Static search confirmed product-extra UI/API entry points have guards or inactive conditions.
- Admin frontend production build passed.
- Build warnings were the existing CSS order and asset size warnings.
- No runtime code was changed in this pass.

## Deletion Checklist Update

- Frontend page: not deleted. Product add/edit remains and is required for normal products.
- Admin page: not deleted.
- API route: only the dedicated `product/import_card` route was physically deleted in the earlier pass.
- Controller: only `StoreProduct::import_card()` was physically deleted in the earlier pass.
- Service: not deleted.
- DAO/Model: not deleted.
- Menu records: current database rows are not deleted, but runtime auth/menu payload hides disabled product-extra entries.
- Data tables: not deleted.
- Install SQL/migration files: only `import_card` seed/API metadata rows were removed earlier; table structures remain.

## Assessment

The admin product add/edit UI is safe for the current soft-slimmed MVP state. Normal product editing remains available, product-extra choices are hidden or blocked, and backend sanitization still protects against crafted payloads.

Further physical deletion should not target product add/edit pages, shared Service, DAO/model, data tables, or order compatibility code yet.

## Next Recommendation

The next safe verification pass is a final consolidated checklist across the product-extra module: compare frontend, admin auth/menu, backend routes, controller, service, DAO/model, data tables, and install SQL status in one handoff-ready summary. After that, choose the next module only if its soft-slimming checks are equally clean.
