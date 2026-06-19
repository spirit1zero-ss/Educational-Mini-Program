# 2026-06-19 MVP slimming: admin export route coverage

## Scope

- Round scope: backend admin export route residuals.
- Strategy: add one narrow MVP route block for optional user finance export. No export controller deletion, no table deletion, no frontend build.
- Branch target: `dev3`.

## Existing state reviewed

- `app/adminapi/route/export.php` already uses `MvpRouteBlockMiddleware`.
- Existing disabled marketing exports are already blocked:
  - `export/bargain_list`
  - `export/combination_list`
  - `export/seckill_list`
  - `export/userRecharge`
  - `export/verify_order`
- Retained exports should stay available behind auth:
  - User, order, product exports.
  - Commission and basic distribution exports.
  - Member card export.
  - Point log export is not blocked in this round because sign-in can depend on point records.

## Changes made in this round

- `config/mvp.php`
  - Added `admin_route_block_patterns.enable_optional_user_features` with `export/userFinance`.

## Explicitly not changed

- Did not block `export/userCommission`; commissions are MVP-retained.
- Did not block `export/userAgent`; basic distribution remains MVP-retained.
- Did not block `export/userPoint`; sign-in can depend on point records.
- Did not delete `ExportExcel.php` or any export route definitions.
- Did not change login, users, products, orders, WeChat pay, pay callback, second-level distribution, commissions, sign-in, assessment, or member features.

## Verification notes

- Source check confirms `admin_route_block_patterns.enable_optional_user_features` includes `export/userFinance`.
- Source check confirms `export/userCommission` and `export/userPoint` were not added to the MVP block list.
- Docker/API verification was not run in this round because Docker Desktop was not running:
  - Docker API returned `failed to connect to the docker API`.
  - `http://127.0.0.1:8080` was not reachable.
- Local PHP syntax check was not run because the host shell does not have `php` on PATH.
- Follow-up verification when Docker is available:
  - `php -l config/mvp.php` should pass.
  - `GET /adminapi/export/userFinance` should return `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /adminapi/export/userCommission` should not return `MVP module disabled`; without auth it should return the original login-expired response.
  - `GET /api/product/detail/1` should still return business success with `"coupons":[]`.
