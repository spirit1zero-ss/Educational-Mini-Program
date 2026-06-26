# 2026-06-21 MVP Product Copy Remote Image Dependency Audit

## Goal

Continue validating the MVP soft-slimming boundary for product collection/product migration. The goal is not to delete more code first, but to prove whether the current soft slimming is safe. Physical deletion should only follow after each module boundary is proven inactive and isolated.

## Finding

The old product crawl/copy admin entry points are already unavailable, and the Yihaotong product-copy service entry points are now soft-blocked. This pass found one additional crafted-request boundary:

- `StoreProductServices::save()` still had a `type == -1` branch that triggers product-copy remote image download behavior.
- Normal admin product creation does not use this path, but the controller still accepts a `type` field.
- A crafted save request could therefore attempt to enter the old product-copy image download branch unless the service layer normalizes it.

## Change Made

`StoreProductServices::save()` now normalizes product-copy save mode while `enable_product_copy=false`:

- If incoming `type` is `-1`, the service changes it to `0`.
- `is_copy` is also reset to `0`.
- The existing `if ($type == -1)` image-copy branch is therefore not reached in MVP mode.

This keeps normal product save behavior intact while blocking product-copy behavior at the service boundary.

## Remote Image Dependency Boundary

`CopyTaobaoServices` and `ProductCopyJob` are not safe physical deletion candidates yet.

Current references show two different responsibilities mixed in the same area:

- Product-copy behavior:
  - `ProductCopyJob::copySliderImage()`.
  - `ProductCopyJob::copyDescriptionImage()`.
  - `ProductCopyJob::copyAttrImage()`.
  - `StoreProductServices::save()` when `type == -1`.
- Shared remote-image behavior:
  - `CopyTaobaoServices::downloadCopyImage()`.
  - `CopyTaobaoServices::downloadImage()`.
  - `SystemAttachmentServices` still calls `CopyTaobaoServices::downloadImage()` for remote attachment handling.
  - `StoreProductServices` still references `CopyTaobaoServices` inside the guarded product-copy image branch.

Because remote-image download behavior is still shared, deleting `CopyTaobaoServices` or `ProductCopyJob` now would be premature. The next safe step is to split product-copy behavior from neutral remote-image download behavior.

## Deletion Status Matrix

| Layer | Current status | Reason |
| --- | --- | --- |
| Frontend page | Not deleted | Shared notification/Yihaotong pages remain. Product-copy tabs and direct actions are hidden/guarded. |
| Admin page | Not deleted | Shared SMS, logistics query, and electronic-waybill pages remain. |
| API route | Not deleted | Shared `serve` routes remain. Product-copy variants are blocked by controller guards. |
| Controller | Not deleted | `Serve` remains. Product-copy branches return `MVP module disabled`. Product save remains but crafted `type=-1` is normalized in service. |
| Service | Not deleted | `CopyTaobaoServices`, `StoreProductServices`, and `ServeServices` remain because responsibilities are still mixed with shared image and service behavior. |
| DAO/Model | No deletion candidate found | No dedicated product-copy DAO/model was found for this module boundary. |
| Menu records | Product crawl/copy absent | Exact product crawl/copy menu identifiers remain absent. |
| Data tables | No deletion candidate found | No dedicated product crawl/copy data table was found. |
| Install SQL/migration files | Partially cleaned | Product-copy config seeds were removed earlier. Shared file checksum/file-tree records remain because the shared files still exist. |

## Verification

- `php -l src/CRMEB/CRMEB-master/crmeb/app/services/product/product/StoreProductServices.php`: passed.
- Static inspection confirms the `type == -1` image-copy branch now depends on the normalized `$type`, and `enable_product_copy=false` changes crafted `type=-1` to `0` before that branch.
- Previous smoke checks remain valid:
  - `GET /adminapi/serve/open?type=1`: `status=400`, `msg=MVP module disabled`.
  - `POST /adminapi/serve/pay_meal` with `type=copy`: `status=400`, `msg=MVP module disabled`.
  - `GET /adminapi/serve/meal_list?type=copy`: `status=400`, `msg=MVP module disabled`.
- Admin frontend production build passed after the product-copy frontend guards were added. Existing CSS order and asset-size warnings remain.

## Recommendation

Stop physical deletion for the product-copy service layer at this point.

The next small batch should be a refactor-preparation audit:

- Design a neutral remote-image downloader interface or service.
- Move `downloadImage()` / `downloadCopyImage()` callers that are not product-copy-specific to the neutral service.
- Only after the neutral split should `ServeServices::copy()`, `crmeb/services/copyproduct/*`, and `ProductCopyJob` be reconsidered for physical deletion.
