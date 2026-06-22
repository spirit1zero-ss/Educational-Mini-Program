# 2026-06-18 MVP user-side optional function routing slimming audit
## This goal
MVP disabling protection that complements optional features on the mobile user side. At this stage, the code will not be deleted, the main link of the order will not be changed, the address will not be changed, and the after-sales refund capability will not be available.
## Positioning results
| Project | Location | Conclusion || --- | --- | --- |
| Collection | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `collect/*` Non-MVP Core Competencies || Browse/visit records | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `user/visit_list`, `user/visit`, `user/set_visit` Non-MVP core capabilities || Share record | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `user/share`, `user/share/words` non-MVP core capabilities || Site message | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `user/message_system/*` Non-MVP core capabilities || User logout | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `user_cancel` Non-MVP acceptance capability || Payment/Gift | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `order/friend_detail`, `order/receive_gift`, `order/gift_detail` Non-MVP payment link || Balance statistics | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `user/balance` Non-MVP core viewing capabilities |
## This change
- Added MVP switch:
  - `enable_optional_user_features=false`
- Added in `api_route_block_patterns.enable_optional_user_features`:
  - `collect/`
  - `user/visit`
  - `user/set_visit`
  - `user/share`
  - `user/message_system`
  - `user_cancel`
  - `order/friend_detail`
  - `order/receive_gift`
  - `order/gift_detail`
  - `user/balance`
## Preserve boundaries
The following capabilities are not affected by this change:
- WeChat login, user information, training camp products, product details.
- Ordinary order confirmation, creation, payment, details, list, confirmation of receipt.
- WeChat payment and payment callback.
- Address capability: temporarily reserved to avoid affecting the physical order confirmation page.
- After-sales refund capability: temporarily reserved to avoid affecting the order status machine and after-sales process.
- Secondary distribution, commission, check-in, membership, evaluation.
## Docker verification
PHP syntax check:
```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

Disable interface spot testing:
```bash
curl -i http://127.0.0.1:8080/api/collect/user
curl -i http://127.0.0.1:8080/api/user/visit_list
curl -i -X POST http://127.0.0.1:8080/api/user/set_visit
curl -i -X POST http://127.0.0.1:8080/api/user/share
curl -i http://127.0.0.1:8080/api/user/message_system/list
curl -i http://127.0.0.1:8080/api/user_cancel
curl -i http://127.0.0.1:8080/api/order/friend_detail
curl -i http://127.0.0.1:8080/api/order/gift_detail/test
curl -i http://127.0.0.1:8080/api/user/balance
```

Expected results:
```json
{"status":400,"msg":"MVP module disabled"}
```

Keep interface sampling:
```bash
curl -i http://127.0.0.1:8080/api/user
curl -i http://127.0.0.1:8080/api/userinfo
curl -i http://127.0.0.1:8080/api/order/list
curl -i http://127.0.0.1:8080/api/order/detail/test
curl -i -X POST http://127.0.0.1:8080/api/order/pay
curl -i http://127.0.0.1:8080/api/sign/config
curl -i http://127.0.0.1:8080/api/user/member/card/index
```

Expected results:
- Does not return `MVP module disabled`.
- When not logged in, the original login state error of CRMEB can be returned.
## Risk points
- If there are still front-end entrances for favorite buttons, browsing history pages, and site mail pages, you will receive an MVP disable response; you need to continue to hide the front-end entrances in the next stage.
- `user/balance` may be used by the old user center to display balances. The current MVP does not accept the balance capability; if the interface still displays balances, it should be hidden simultaneously in the front-end entry stage.
- The address and after-sales refund will not be intercepted this time, and dependencies must be checked separately in the future.