# 2026-06-18 MVP Logistics Route Audit

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

## Docker Validation

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

## Risk Notes

- `enable_complex_logistics` is still a P2 cautious slimming area. The current change blocks backend configuration routes only; it does not remove logistics controllers, services, models, tables, or order delivery behavior.
- Because `setting.php` is a broad route group, future `admin_route_block_patterns` must remain narrow and must not use broad `setting/` matches.

## 2026-06-22 Runtime Metadata Recheck

### Result

No physical deletion was made in this slice. Complex logistics remains a soft-disabled shared area because runtime metadata, install SQL, upgrade records, services, models, and seed data are still tied to shipping, city, and order-delivery infrastructure.

### Layer Decision Matrix

| Layer | Status | Decision |
| --- | --- | --- |
| Admin frontend pages | Present for freight company, shipping template, and city-management settings. | Retain. They are hidden or blocked through MVP routing scope rather than deleted. |
| Backend/admin routes | `freight/*`, `setting/city/*`, and `setting/shipping_templates/*` are covered by `enable_complex_logistics=false`. | Retain route files with `MvpRouteBlockMiddleware`. |
| API route docs | Runtime `eb_system_route` still has 22 matching records. Install SQL and `UpgradeController` also still seed these records. | Retain. These are not stale isolated docs; they belong to an intentionally soft-disabled shared module. |
| Controllers | `v1.freight.Express`, `v1.setting.SystemCity`, and `v1.setting.ShippingTemplates` still exist. | Retain. They back shared logistics and city infrastructure. |
| Services | `ExpressServices`, `SystemCityServices`, `ShippingTemplatesServices`, and related shipping-template services still exist. | Retain. Order delivery and shipping calculations can still depend on them. |
| DAO/Model | Shipping-template, express, and city DAO/model classes still exist. | Retain. Physical removal would require a larger logistics/order refactor. |
| Menu and permission records | Runtime `eb_system_menus` still has 32 matching records. Install SQL and `UpgradeController` also still seed matching records. | Retain for now. Removing seeded records would be a separate migration decision, not a safe residual cleanup. |
| Data tables | `eb_shipping_templates`, `eb_shipping_templates_region`, `eb_shipping_templates_free`, and `eb_shipping_templates_no_delivery` still exist. Runtime counts are `1`, `1`, `0`, and `0`. | Retain. Existing seed/default shipping data is present. |
| Install SQL and upgrade records | `public/install/crmeb.sql` and `UpgradeController` contain matching menu, route-doc, and table seed records. | Retain. Do not partially delete without a full install/upgrade compatibility plan. |

### Runtime Checks

| Path | HTTP | Payload status | Result |
| --- | --- | --- | --- |
| `/adminapi/freight/express?page=1&limit=1` | `200` | `400` | `MVP module disabled` |
| `/adminapi/setting/shipping_templates/list?page=1&limit=1` | `200` | `400` | `MVP module disabled` |
| `/adminapi/setting/city/full_list` | `200` | `400` | `MVP module disabled` |
| `/api/product/detail/1` | `200` | `200` | Control path remains healthy. |

### Validation

- PHP lint passed for `/var/www/config/mvp.php`.
- PHP lint passed for `/var/www/app/adminapi/route/freight.php`.
- PHP lint passed for `/var/www/app/adminapi/route/setting.php`.
- PHP lint passed for `/var/www/app/services/shipping/ShippingTemplatesServices.php`.

### Next Step

Continue with another small disabled metadata slice, preferably invoice or offline payment. Use the same rule: only delete runtime/install metadata when the records are isolated stale residue and not reseeded by install SQL or `UpgradeController`.
