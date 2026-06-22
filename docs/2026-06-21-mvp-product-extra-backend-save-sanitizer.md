# 2026-06-21 MVP Product Extra Backend Save Sanitizer

## Goal

Verify and harden the current MVP soft-slimming state for product-extra data submitted through the backend product save endpoint.

This round is not a deletion round. It closes the crafted-request gap where a caller could bypass frontend guards and submit virtual-product fields directly to:

```text
POST /adminapi/product/product/0
```

## Change

Updated:

```text
src/CRMEB/CRMEB-master/crmeb/app/services/product/product/StoreProductServices.php
```

Added backend-side normalization in `StoreProductServices::save(...)` through `applyMvpProductExtraDefaults(...)`.

When `enable_product_extras=false`, the save flow now normalizes:

- `virtual_type` -> `0`
- `video_link` -> empty string
- `temp_id` -> `0`
- `freight=3` -> `freight=2`
- SKU `is_virtual` -> `0`
- SKU `virtual_list` -> empty array
- SKU `disk_info` -> empty string
- SKU `coupon_id` -> `0`
- SKU `coupon_name` -> empty string

This protects the backend even when a crafted request bypasses the admin frontend.

## Runtime Verification

Backend environment:

```text
http://127.0.0.1:8011
```

Validation steps:

1. Logged in with the local admin account.
2. Submitted a crafted product payload with:
   - `virtual_type=1`
   - `video_link=http://example.com/crafted-video.mp4`
   - `freight=3`
   - `temp_id=1`
   - SKU `is_virtual=1`
   - SKU `virtual_list=[...]`
   - SKU `disk_info=SECRET-DISK-INFO`
   - SKU `coupon_id=123`
3. The save request returned:

```text
save_status=200
save_msg=localized success response
```

4. Queried the saved product and SKU rows directly from MySQL.

Observed database result:

```text
product.virtual_type=0
product.is_virtual=0
product.video_link=
product.temp_id=0
product.freight=2
sku.is_virtual=0
sku.coupon_id=0
sku.disk_info=
```

5. Removed the local test product and related test rows after capturing the evidence.

Cleanup result:

```text
remaining_test_product_count=0
```

## Syntax And Smoke Checks

PHP syntax:

```text
php -l app/services/product/product/StoreProductServices.php
```

Result:

```text
No syntax errors detected
```

Core product smoke checks:

```text
GET /api/product/detail/1 -> status=200, msg=success
GET /api/pc/get_products -> status=200, msg=success
```

Authenticated product-extra checks:

```text
GET /adminapi/product/product/get_template -> status=400, msg=MVP module disabled
GET /adminapi/product/product/get_temp_keys -> status=400, msg=MVP module disabled
GET /adminapi/product/product/import_card -> status=400, msg=MVP module disabled
```

## Safety Assessment

The current soft-slimming state is safer after this round because both layers now agree:

- Frontend: product add/edit hides non-normal product types and clears product-extra fields before submit.
- Backend: product save normalizes crafted product-extra fields before validation and persistence.
- Route layer: product-extra endpoints remain blocked by MVP route rules after authentication.

This does not mean the product-extra stack is physically deleted. It means the current soft-slimming state is now safer to validate before deletion.

## Follow-Up

The `generate_attr/:id/:type` crafted-request check was completed in:

```text
docs/2026-06-21-mvp-product-extra-generate-attr-sanitizer.md
```

The first small physical deletion candidate remains:

```text
product/product/import_card
```

Do not delete the broader `get_temp_keys` or shipping-template stack yet.
