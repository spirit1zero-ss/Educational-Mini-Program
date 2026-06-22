# 2026-06-21 MVP Product Crawl/Copy Final Status Audit

## Goal

Verify the current state of the product collection and product migration slimming work before taking any additional physical deletion. This audit focuses on whether the old crawl/copy entry points are still reachable, and whether remaining lower-level code is shared or safe to delete.

## Verified Current State

| Layer | Status | Evidence |
| --- | --- | --- |
| Frontend product list entry | Deleted/absent | No current hit for `product-crawl`, `product-copy`, `product-copy_config`, `product/crawl`, `product/copy_config`, `product/copy`, `goodsMove`, `onImport`, migration-specific `product_import`, or migration-specific `product_export` in the admin product pages/API wrappers. |
| Admin setting route | Deleted/absent | No current hit for the previous product collection setting route identifiers. |
| API routes | Deleted/absent | The old endpoints return HTTP `404`: `POST /adminapi/product/crawl`, `GET /adminapi/product/copy_config`, `POST /adminapi/product/copy`, `POST /adminapi/product/crawl/save`, `POST /adminapi/product/product_import`, `GET /adminapi/product/product_export`. |
| Controller | Deleted/absent for old endpoints | `app/adminapi/controller/v1/product/CopyTaobao.php` is absent. No current route/controller hit for the old crawl/copy endpoint names. |
| Service | Partially retained | Product crawl/copy route methods are absent, but `CopyTaobaoServices` remains because product save and attachment flows still use remote image download helpers. |
| Shared copyproduct SDK/services | Retained | `crmeb/services/copyproduct/*` remains and `ServeServices` can still construct `CopyProduct`; this is lower-level service infrastructure, not an exposed admin product crawl/copy route. |
| DAO/Model | No dedicated deletion candidate found in this pass | No dedicated product crawl/copy data table was found by `SHOW TABLES LIKE '%copy%'`, `'%crawl%'`, or `'%taobao%'`. |
| Menu records | Product crawl/copy absent | Current database search found no `product/crawl`, `product/copy`, `copy_config`, `product_import`, `product_export`, `product-crawl`, or `product-copy` menu rows. The only `copy` menu row is unrelated coupon copy: `marketing/coupon/copy/<id>`. |
| Config records | Cleaned | `copy_product_apikey`, `system_product_copy_type`, and config tabs `copy_product` / `copy_basic` / `99api_config` were removed from the current local database after repository-wide search confirmed no business code reads those identifiers. |
| Install SQL/upgrade records | Mixed | Product crawl/copy menu and route identifiers are absent. Historical copy-product config seed rows were removed from install SQL, while `crmeb/services/copyproduct/*` checksum/file-tree records remain because the lower-level service files still exist. |

## Runtime Smoke Checks

Authenticated admin smoke checks were run against the local backend at `http://127.0.0.1:8011/adminapi`.

| Endpoint | Result |
| --- | --- |
| `POST /product/crawl` | HTTP `404` |
| `GET /product/copy_config` | HTTP `404` |
| `POST /product/copy` | HTTP `404` |
| `POST /product/crawl/save` | HTTP `404` |
| `POST /product/product_import` | HTTP `404` |
| `GET /product/product_export` | HTTP `404` |
| `GET /product/product/1` | HTTP `200`, `status=200`, `msg=success` |

The normal product detail route was checked as a control, so the `404` results above are not caused by login failure or backend downtime.

## Important Non-Issues

- `marketing/coupon/copy/<id>` is coupon-copy behavior and is outside this product crawl/copy scope.
- Current database rows for `product/product/import_card` belong to the separate product-extra/virtual-card module, not product crawl/copy.
- Common product-list export through `/export/product_list` is not the old product migration import/export path and should stay.
- `CopyTaobaoServices` should not be deleted in this batch because `StoreProductServices` and `SystemAttachmentServices` still call image download helpers.

## Config Metadata Cleanup Completed

Repository-wide search confirmed the following identifiers only appeared in install SQL seed data before this cleanup:

- `copy_product_apikey`.
- `system_product_copy_type`.
- `copy_product`.
- `copy_basic`.

This batch removed those seed rows from `public/install/crmeb.sql`, and also removed the matching current local database rows:

- `eb_system_config`: `copy_product_apikey`, `system_product_copy_type`.
- `eb_system_config_tab`: `copy_product`, `copy_basic`, `99api_config`.

Post-cleanup database counts:

- Matching `eb_system_config` rows: `0`.
- Matching `eb_system_config_tab` rows: `0`.

## Deletion Boundary

Do not physically delete `CopyTaobaoServices`, `ServeServices` copyproduct integration, or `crmeb/services/copyproduct/*` yet. Those are shared lower-level components and require a separate dependency split before removal.

## Recommendation

Stop physical deletion for product crawl/copy route code at the current point. The exposed admin entry points are already gone and runtime smoke confirms the old endpoints return `404`.

Next, move to a separate service-dependency audit before considering any deeper deletion. Leave shared image-download and `copyproduct` service code untouched until `ServeServices`, `CopyTaobaoServices`, `StoreProductServices`, and `SystemAttachmentServices` are split or proven independent.
