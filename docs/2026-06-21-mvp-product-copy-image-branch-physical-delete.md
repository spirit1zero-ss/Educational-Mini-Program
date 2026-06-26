# MVP Product Copy Image Branch Physical Delete Audit

Date: 2026-06-21

## Scope

This pass physically removes the legacy product-copy remote image download branch only.

The deleted branch handled copied product image downloads through `ProductCopyJob` and `CopyTaobaoServices` when a crafted product save request used `type = -1`.

This pass does not delete the lower-level `copyproduct/*` Yihaotong services, because they are still referenced by `ServeServices::copy()` and should be handled in a separate audit batch.

## Pre-delete Evidence

- `queue_open` is `0` in the local database.
- Redis scan for queue keys found only the cached `system_config_queue_open` entry.
- Redis scan for `ProductCopyJob` returned no queued job payloads.
- Database queue/job table discovery found no matching runtime job tables.
- Product copy service entry points were already soft-blocked by `enable_product_copy = false`.

## Changes

- Removed the `type == -1` product-copy image download branch from `StoreProductServices::save()`.
- Removed `ProductCopyJob` from the backend job tree.
- Removed `CopyTaobaoServices` from the product service tree.
- Removed `ProductCopyJob.php` and `CopyTaobaoServices.php` records from `UpgradeController.php`.
- Removed `ProductCopyJob.php` and `CopyTaobaoServices.php` file/checksum records from `public/install/crmeb.sql`.
- Kept the neutral `RemoteImageServices` path for normal online attachment upload.

## Deletion Matrix

| Layer | Status | Notes |
| --- | --- | --- |
| Frontend page | Not deleted | Existing product-copy UI remains guarded by the MVP switch. |
| Admin page | Not deleted | Shared serve pages remain in place; copy entries are hidden or blocked. |
| API route | Not deleted | Serve copy endpoints remain blocked by `enable_product_copy = false`. |
| Controller | Not deleted | `Serve` copy handlers remain soft-blocked. |
| Service | Partially deleted | `CopyTaobaoServices` deleted; `copyproduct/*` retained for a later batch. |
| Queue job | Deleted | `ProductCopyJob.php` deleted and removed from file records. |
| DAO/Model | No dedicated delete | No dedicated DAO/model was tied to this image-copy branch. |
| Menu records | Already absent | Exact product crawl/copy admin menu records were previously confirmed absent. |
| Data tables | No dedicated delete | No dedicated runtime queue/job tables were found for this branch. |
| Install SQL / migration records | Updated | File tree and checksum records were removed for the deleted files. |

## Verification

- `rg "ProductCopyJob|CopyTaobaoServices|copySliderImage|copyDescriptionImage|copyAttrImage"` returned no live backend/install hits.
- `php -l app/services/product/product/StoreProductServices.php` passed.
- `php -l app/adminapi/controller/UpgradeController.php` passed.
- `GET /adminapi/serve/open?type=1` returned `400 MVP module disabled`.
- `POST /adminapi/serve/pay_meal` with `type=copy` returned `400 MVP module disabled`.
- `GET /adminapi/serve/meal_list?type=copy` returned `400 MVP module disabled`.
- `GET /adminapi/product/product/1` returned `200 success`.

## Next Recommendation

Next, audit the retained `copyproduct/*` service chain as its own small batch:

1. Confirm every entry point into `ServeServices::copy()` is still blocked.
2. Search for direct service construction outside the blocked serve controller path.
3. If no live path remains, remove `copyproduct/*` service files and their install/upgrade records.
4. Re-run the same smoke checks and write one English audit note before any broader physical delete.

