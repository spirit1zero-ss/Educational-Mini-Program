# 2026-06-18 MVP slimming: frontend live/video fallback audit

## Scope

- Round scope: front/H5/mini-program live and short-video entry fallback checks.
- Strategy: soft hide and request guard only. No file, route, table, service, or module deletion.
- Branch target: `dev3`.

## Existing safeguards reviewed

- `template/uni-app/config/mvp.js`
  - `MVP_ENABLED = true`.
  - `HIDDEN_DDIY_COMPONENTS` already hides `liveBroadcast` and `videos`.
  - `HIDDEN_LINK_KEYWORDS` already hides links containing `columnGoods/live_list`, `live`, and `short_video`.
  - `filterMvpFooterNavigation()` keeps MVP footer navigation limited to the allowed core links.
- `template/uni-app/subpackage/diyComponents/pageDesign.vue`
  - Existing dynamic page rendering already calls `isMvpDiyItemVisible()`, so persisted DIY live/video components are filtered before render.
- `template/uni-app/components/pageFooter/index.vue`
  - Existing footer navigation handling already calls MVP link filters.

## Changes made in this round

- `template/uni-app/pages/columnGoods/live_list/index.vue`
  - Added `isMvpEnabled()` guard in `mounted()`, `getLiveList()`, and `onReachBottom()`.
  - Directly opening `/pages/columnGoods/live_list/index` in MVP mode now renders empty and does not request `wechat/live`.
- `template/uni-app/subpackage/diyComponents/liveBroadcast.vue`
  - Added `isMvpEnabled()` guard before the component requests `wechat/live`.
  - Merged the duplicate `computed` option so the existing Vuex `uid` getter remains available alongside style computed fields.

## Explicitly not changed

- Did not remove `pages.json` live-list route.
- Did not delete live, video, short-video files, APIs, tables, or services.
- Did not change product media upload or normal product image/video display paths.
- Did not change backend live route blocking rules; `config/mvp.php` remains the source of backend API/admin interception.

## Verification notes

- Source checks confirm both direct live page and DIY live component import `isMvpEnabled()` and return before calling `getLiveList()` in MVP mode.
- Docker backend check:
  - `GET /api/wechat/live?page=1&limit=10`
  - Result: HTTP 200 wrapper with `{"status":400,"msg":"MVP module disabled"}`.
- Product detail coupon regression check:
  - `GET /api/product/detail/1`
  - Result: HTTP 200 business success with `"coupons":[]`.
- Full `uni-app` build was not run in this round because `template/uni-app/node_modules` is not present in the local checkout.
