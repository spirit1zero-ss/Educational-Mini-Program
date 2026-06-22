# 2026-06-18 MVP front-end live broadcast/video audit

## scope

- Scope of this round: front desk/H5/mini program live broadcast and short video entrance thorough inspection.
- Strategy: Only perform soft hiding and request protection; do not delete files, routes, data tables, services or modules.
- Target branch: `dev3`.

## Protection checked

- `template/uni-app/config/mvp.js`
  - `MVP_ENABLED = true`.
  - `HIDDEN_DDIY_COMPONENTS` already hides `liveBroadcast` and `videos`.
  - `HIDDEN_LINK_KEYWORDS` already hides links containing `columnGoods/live_list`, `live`, and `short_video`.
  - `filterMvpFooterNavigation()` keeps MVP footer navigation limited to the allowed core links.
- `template/uni-app/subpackage/diyComponents/pageDesign.vue`
  - Existing dynamic page rendering has called `isMvpDiyItemVisible()`, and the persistent DIY live broadcast/video components will be filtered before rendering.
- `template/uni-app/components/pageFooter/index.vue`
  - Existing bottom navigation handling already calls MVP link filtering.

## Changes in this round

- `template/uni-app/pages/columnGoods/live_list/index.vue`
  - Added `isMvpEnabled()` protection in `mounted()`, `getLiveList()` and `onReachBottom()`.
  - When `/pages/columnGoods/live_list/index` is opened directly in MVP mode, the rendering is empty and `wechat/live` is not requested.
- `template/uni-app/subpackage/diyComponents/liveBroadcast.vue`
  - Add `isMvpEnabled()` protection before the component requests `wechat/live`.
  - Merge duplicate `computed` configuration to ensure that the original Vuex `uid` getter and style calculated fields are available at the same time.

## Clearly unchanged

- Live list route in `pages.json` not removed.
- Live broadcasts, videos, short video files, APIs, data tables or services are not deleted.
- The product media upload or normal product image/video display paths have not been modified.
- The backend live broadcast route interception rules have not been modified; `config/mvp.php` is still the backend API/backend interception source.

## Verify records

- The source code check confirms that both the live broadcast direct page and the DIY live broadcast component import `isMvpEnabled()` and return before calling `getLiveList()` in MVP mode.
- Docker backend check:
  - `GET /api/wechat/live?page=1&limit=10`
  - Result: HTTP 200 wrapped response with content `{"status":400,"msg":"MVP module disabled"}`.
- Product Details Coupon Return Check:
  - `GET /api/product/detail/1`
  - Result: HTTP 200 business response successfully, with `"coupons":[]`.
- A full `uni-app` build was not performed this round because the local checkout directory is missing `template/uni-app/node_modules`.
