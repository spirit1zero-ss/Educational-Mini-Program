# MVP Product Copy Notify UI Physical Cleanup

Date: 2026-06-21

## Objective

Verify and clean the remaining admin notify/Yihaotong UI surface for the retired product copy feature.

The goal remains safety verification first. Physical deletion is limited to the proven product-copy UI slice inside shared notify/Yihaotong pages. SMS, logistics query, and electronic waybill UI paths are retained.

## Scope

This pass covers:

- `template/admin/src/pages/notify/smsPay/index.vue`
- `template/admin/src/pages/notify/smsConfig/tableList.vue`
- `template/admin/src/pages/notify/smsConfig/index.vue`
- `template/admin/src/api/setting.js`
- `template/admin/src/config/mvp.js`

## Changes

- Removed the product-copy tab from the Yihaotong payment page.
- Removed product-copy package labels and remaining copy-specific payment page state.
- Removed the product-copy tab, unopened-state copy, record-list columns, and open-service branch from the notify service table.
- Removed the parent page's product-copy service state update.
- Removed the unused `serveOpnOtherApi()` frontend wrapper for `serve/open`.
- Removed the unused frontend `isMvpProductCopyEnabled()` helper and `PRODUCT_COPY_ENABLED` constant.
- Kept a generic payment-page allowlist so unsupported `type` query values fall back to `sms`.

## Verification

Frontend search:

- Search for `Product collection`, `isMvpProductCopyEnabled`, `PRODUCT_COPY_ENABLED`, `serveOpnOtherApi`, product-copy tab names, and product-copy service open branches returned no hits in the notify UI, `setting.js`, and `mvp.js` scope.

Build:

- `npm.cmd run build` in `template/admin`: passed.
- Existing build warnings remain limited to CSS extraction order and large asset sizes.

Backend control checks from the previous guard pass still apply:

- Legacy product copy/crawl endpoints return `404`.
- Shared `serve/open?type=1`, `serve/meal_list?type=copy`, and `serve/pay_meal` copy inputs return `MVP module disabled`.
- Normal product detail still returns `success`.

## Layer Decision

| Layer | Status |
| --- | --- |
| Frontend page | Product-copy UI slice physically removed from shared notify/Yihaotong pages. Shared pages remain. |
| Admin page | Shared notify/Yihaotong pages remain for SMS, logistics query, and electronic waybill. |
| API route | No additional route delete in this pass. Shared routes remain and copy inputs are blocked. |
| Controller | No additional controller delete in this pass. `Serve::payMeal()` already blocks normalized copy inputs. |
| Service | No additional service delete in this pass. Product-copy service chain was removed earlier; shared Yihaotong services remain. |
| DAO/Model | No dedicated product-copy DAO/model exists. |
| Menu records | Product copy/crawl menu rows remain absent. |
| Data tables | No dedicated product copy/crawl tables found. |
| Install SQL / migration files | No new install or migration change was needed for this frontend cleanup. Product copy/crawl seed and file records were already cleaned. |

## Recommendation

Treat the notify/Yihaotong product-copy UI surface as retired. Do not delete the shared notify/Yihaotong page files because they still serve SMS, logistics query, and electronic waybill workflows.
