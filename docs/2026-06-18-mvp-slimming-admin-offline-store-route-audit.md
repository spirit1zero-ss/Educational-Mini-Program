# 2026-06-18 MVP slimming: admin offline/store route coverage

## Scope

- Round scope: backend admin routes for offline payment, store pickup, store staff, and verification orders.
- Strategy: add MVP route interception only. No route file deletion, no controller deletion, no database changes.
- Branch target: `dev3`.

## Existing state reviewed

- Mobile API routes already block offline payment and store-list endpoints through `api_route_block_patterns`.
- Admin order routes already use `MvpRouteBlockMiddleware`, but offline cashier routes were not listed in `admin_route_block_patterns`.
- Admin merchant/store routes did not use `MvpRouteBlockMiddleware`, so direct `/adminapi/merchant/...` requests could bypass MVP route blocking.

## Changes made in this round

- `config/mvp.php`
  - Added `admin_route_block_patterns.enable_offline_payment` for:
    - `order/pay_offline`
    - `order/offline_scan`
    - `order/scan_list`
  - Added `admin_route_block_patterns.enable_store_pickup` for:
    - `merchant/store`
    - `merchant/store_staff`
    - `merchant/verify`
    - `export/verify_order`
- `app/adminapi/route/merchant.php`
  - Added the existing `MvpRouteBlockMiddleware` to the merchant/store route group.

## Explicitly not changed

- Did not remove merchant/store route definitions.
- Did not remove store, store staff, verification order, order, or export controllers.
- Did not change ordinary order list/detail/pay/refund routes.
- Did not change WeChat pay, pay callback, second-level distribution, commissions, sign-in, assessment, or member features.
- Did not run the full mini-program build in this soft-slimming round.

## Verification notes

- `docker exec -w /var/www/crmeb crmeb php -l config/mvp.php`
  - Result: no syntax errors.
- `docker exec -w /var/www/crmeb crmeb php -l app/adminapi/route/merchant.php`
  - Result: no syntax errors.
- `docker exec -w /var/www/crmeb crmeb php think clear`
  - Result: `Clear Successed`.
- Disabled route checks:
  - `GET /adminapi/merchant/store` returned `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /adminapi/merchant/store_staff` returned `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /adminapi/merchant/verify_order` returned `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /adminapi/order/offline_scan` returned `{"status":400,"msg":"MVP module disabled"}`.
- Retained route checks:
  - `GET /adminapi/order/info/1` returned login-expired response, not `MVP module disabled`.
  - `GET /api/product/detail/1` returned HTTP 200 business success with `"coupons":[]`.
