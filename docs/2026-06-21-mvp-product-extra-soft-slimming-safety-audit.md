# 2026-06-21 MVP Product Extra Soft-Slimming Safety Audit

## Goal

Confirm the current MVP product-extra slimming state before any larger physical deletion.

This round is not a deletion round. The purpose is to verify whether the current soft-slimming layer is safe enough, then identify what must be proven before a later small-batch physical deletion.

Current product-extra scope reviewed:

- Freight template endpoint: `product/product/get_template`
- Video temp-key endpoint: `product/product/get_temp_keys`
- Virtual card import endpoint: `product/product/import_card`
- Product add/edit virtual-product fields tied to `virtual_type`, `is_virtual`, `virtual_list`, `disk_info`, `coupon_id`, and `temp_id`

## Deletion Status Checklist

| Layer | Deleted? | Current Evidence | Current State |
| --- | --- | --- | --- |
| Frontend pages | No | `template/admin/src/pages/product/productAdd/index.vue` still exists and still contains product add/edit, freight, video, and virtual-product code paths. | Soft-guarded and further tightened this round. |
| Admin pages | No | Product management and shipping-template admin pages still exist in router/menu source and install seeds. | Hidden or blocked by MVP patterns where applicable. |
| API routes | Partially | `product/product_import` and `product/crawl` were previously physically removed and return `HTTP=404`. `product/get_template`, `product/get_temp_keys`, `product/import_card`, and `setting/shipping_templates/*` still exist. | Mixed: some physical deletion already done, product-extra endpoints still soft-blocked. |
| Controller | No | `StoreProduct::get_template`, `StoreProduct::getTempKeys`, `StoreProduct::import_card`, and `ShippingTemplates` controller still exist. | Kept. |
| Service | No | `ShippingTemplatesServices` and `StoreProductVirtualServices` still exist. Product save logic still handles virtual fields. | Kept. |
| DAO / Model | No | Shipping-template DAO/model classes and `StoreProductVirtualDao` / `StoreProductVirtual` still exist. | Kept. |
| Menu records | No | `UpgradeController.php` and `crmeb.sql` still contain menu/permission records for `product-product-get_template`, `product-product-get_temp_keys`, `product-product-import_card`, and `setting-shipping_templates*`. | Soft-hidden/blocked by MVP menu and route patterns; not physically removed. |
| Data tables | No | `crmeb.sql` still creates `eb_shipping_templates*`, keeps product virtual columns, and creates `eb_store_product_virtual`. | Kept. |
| Install SQL / migration seeds | No | `crmeb/public/install/crmeb.sql` and `UpgradeController.php` still contain the related schema and permission records. | Kept. |

## Frontend Safety Changes In This Round

Updated `template/admin/src/pages/product/productAdd/index.vue`:

- `mvpGoodsType` now keeps only normal product type when product extras are disabled.
- `virtualbtn(...)` now refuses non-normal product types when product extras are disabled.
- Added `applyMvpProductExtraDefaults()` and called it from the existing MVP defaults path.
- The reset path clears product-extra fields before save:
  - `virtual_type`
  - `is_virtual`
  - `video_link`
  - `temp_id`
  - `freight=3`
  - `disk_info`
  - `virtualList`
  - SKU-level `virtual_list`, `disk_info`, `coupon_id`, and `coupon_name`

Existing guard confirmed:

- `importCard({ file: ... })` already checks `isProductExtrasEnabled` before calling the backend virtual-card import endpoint.

## Backend Runtime Verification

Docker backend:

```text
http://127.0.0.1:8011
```

Backend login with local admin account succeeded.

Authenticated product-extra endpoint checks:

```text
GET /adminapi/product/product/get_template -> status=400, msg=MVP module disabled
GET /adminapi/product/product/get_temp_keys -> status=400, msg=MVP module disabled
GET /adminapi/product/product/import_card -> status=400, msg=MVP module disabled
```

This confirms the backend soft-block remains active after the frontend guard changes.

## Build Verification

Admin frontend build:

```powershell
npm.cmd run build
```

Result:

- Passed with Node `v16.20.2`.
- Remaining warnings are existing-style warnings:
  - `mini-css-extract-plugin` CSS order warnings.
  - Asset and entrypoint size warnings.

## Safety Assessment

Current soft slimming is safer after this round because:

- Backend product-extra endpoints are still blocked after authentication.
- Product add/edit no longer exposes non-normal product types when product extras are disabled.
- Product add/edit save flow now clears virtual-product, video, and freight-template fields before submit in MVP mode.
- `importCard` remains front-end guarded and backend blocked.

Current state is not ready for broad physical deletion because:

- Shipping template code is still shared by `setting/shipping_templates/*` and install seeds.
- `get_temp_keys` is a shared upload-credential endpoint, not only a product page helper.
- Product save, order delivery, product attributes, and install SQL still contain virtual-product columns and logic.
- Menu and permission records remain in both install SQL and upgrade seed data.

## Next Recommendation

Do not physically delete the full product-extra stack yet.

Next small-batch verification target:

1. Audit whether virtual product data can still be created through backend `productAddApi(...)` if a crafted request sets `virtual_type > 0`.
2. If the backend still accepts virtual product fields in MVP mode, add a server-side product-save sanitizer or rejection before deleting anything.
3. Re-run:
   - Admin frontend build.
   - Authenticated checks for `get_template`, `get_temp_keys`, and `import_card`.
   - A focused product save/update smoke test with `virtual_type > 0`.
4. Only after backend save sanitization is verified should `import_card` be considered for a small physical deletion batch.

Suggested first deletion candidate after validation:

- `product/product/import_card`

Reason:

- It has one known frontend caller.
- It is already backend-blocked.
- It is narrower than `get_template` and much less shared than `get_temp_keys`.
