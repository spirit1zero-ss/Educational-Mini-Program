# 2026-06-19 MVP slimming: admin user frontend route coverage

## Scope

- Round scope: admin frontend route residuals for optional user-management features.
- Strategy: hide the admin user cancellation route in MVP mode while keeping core user and member routes intact.
- Branch target: `dev3`.

## Existing state reviewed

- Backend admin user optional routes are already blocked by `MvpRouteBlockMiddleware` and `admin_route_block_patterns.enable_optional_user_features`.
- Admin marketing `newuser/gift` exists in source, but `marketing.js` already filters routes through `MVP_MARKETING_ROUTE_NAMES` and does not include `marketing_gift`.
- Admin user `cancel` route still existed in `template/admin/src/router/modules/user.js`.

## Changes made in this round

- `template/admin/src/router/modules/user.js`
  - Imported `isMvpEnabled`.
  - Converted the exported route object to `userRouter`.
  - In MVP mode, filters out only the `user_cancel` route.

## Explicitly not changed

- Did not hide admin user list, user levels, user groups, user labels, recharge detail route, member type, member card, member records, or member rights routes.
- Did not change backend route definitions, controllers, models, tables, payment, orders, distribution, commissions, sign-in, assessment, or member features.
- Did not run a complete mini-program build in this round.

## Verification notes

- Source verification completed:
  - `template/admin/src/router/modules/user.js` imports `isMvpEnabled` and filters `user_cancel` when MVP mode is enabled.
  - `template/admin/src/router/modules/marketing.js` keeps `marketing_gift` outside `MVP_MARKETING_ROUTE_NAMES`.
- Docker backend smoke verification completed:
  - `GET /adminapi/user/cancel_list`
    - Result: HTTP 200 wrapper with `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /adminapi/user/user`
    - Result: HTTP 200 wrapper with `{"status":401,"msg":"登录已过期,请重新登录","data":[]}`; not `MVP module disabled`.
  - `GET /api/product/detail/1`
    - Result: HTTP 200 wrapper with `{"status":200,"msg":"success"}` and `coupons: []`.
- Full admin/frontend build was intentionally deferred until the pre-physical-deletion verification stage.
