# 2026-06-18 MVP logistics route audit

## Scope

This note records the follow-up audit for disabled MVP logistics configuration routes. It does not delete code, change order delivery, change payment, or change the order state machine.

## Change

- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
  - Added `admin_route_block_patterns.enable_complex_logistics` rules for backend freight, city-data, and shipping-template configuration routes.
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/freight.php`
  - Mounted the existing `MvpRouteBlockMiddleware` on the backend freight route group.
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/setting.php`
  - Mounted the existing `MvpRouteBlockMiddleware` on the backend setting route group.
  - Only configured disabled-path matches are blocked. Core settings and member routes continue through the original auth/business flow.

## Preserved

- Order routes under `/adminapi/order/*` remain available unless they match a separate disabled MVP rule.
- Mobile order logistics routes remain untouched.
- Sign-in and membership routes remain preserved for MVP.

## Docker validation

PHP lint:

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php -l app/adminapi/route/freight.php
docker exec -w /var/www/crmeb crmeb-local php -l app/adminapi/route/setting.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

HTTP checks:

| Path | Expected result |
| --- | --- |
| `/adminapi/freight/express` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/setting/shipping_templates/list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/setting/city/full_list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/order/info/1` | Original backend auth response: `401` |
| `/adminapi/user/member/ship` | Original backend auth response: `401` |
| `/adminapi/user/member/right` | Original backend auth response: `401` |
| `/api/user/member/card/index` | Original mobile auth response: `401` |
| `/api/sign/config` | Original mobile auth response: `401` |

## Risk notes

- `enable_complex_logistics` is still a P2 cautious slimming area. The current change blocks backend configuration routes only; it does not remove logistics controllers, services, models, tables, or order delivery behavior.
- Because `setting.php` is a broad route group, future `admin_route_block_patterns` must remain narrow and must not use broad `setting/` matches.
