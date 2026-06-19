# 2026-06-19 MVP slimming: admin public customer-service route coverage

## Scope

Continue MVP soft-slimming without deleting files, route definitions, controllers, services, models, database tables, or frontend pages.

This round closes a backend public admin route residue for disabled customer-service capability:

- `GET /adminapi/get_workerman_url`

## Change

Updated:

- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/route.php`

Details:

- Added `get_workerman_url` to `enable_customer_service` admin route block patterns.
- Added `MvpRouteBlockMiddleware` to the unauthenticated admin route group.

The middleware is pattern based, so retained public admin routes such as login, login info, captcha, scan upload, and custom admin JS remain available unless explicitly matched by a disabled MVP rule.

## Retained

This round does not change:

- Admin login.
- Admin captcha and login info.
- Admin menu loading.
- Product, order, payment, education, sign-in, member, and basic distribution flows.
- Existing customer-service source files, controllers, pages, and kefu API files.

## Verification

Local syntax checks:

```powershell
php -l src/CRMEB/CRMEB-master/crmeb/config/mvp.php
php -l src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/route.php
```

Result:

- No syntax errors detected in `config/mvp.php`.
- No syntax errors detected in `app/adminapi/route/route.php`.

Recommended backend smoke check when the CRMEB container is running:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/login/info
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/get_workerman_url
```

Expected:

- `GET /adminapi/login/info` should remain reachable.
- `GET /adminapi/get_workerman_url` should return `MVP module disabled` while `enable_customer_service=false`.

## Notes

The broader `serve` route group still contains one-stop platform, SMS, and electronic-waybill related endpoints. It was not changed in this round because SMS/config paths may be operationally retained and need a separate route-by-route decision before blocking.
