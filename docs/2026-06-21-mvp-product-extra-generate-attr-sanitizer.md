# 2026-06-21 MVP Product Extra Generate-Attr Sanitizer

## Goal

Verify and harden the MVP soft-slimming state for the backend product specification generator:

```text
POST /adminapi/product/generate_attr/:id/:type
```

This round is not a deletion round. It verifies that crafted requests cannot use `generate_attr` to create virtual-product SKU fields while `enable_product_extras=false`.

## Change

Updated:

```text
src/CRMEB/CRMEB-master/crmeb/app/services/product/product/StoreProductServices.php
```

The existing MVP product-extra sanitizer is now applied to:

- `StoreProductServices::save(...)`
- `StoreProductServices::getAttr(...)`

The sanitizer now normalizes top-level `is_virtual` in addition to the fields already handled in the previous round:

- `is_virtual` -> `0`
- `virtual_type` -> `0`
- `video_link` -> empty string
- `temp_id` -> `0`
- `freight=3` -> `freight=2`
- SKU `is_virtual` -> `0`
- SKU `virtual_list` -> empty array
- SKU `disk_info` -> empty string
- SKU `coupon_id` -> `0`
- SKU `coupon_name` -> empty string

## Crafted Request Verification

Backend environment:

```text
http://127.0.0.1:8011
```

Submitted an authenticated crafted `generate_attr` request with:

```text
is_virtual=1
virtual_type=1
attrs=[Format=VirtualCrafted]
```

Observed response:

```text
status=200
msg=success
headers=Format|image|price|cost|ot_price|stock|bar_code|bar_code_number|weight|volume|action
has_virtual_list=False
has_disk_info=False
has_coupon_id=False
weight=0
volume=0
```

This proves the endpoint now returns normal-product specification fields instead of virtual-product fields when product extras are disabled.

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

The current product-extra soft slimming is now protected at these layers:

- Frontend product type selection.
- Frontend product save payload cleanup.
- Backend product save payload cleanup.
- Backend specification generation cleanup.
- Backend route-level MVP block for product-extra helper endpoints.

This still does not mean the product-extra stack is physically deleted.

## Next Recommendation

The current evidence is sufficient to prepare a small physical deletion candidate for:

```text
product/product/import_card
```

Before deleting, produce a narrow deletion plan that covers only:

- Frontend wrapper `importCard`.
- Backend route `product/import_card`.
- Controller method `StoreProduct::import_card`.
- Menu and install SQL permission records for `product-product-import_card`.

Do not include `get_temp_keys`, shipping templates, virtual-product database tables, or broader product save/order delivery logic in that first deletion batch.
