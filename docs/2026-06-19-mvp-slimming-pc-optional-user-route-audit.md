# 2026-06-19 MVP slimming: PC optional user route coverage

## Scope

- Round scope: PC user optional feature route residuals.
- Strategy: add MVP route middleware to the PC authenticated user group and block only optional user routes by config pattern.
- Branch target: `dev3`.

## Existing state reviewed

- `app/api/route/pc.php` has a PC authenticated user group for cart, balance record, order list, refund order list, and collect list.
- The group already requires `AuthTokenMiddleware`, but did not use `MvpRouteBlockMiddleware`.
- Existing `api_route_block_patterns.enable_optional_user_features` covered app/API collection and balance paths such as `collect/` and `user/balance`, but not PC paths:
  - `pc/get_balance_record/:type`
  - `pc/get_collect_list`

## Changes made in this round

- `app/api/route/pc.php`
  - Added `MvpRouteBlockMiddleware` to the PC authenticated user route group.
- `config/mvp.php`
  - Added `get_balance_record` and `get_collect_list` under `api_route_block_patterns.enable_optional_user_features`.

## Explicitly not changed

- Did not block PC cart route.
- Did not block PC order list or refund order list routes.
- Did not block login, users, products, orders, WeChat pay, pay callback, second-level distribution, commissions, sign-in, assessment, or member features.
- Did not delete route definitions, controllers, models, tables, or frontend pages.
- Did not run a complete mini-program build in this round.

## Verification notes

- Docker verification completed:
  - `php -l config/mvp.php`
    - Result: no syntax errors.
  - `php -l app/api/route/pc.php`
    - Result: no syntax errors.
  - `php think clear`
    - Result: `Clear Successed`.
  - `GET /api/pc/get_balance_record/0`
    - Result: HTTP 200 wrapper with `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /api/pc/get_collect_list`
    - Result: HTTP 200 wrapper with `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /api/pc/get_order_list`
    - Result: HTTP 200 wrapper with `{"status":401,"msg":"请登录"}`; not `MVP module disabled`.
  - `GET /api/product/detail/1`
    - Result: HTTP 200 wrapper with `{"status":200,"msg":"success"}` and `coupons: []`.
