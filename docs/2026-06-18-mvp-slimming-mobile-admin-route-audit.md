# 2026-06-18 MVP Mobile Merchant Management Route Audit

## Goal

Complete MVP disabling protection for the mobile merchant/clerk management interface. At this stage, routes, controllers, and backend `adminapi` core viewing capabilities are not deleted. Only mobile-side merchant management entry points under `api` are intercepted.

## Positioning

| Area | Location | Conclusion |
| --- | --- | --- |
| Mobile merchant management entry | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `admin/order/*`, `admin/manage/*`, and `order/order_verific` belong to mobile merchant/clerk management or write-off behavior. |
| Original middleware | `AllowOriginMiddleware`, `StationOpenMiddleware`, `AuthTokenMiddleware`, `CustomerMiddleware` | The route group did not originally use `MvpRouteBlockMiddleware`. |
| MVP API protection | `src/CRMEB/CRMEB-master/crmeb/app/api/middleware/MvpRouteBlockMiddleware.php` | Supports interception and logging according to configuration. |
| MVP configuration | `src/CRMEB/CRMEB-master/crmeb/config/mvp.php` | `enable_app_admin=false` and `enable_complex_logistics=false` cover this route set. |

## Change

- Mounted `\app\api\middleware\MvpRouteBlockMiddleware::class` in the mobile merchant-management route group.
- Added `api_route_force_block_patterns.enable_app_admin`:
  - `admin/`
- Added `api_route_block_patterns.enable_complex_logistics`:
  - `order/order_verific`

`admin/` uses forced disabling priority because the normal user order whitelist contains `order/list`, `order/detail`, and similar fragments. Mobile merchant routes such as `admin/order/list` and `admin/order/detail` include these fragments, so forced block evaluation must happen before the whitelist.

## Preservation Boundary

The following MVP core flows are not affected by this change:

- Ordinary user order creation, order payment, order detail, order list, and receipt confirmation.
- WeChat payment and payment callback.
- Backend `adminapi` user, order, product, evaluation, distribution, commission, sign-in, and member views.
- Basic secondary distribution relationships and commission records.
- Sign-in and membership functions.

## Docker Validation

PHP lint:

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php -l app/api/route/v1.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

Disabled interface spot checks:

```bash
curl -i http://127.0.0.1:8080/api/admin/order/list
curl -i http://127.0.0.1:8080/api/admin/manage/statistics
curl -i -X POST http://127.0.0.1:8080/api/order/order_verific
```

Expected result:

```json
{"status":400,"msg":"MVP module disabled"}
```

Preserved interface sampling:

```bash
curl -i http://127.0.0.1:8080/api/order/list
curl -i http://127.0.0.1:8080/api/order/detail/test
curl -i http://127.0.0.1:8080/adminapi/order/info/1
curl -i http://127.0.0.1:8080/api/sign/config
curl -i http://127.0.0.1:8080/api/user/member/card/index
```

Expected result:

- The response does not return `MVP module disabled`.
- When unauthenticated, the original CRMEB login-state error can be returned.

## Risk Notes

- This is the mobile merchant/clerk management capability, not the PC backend `adminapi`; backend core viewing capabilities are still retained.
- `order/order_verific` belongs to write-off behavior and is not needed by the current MVP. It is coupled with the store/offline scenario. Intercept first; decide on physical deletion later only after dependency checks.
- If mobile clerk delivery or write-off is needed later, turn on the corresponding switch or narrow the `admin/` interception range.

## 2026-06-22 Recheck

`POST /api/order/order_verific` still returns `MVP module disabled`. This confirms the write-off entry remains blocked while the broader store-pickup/write-off code is retained for now. See `docs/2026-06-18-mvp-slimming-admin-offline-store-route-audit.md` for the layer-by-layer deletion matrix.
