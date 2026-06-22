# 2026-06-21 MVP Product Copy Serve Soft Guard Audit

## Goal

Continue the product collection/product migration verification with the correct objective: prove whether the current soft slimming is safe before considering any further physical deletion.

This pass found one remaining soft-slimming gap outside the old product crawl/copy pages: the generic Yihaotong service area could still reach product-copy service operations through `serve` endpoints.

## What Was Changed

- Added backend switch `enable_product_copy=false` in `config/mvp.php`.
- Added precise controller guards in `app/adminapi/controller/v1/serve/Serve.php`:
  - `GET /adminapi/serve/meal_list?type=copy`.
  - `POST /adminapi/serve/pay_meal` with `type=copy`.
  - `GET /adminapi/serve/open?type=1`.
- Added frontend switch `isMvpProductCopyEnabled()` in `template/admin/src/config/mvp.js`.
- Hid and guarded product-copy entries in:
  - `template/admin/src/pages/notify/smsPay/index.vue`.
  - `template/admin/src/pages/notify/smsConfig/tableList.vue`.

The change does not delete the shared lower-level services. It only closes the remaining exposed product-copy service entry points.

## Deletion Status Matrix

| Layer | Current status | Reason |
| --- | --- | --- |
| Frontend page | Not deleted | The generic SMS/Yihaotong service pages remain. Product-copy tabs and direct copy actions are hidden/guarded while `enable_product_copy=false`. |
| Admin page | Not deleted | The notification/service pages are shared by SMS, logistics query, and electronic waybill features. |
| API route | Not deleted | `serve` routes are shared. Product-copy request variants are blocked inside the controller instead of removing the route group. |
| Controller | Not deleted | `Serve` remains for shared Yihaotong functionality. Product-copy branches now return `MVP module disabled`. |
| Service | Not deleted | `ServeServices::copy()` and `CopyProduct` remain because they are shared lower-level infrastructure and require a separate dependency split before deletion. |
| DAO/Model | Not applicable in this pass | No dedicated product-copy DAO/model or data table was found for the old crawl/copy module. |
| Menu records | Product crawl/copy absent | Exact product crawl/copy menu identifiers remain absent. The generic service pages remain because they are shared. |
| Data tables | Not deleted | No dedicated product crawl/copy data table was found. |
| Install SQL/migration files | Partially cleaned already | Product-copy config seed rows were removed in the previous pass. Shared copyproduct service file records remain because the files still exist. |

## Verification

Backend syntax checks:

- `php -l src/CRMEB/CRMEB-master/crmeb/config/mvp.php`: passed.
- `php -l src/CRMEB/CRMEB-master/crmeb/app/adminapi/controller/v1/serve/Serve.php`: passed.

Runtime smoke checks against `http://127.0.0.1:8011/adminapi`:

| Endpoint | Result |
| --- | --- |
| `GET /serve/open?type=1` | `status=400`, `msg=MVP module disabled` |
| `POST /serve/pay_meal` with `type=copy` | `status=400`, `msg=MVP module disabled` |
| `GET /serve/meal_list?type=copy` | `status=400`, `msg=MVP module disabled` |

Admin frontend build:

- `npm.cmd run build` in `template/admin`: passed.
- Existing warnings remain: `mini-css-extract-plugin` style-order warnings and large asset-size warnings.

Diff hygiene:

- `git diff --check` passed for touched files; only local LF-to-CRLF warnings were reported.

## Recommendation

Stop physical deletion in the product copy/crawl scope for now. The old product crawl/copy pages and routes are gone, and the remaining shared service entry points are now soft-blocked.

The next useful batch should be another verification pass, not deletion: audit whether `ProductCopyJob`, `CopyTaobaoServices::downloadCopyImage()`, and `SystemAttachmentServices::downloadImage()` can be split into a neutral remote-image downloader. Only after that split should `ServeServices::copy()` and `crmeb/services/copyproduct/*` be considered for physical deletion.
