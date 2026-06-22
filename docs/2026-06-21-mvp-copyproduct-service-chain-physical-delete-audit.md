# MVP Copyproduct Service Chain Physical Delete Audit

Date: 2026-06-21

## Goal

The goal is not deletion for its own sake. The working rule for this phase is:

1. Verify that the current soft-slimming guard is safe.
2. Confirm there is no remaining live path into the disabled module.
3. Only then physically delete one small, well-bounded module slice.

This pass covers the retained `crmeb/services/copyproduct/*` Yihaotong product-copy service chain.

## Pre-delete Evidence

- `Serve::openServe($type)` returned `MVP module disabled` for `type=1` before reaching the copy service.
- `Serve::mealList("copy")` returned `MVP module disabled`.
- `Serve::payMeal()` with `type=copy` returned `MVP module disabled`.
- Search showed no direct caller of `CopyProduct` outside `ServeServices::copy()`.
- Search showed no direct route to `crmeb/services/copyproduct/*`.
- Search showed no dedicated DAO/model or runtime table for this service chain.

## Changes

- Removed `ServeServices::copy()`.
- Removed the `CopyProduct` import from `ServeServices`.
- Changed the `openServe($type)` copy branch to return `MVP module disabled` directly.
- Deleted:
  - `crmeb/services/copyproduct/BaseCopyProduct.php`
  - `crmeb/services/copyproduct/CopyProduct.php`
  - `crmeb/services/copyproduct/storage/Copy.php`
  - `crmeb/services/copyproduct/storage/Copy99api.php`
- Removed `copyproduct` records from `crmeb/filetree.txt`.
- Removed `copyproduct` checksum records from `UpgradeController.php`.
- Removed `copyproduct` file tree and checksum records from `public/install/crmeb.sql`.

## Deletion Matrix

| Layer | Status | Evidence |
| --- | --- | --- |
| Frontend page | Not physically deleted | Product copy-related UI remains guarded or hidden by the MVP frontend switch. No new frontend delete was required for this service-chain batch. |
| Admin page | Not physically deleted | Shared serve/admin pages remain because SMS, express, invoice, and other serve features still use them. |
| API route | Not physically deleted | `serve/open`, `serve/meal_list`, and `serve/pay_meal` remain, but copy inputs return `MVP module disabled`. |
| Controller | Partially updated, not deleted | `Serve::openServe($type)` now returns `MVP module disabled` directly for copy-type requests. |
| Service | Deleted for this slice | `ServeServices::copy()` and all `crmeb/services/copyproduct/*` files were removed. Other serve services remain. |
| DAO/Model | No delete needed | No dedicated DAO/model exists for this slice. |
| Menu records | Already absent | Exact product crawl/copy admin menu rows had already been verified absent in the database. |
| Data tables | No delete needed | No dedicated runtime table was found for `copyproduct/*`. |
| Install SQL / migration files | Updated | `copyproduct` file tree and checksum entries were removed from install SQL and upgrade checksum records. |

## Verification

- `rg "CopyProduct|copyproduct|->copy\\(|copy\\(\\)->|services/copyproduct|services\\\\copyproduct"` returned no live backend/install hits.
- `php -l app/services/serve/ServeServices.php` passed.
- `php -l app/adminapi/controller/v1/serve/Serve.php` passed.
- `php -l app/adminapi/controller/UpgradeController.php` passed.
- `GET /adminapi/serve/open?type=1` returned `400 MVP module disabled`.
- `POST /adminapi/serve/pay_meal` with `type=copy` returned `400 MVP module disabled`.
- `GET /adminapi/serve/meal_list?type=copy` returned `400 MVP module disabled`.
- `GET /adminapi/product/product/1` returned `200 success`.

## Next Recommendation

Stop expanding the deletion scope here. The next useful step is another verification-first batch:

1. Re-run the full product copy/crawl route audit to confirm all old collection/copy endpoints stay blocked or removed.
2. Check the database once more for config/menu remnants related to `copy_product`, `copy_basic`, `99api_config`, and product copy service settings.
3. If clean, record the module as fully retired in the MVP status matrix.
4. Then move to the next candidate module only after a fresh soft-guard safety check.

