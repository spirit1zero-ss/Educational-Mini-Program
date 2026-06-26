# 2026-06-19 MVP background user front-end routing coverage audit
## scope
- Scope of this round: routing remnants of optional user management functions in the backend and frontend.
- Strategy: Hide background user logout routing in MVP mode while keeping core user and member routing unchanged.
- Target branch: `dev3`.
## Checked status
- Backend user optional routing has been intercepted by `MvpRouteBlockMiddleware` and `admin_route_block_patterns.enable_optional_user_features`.
- Backend marketing `newuser/gift` still exists in the source code, but `marketing.js` has been filtered through `MVP_MARKETING_ROUTE_NAMES` and does not contain `marketing_gift`.
- Backend user `cancel` route still exists in `template/admin/src/router/modules/user.js`.
## Changes in this round
- `template/admin/src/router/modules/user.js`
  - Introduced `isMvpEnabled`.
  - Changed exported routing object to `userRouter`.
  - Only filter `user_cancel` routes in MVP mode.
## Clearly unchanged
- The backend user list, user level, user grouping, user label, recharge details routing, membership type, membership card, membership record or membership rights routing are not hidden.
- No modifications to backend route definitions, controllers, models, data tables, payments, orders, distribution, commissions, check-ins, reviews, or membership functions.
- The complete applet construction was not performed in this round.
## Verify records
- Source code verification completed:
  - `template/admin/src/router/modules/user.js` introduces `isMvpEnabled` and filters `user_cancel` when MVP mode is on.
  - `template/admin/src/router/modules/marketing.js` remains `marketing_gift` without entering `MVP_MARKETING_ROUTE_NAMES`.
- Docker backend smoke test completed:
  - `GET /adminapi/user/cancel_list`
    - Result: HTTP 200 wrapped response with content `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /adminapi/user/user`
    - Result: HTTP 200 wrapped response with content `{"status":401,"msg":"login expired, please log in again","data":[]}`, not `MVP module disabled`.
  - `GET /api/product/detail/1`
    - Result: HTTP 200 wrapped response with content `{"status":200,"msg":"success"}` and `coupons: []`.
- Full backend/frontend builds are intentionally delayed until the verification phase before physical removal.