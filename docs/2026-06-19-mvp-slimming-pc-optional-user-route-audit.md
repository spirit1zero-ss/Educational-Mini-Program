# 2026-06-19 MVP PC optional user routing coverage audit
## scope
- Scope of this round: PC user optional function routing remains.
- Strategy: Add MVP routing middleware to PC logged-in user routing group, and only intercept optional user routing according to configured rules.
- Target branch: `dev3`.
## Checked status
- There is a PC logged-in user routing group in `app/api/route/pc.php`, covering the shopping cart, balance record, order list, refund order list and collection list.
- This routing group already requires `AuthTokenMiddleware`, but `MvpRouteBlockMiddleware` is not used.
- Existing `api_route_block_patterns.enable_optional_user_features` has covered app/API collection and balance paths, such as `collect/` and `user/balance`, but not the following PC paths:
  - `pc/get_balance_record/:type`
  - `pc/get_collect_list`
## Changes in this round
- `app/api/route/pc.php`
  - Added `MvpRouteBlockMiddleware` to PC logged-in user routing group.
- `config/mvp.php`
  - Added `get_balance_record` and `get_collect_list` under `api_route_block_patterns.enable_optional_user_features`.
## Clearly unchanged
- PC shopping cart routing is not blocked.
- PC order list or refund order list routes are not blocked.
- Login, user, product, order, WeChat payment, payment callback, secondary distribution, commission, check-in, evaluation or membership functions are not blocked.
- Route definitions, controllers, models, data tables, or front-end pages are not deleted.
- The complete applet construction was not performed in this round.
## Verify records
- Docker verification completed:
  - `php -l config/mvp.php`
    - Result: No syntax errors.
  - `php -l app/api/route/pc.php`
    - Result: No syntax errors.
  - `php think clear`
    - Result: `Clear Successed`.
  - `GET /api/pc/get_balance_record/0`
    - Result: HTTP 200 wrapped response with content `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /api/pc/get_collect_list`
    - Result: HTTP 200 wrapped response with content `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /api/pc/get_order_list`
    - Result: HTTP 200 wrapped response with content `{"status":401,"msg":"please log in"}`, not `MVP module disabled`.
  - `GET /api/product/detail/1`
    - Result: HTTP 200 wrapped response with content `{"status":200,"msg":"success"}` and `coupons: []`.