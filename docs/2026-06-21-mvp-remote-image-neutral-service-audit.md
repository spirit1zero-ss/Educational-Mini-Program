# 2026-06-21 MVP Remote Image Neutral Service Audit

## Goal

Continue validating the soft-slimming boundary before any broader physical deletion. This pass focuses on removing normal attachment remote-image upload from the product-copy service namespace.

## Finding

`SystemAttachmentServices::onlineUpload()` still called `CopyTaobaoServices::downloadImage()`. That meant a normal attachment feature depended on a service named for product collection/copy, making it unsafe to reason about physical deletion of product-copy code.

## Change Made

Added a neutral service:

- `app/services/system/attachment/RemoteImageServices.php`.

Updated:

- `SystemAttachmentServices::onlineUpload()` now calls `RemoteImageServices::downloadImage()`.

The new service preserves the remote-image download behavior needed by attachments, including:

- configured upload storage via `sys_config('upload_type', 1)`;
- common anti-hotlink headers for platforms such as Taobao, Tmall, JD, and 1688;
- the same attachment upload metadata shape used by `SystemAttachmentServices`.

## Dependency Result

After this change, static search shows:

- `SystemAttachmentServices` no longer imports or calls `CopyTaobaoServices`.
- The remaining `CopyTaobaoServices` reference in this dependency area is `ProductCopyJob`, which is already soft-guarded by `enable_product_copy=false`.

This is meaningful progress toward isolating product-copy code from normal platform behavior.

## Deletion Status Matrix

| Layer | Current status | Reason |
| --- | --- | --- |
| Frontend page | Not deleted | Shared pages remain; product-copy controls are hidden/guarded. |
| Admin page | Not deleted | Shared notification/Yihaotong and attachment pages remain. |
| API route | Not deleted | Shared routes remain; product-copy variants are blocked. |
| Controller | Not deleted | Shared controllers remain. |
| Service | Partially split, not deleted | Normal attachment remote-image upload now uses `RemoteImageServices`; product-copy-specific `CopyTaobaoServices` remains only for guarded product-copy paths. |
| Queue job | Not deleted | `ProductCopyJob` remains but returns early while `enable_product_copy=false`. |
| DAO/Model | No deletion candidate found | No dedicated product-copy DAO/model was found. |
| Menu records | Product crawl/copy absent | Exact product crawl/copy menu identifiers remain absent. |
| Data tables | No deletion candidate found | No dedicated product-copy data table was found. |
| Install SQL/migration files | Not changed in this pass | Shared file records still remain because the shared and product-copy files still exist. |

## Verification

- `php -l app/services/system/attachment/RemoteImageServices.php`: passed.
- `php -l app/services/system/attachment/SystemAttachmentServices.php`: passed.
- Static search confirms `SystemAttachmentServices` now references `RemoteImageServices` and no longer references `CopyTaobaoServices`.
- Repository search for direct `CopyTaobaoServices::downloadImage()` attachment usage now only leaves the guarded product-copy job import path.

## Recommendation

Do not delete `CopyTaobaoServices` yet. It is now more isolated, but `ProductCopyJob` and the guarded `StoreProductServices` product-copy branch still reference product-copy image handling.

The next small batch should verify whether the guarded `type == -1` branch and `ProductCopyJob` can be physically removed together, or whether they should remain as inert compatibility code for one more release cycle.
