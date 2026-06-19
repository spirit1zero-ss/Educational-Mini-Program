# 2026-06-19 MVP slimming: admin user optional route coverage

## Scope

- Round scope: admin user-management optional feature residuals.
- Strategy: add MVP route middleware to the admin user route group and block only optional user-management paths by config pattern.
- Branch target: `dev3`.

## Existing state reviewed

- Mobile/API optional user routes were already covered by `api_route_block_patterns.enable_optional_user_features`.
- Admin export optional user finance route was already covered by `admin_route_block_patterns.enable_optional_user_features`.
- `app/adminapi/route/user.php` still exposed admin user optional routes without `MvpRouteBlockMiddleware`:
  - user cancellation list and review actions.
  - new user gift read/save actions.

## Changes made in this round

- `app/adminapi/route/user.php`
  - Added `MvpRouteBlockMiddleware` to the admin user route group.
- `config/mvp.php`
  - Added admin optional user route patterns:
    - `user/cancel_list`
    - `user/cancel/`
    - `user/new_gift`

## Explicitly not changed

- Did not block admin user list, user detail, user grouping, user labels, user levels, or member-card routes.
- Did not block login, users, products, orders, WeChat pay, pay callback, second-level distribution, commissions, sign-in, assessment, or member features.
- Did not delete route definitions, controllers, models, tables, or frontend pages.
- Did not run a complete mini-program build in this round.

## Verification notes

- Docker verification completed:
  - `php -l config/mvp.php`
    - Result: no syntax errors.
  - `php -l app/adminapi/route/user.php`
    - Result: no syntax errors.
  - `php think clear`
    - Result: `Clear Successed`.
  - `GET /adminapi/user/cancel_list`
    - Result: HTTP 200 wrapper with `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /adminapi/user/new_gift`
    - Result: HTTP 200 wrapper with `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /adminapi/user/user`
    - Result: HTTP 200 wrapper with `{"status":401,"msg":"登录已过期,请重新登录","data":[]}`; not `MVP module disabled`.
  - `GET /api/product/detail/1`
    - Result: HTTP 200 wrapper with `{"status":200,"msg":"success"}` and `coupons: []`.
