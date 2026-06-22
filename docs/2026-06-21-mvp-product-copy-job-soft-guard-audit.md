# 2026-06-21 MVP Product Copy Job Soft Guard Audit

## Goal

Continue validating product collection/product migration soft slimming. This pass focuses on queued product-copy image download jobs. The goal is not to delete the job class first, but to ensure stale queued jobs or accidental dispatches cannot continue old product-copy behavior while `enable_product_copy=false`.

## Finding

`ProductCopyJob` is only dispatched from the guarded `StoreProductServices::save()` `type == -1` branch. However, the job methods themselves still executed product-copy remote image download behavior if called directly or if old queue payloads remained.

## Change Made

Added a local guard inside `ProductCopyJob`:

- `productCopyDisabled()` checks `enable_product_copy=false`.
- `copyDescriptionImage()` returns early when product copy is disabled.
- `copySliderImage()` returns early when product copy is disabled.
- `copyAttrImage()` returns early when product copy is disabled.

This keeps the class present for compatibility while preventing product-copy image download work from running in MVP mode.

## Deletion Status Matrix

| Layer | Current status | Reason |
| --- | --- | --- |
| Frontend page | Not deleted | Shared pages remain; product-copy controls are hidden/guarded. |
| Admin page | Not deleted | Shared notification/Yihaotong pages remain for non-copy services. |
| API route | Not deleted | Shared routes remain; product-copy variants are blocked. |
| Controller | Not deleted | Product-copy controller branches are guarded. |
| Service | Not deleted | `StoreProductServices` and `CopyTaobaoServices` remain; product-copy save mode is normalized before the old image-copy branch. |
| Queue job | Not deleted | `ProductCopyJob` remains but now returns early while product copy is disabled. |
| DAO/Model | No deletion candidate found | No dedicated product-copy DAO/model was found. |
| Menu records | Product crawl/copy absent | Exact product crawl/copy menu identifiers remain absent. |
| Data tables | No deletion candidate found | No dedicated product-copy data table was found. |
| Install SQL/migration files | Partially cleaned | Product-copy config seed rows were removed earlier; shared file records remain because shared files still exist. |

## Verification

- `php -l src/CRMEB/CRMEB-master/crmeb/app/jobs/ProductCopyJob.php`: passed.
- Static inspection confirms all three job entry points return before `downloadCopyImage()` while `enable_product_copy=false`.
- Existing service and controller guards still protect:
  - Product save crafted with `type=-1`.
  - `GET /adminapi/serve/open?type=1`.
  - `POST /adminapi/serve/pay_meal` with `type=copy`.
  - `GET /adminapi/serve/meal_list?type=copy`.

## Recommendation

Do not physically delete `ProductCopyJob` yet. It is now safe from accidental execution, but it still belongs to the same mixed responsibility area as `CopyTaobaoServices` and shared remote-image download behavior.

The next batch should continue verification by checking whether `SystemAttachmentServices` can be moved away from `CopyTaobaoServices::downloadImage()` into a neutral remote-image downloader. That split would make later physical deletion decisions much cleaner.
