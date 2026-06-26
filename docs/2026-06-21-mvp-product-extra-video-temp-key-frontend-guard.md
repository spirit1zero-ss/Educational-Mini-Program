# 2026-06-21 MVP Product Extra Video Temp-Key Frontend Guard

## Goal

Prevent MVP-disabled product-extra video upload paths from requesting `product/product/get_temp_keys` on the admin frontend.

The backend `get_temp_keys` endpoint was already evaluated as a product-extra surface that should stay blocked in MVP mode. This round adds frontend-side soft guards so hidden or optional video upload surfaces fail early before they request temporary upload credentials.

## Changes

- Added `isMvpProductExtrasEnabled()` checks before `productGetTempKeysApi(...)` calls in generic admin video upload components:
  - `src/CRMEB/CRMEB-master/template/admin/src/components/uploadVideo/index.vue`
  - `src/CRMEB/CRMEB-master/template/admin/src/components/uploadVideo/index copy.vue`
  - `src/CRMEB/CRMEB-master/template/admin/src/components/uploadVideo2/index.vue`
  - `src/CRMEB/CRMEB-master/template/admin/src/components/uploadVideo2/index copy.vue`
  - `src/CRMEB/CRMEB-master/template/admin/src/components/uploadVideos/index copy.vue`
- Added the same guard to non-product pages that could still trigger the shared video temp-key flow:
  - `src/CRMEB/CRMEB-master/template/admin/src/pages/marketing/recharge/index.vue`
  - `src/CRMEB/CRMEB-master/template/admin/src/pages/system/group/visualization.vue`
- Kept backend routes and controller methods in place. This round only adds frontend soft guards and does not perform physical deletion.

## Validation

- Searched all admin frontend `productGetTempKeysApi(...)` call sites and confirmed MVP guard coverage around the active calls.
- Confirmed `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/index.vue` already had an MVP guard around its temp-key flow.
- Ran the admin frontend production build with Node `v16.20.2`.

Build result:

- `npm.cmd run build`: passed.
- Remaining output only included existing-style warnings:
  - `mini-css-extract-plugin` CSS order warnings.
  - Asset and entrypoint size warnings.

## Notes

- `src/CRMEB/CRMEB-master/template/admin/src/pages/marketing/sign/index.vue` still imports `productGetTempKeysApi`, but no active call site was found in that file.
- The shared video upload UI may still render where the surrounding page allows it. This round blocks the cloud temp-key request path; it does not redesign or remove every UI entry point.

## Next Recommendation

Continue with a small backend-and-frontend audit of virtual product import/card-key surfaces:

- Review `importCard` and virtual-product save fields.
- Confirm which routes are already blocked by MVP config.
- Add frontend guards where MVP-disabled UI can still submit virtual-card data.
- Avoid physical deletion until route, UI, database seed, and build checks are complete.

Keep the next round narrow: audit one surface, patch guards only where necessary, run focused build or syntax checks, then record the result in English.
