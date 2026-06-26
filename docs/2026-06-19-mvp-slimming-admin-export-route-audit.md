# 2026-06-19 MVP background export routing coverage audit

## scope

- Scope of this round: The background export routing remains.
- Strategy: Only add a precise MVP route interception for optional user financial exports; do not delete export controllers, do not delete data tables, and do not perform front-end builds.
- Target branch: `dev3`.

## Status checked

- `app/adminapi/route/export.php` already uses `MvpRouteBlockMiddleware`.
- Disabled marketing exports have been blocked:
  - `export/bargain_list`
  - `export/combination_list`
  - `export/seckill_list`
  - `export/userRecharge`
  - `export/verify_order`
- Preserved exports should continue to be available after authentication:
  - Export users, orders, and products.
  - Commission and base distribution exports.
  - Export membership card.
  - Points log export will not be intercepted this round because check-in may rely on points records.

## Changes in this round

- `config/mvp.php`
  - Added `export/userFinance` to `admin_route_block_patterns.enable_optional_user_features`.

## Clearly unchanged

- Unintercepted `export/userCommission`; Commissions are subject to MVP retention capabilities.
- Not intercepted `export/userAgent`; base distribution remains an MVP retained capability.
- Not intercepted `export/userPoint`; check-in may rely on points record.
- `ExportExcel.php` or any export route definitions are not removed.
- The login, user, product, order, WeChat payment, payment callback, secondary distribution, commission, check-in, evaluation or membership functions have not been modified.

## Verify records

- Source code inspection confirms that `admin_route_block_patterns.enable_optional_user_features` contains `export/userFinance`.
- Source code inspection confirmed that `export/userCommission` and `export/userPoint` were not added to the MVP interception list.
- Supplemental Docker verification has been completed once Docker Desktop is available:
  - `docker exec -w /var/www/crmeb crmeb php -l config/mvp.php`
    - Result: No syntax errors.
  - `docker exec -w /var/www/crmeb crmeb php think clear`
    - Result: `Clear Successed`.
  - `GET /adminapi/export/userFinance`
    - Result: HTTP 200 wrapped response with content `{"status":400,"msg":"MVP module disabled"}`.
  - `GET /adminapi/export/userCommission`
    - Result: HTTP 200 wrapped response with content `{"status":401,"msg":"login expired, please log in again","data":[]}`, not `MVP module disabled`.
