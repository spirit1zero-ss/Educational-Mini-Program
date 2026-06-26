# 2026-06-18 MVP Customer Service Routing Audit

## scope

This article records the alignment of customer service routing in MVP slimming. In this round, codes will not be deleted, payments will not be modified, order behavior will not be modified, and membership or check-in functions will not be affected.

## change

- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
  - Add clear background menu hiding rules under `enable_customer_service`.
  - Add clear background routing interception rules under `enable_customer_service`.

## reason

The customer service background routing is already under the larger disabled `app/` routing group, but clear customer service rules are retained, which can make the MVP thinning boundary clearer and facilitate dependency judgment before subsequent physical deletion.

## Docker verification

PHP syntax check:

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

HTTP inspection:

| Path | Expected results |
| --- | --- |
| `/adminapi/app/feedback` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/app/wechat/kefu` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/app/wechat/speechcraft` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/app/kefu/auto_reply/list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/api/user/member/card/index` | Keep the original mobile terminal authentication response: `401` |
| `/api/sign/config` | Keep the original mobile terminal authentication response: `401` |
| `/adminapi/order/info/1` | Keep the original background authentication response: `401` |

## illustrate

- This round is a semantic coverage enhancement. The wider `enable_app_admin=false` rule will still block the remaining app background routes.
- These explicit customer service rules can be used to locate `feedback`, `wechat/kefu`, `speechcraft` and `auto_reply` related code paths before subsequent physical deletion.
