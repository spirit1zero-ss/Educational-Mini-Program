# 2026-06-19 MVP backend user optional routing coverage audit

## scope

- Scope of this round: The optional functionality of backend user management remains.
- Strategy: Add MVP routing middleware to the backend user routing group and intercept optional user management paths only according to configured rules.
- Target branch: `dev3`.

## Status checked

- Mobile/API optional user routing is overridden by `api_route_block_patterns.enable_optional_user_features`.
- The backend optional user financial export route has been overridden by `admin_route_block_patterns.enable_optional_user_features`.
- `app/adminapi/route/user.php` still exposes backend user-optional routes that have not mounted `MvpRouteBlockMiddleware`:
  - User logout list and audit operations.
  - Newcomer gift read/save operation.

## Changes in this round

- `app/adminapi/route/user.php`
  - Add `MvpRouteBlockMiddleware` to the background user routing group.
- `config/mvp.php`
  - Add optional user routing rules in the background:
    - `user/cancel_list`
    - `user/cancel/`
    - `user/new_gift`

## Clearly unchanged

- Backend user lists, user details, user groups, user labels, user levels or membership card routing are not blocked.
- Login, users, products, orders, WeChat payment, payment callbacks, secondary distribution, commissions, check-ins, evaluations or membership functions are not blocked.
- Route definitions, controllers, models, data tables, or front-end pages were not deleted.
- The complete applet construction was not performed in this round.

## Verify records

- Docker verification completed:
  - `php -l config/mvp.php`
    - Result: No syntax errors.
  - `php -l app/adminapi/route/user.php`
    - Result: No syntax errors.
  - `php think clear`
    - Result: `Clear Successed`.
  - `GET /adminapi/user/cancel_list`
    - Result: HTTP 200 wrapped response with content `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /adminapi/user/new_gift`
    - Result: HTTP 200 wrapped response with content `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /adminapi/user/user`
    - Result: HTTP 200 wrapped response with content `{"status":401,"msg":"login expired, please log in again","data":[]}`, not `MVP module disabled`.
  - `GET /api/product/detail/1`
    - Result: HTTP 200 wrapped response with content `{"status":200,"msg":"success"}` and `coupons: []`.
