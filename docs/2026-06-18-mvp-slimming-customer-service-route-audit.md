# 2026-06-18 MVP customer-service route audit

## Scope

This note records the customer-service route alignment for MVP slimming. It does not delete code, change payment, change order behavior, or change member/sign-in behavior.

## Change

- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
  - Added explicit admin menu hide patterns under `enable_customer_service`.
  - Added explicit admin route block patterns under `enable_customer_service`.

## Why

Customer-service admin routes already sit under the broader disabled `app/` route group, but keeping explicit customer-service patterns makes the MVP slimming boundary clearer and safer for later physical deletion.

## Docker validation

PHP lint:

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

HTTP checks:

| Path | Expected result |
| --- | --- |
| `/adminapi/app/feedback` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/app/wechat/kefu` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/app/wechat/speechcraft` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/app/kefu/auto_reply/list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/api/user/member/card/index` | Original mobile auth response: `401` |
| `/api/sign/config` | Original mobile auth response: `401` |
| `/adminapi/order/info/1` | Original backend auth response: `401` |

## Notes

- This is a semantic coverage improvement. The broad `enable_app_admin=false` rule still blocks the rest of app-admin routes.
- Future deletion can use the explicit customer-service patterns to identify `feedback`, `wechat/kefu`, `speechcraft`, and `auto_reply` related code paths.
