# 2026-06-18 MVP client kefuapi routing slimming audit

## This time's goal

Complete the MVP disabling protection of the customer service independent `kefuapi` route. At this stage, the customer service code, routing files, and order/payment/distribution/check-in/membership core links will not be physically deleted.

## Positioning results

| Project | Location | Conclusion |
| --- | --- | --- |
| Customer service side routing entrance | `src/CRMEB/CRMEB-master/crmeb/app/kefuapi/route/route.php` | Independent from `api`, `adminapi`, originally only mounted cross-domain and customer service authentication |
| MVP configuration | `src/CRMEB/CRMEB-master/crmeb/config/mvp.php` | `enable_customer_service=false`, customer service belongs to P1 non-MVP function |
| New middleware | `src/CRMEB/CRMEB-master/crmeb/app/kefuapi/middleware/MvpRouteBlockMiddleware.php` | Intercept and disable routing based on `kefuapi_route_block_patterns` |
| Log location | `runtime/log/20260618.log` | Log on hit `[MVP] blocked kefuapi route` |

## This change

- Added `app/kefuapi/middleware/MvpRouteBlockMiddleware.php`.
- Mount MVP protection on the `app/kefuapi/route/route.php` root routing group.
- Add `kefuapi_route_block_patterns` in `config/mvp.php`:
  - `login`
  - `key`
  - `scan`
  - `config`
  - `wechat`
  - `upload`
  - `user`
  - `order`
  - `product`
  - `service`
  - `tourist`

## preserve boundaries

The following MVP core capabilities are not affected by this change:

- WeChat login, user, product, product details, order, WeChat payment, payment callback.
- Secondary distribution relationship and commission flow.
- Evaluation records.
- Sign-in entrance, sign-in record, and points-based link that sign-in relies on.
- Member center, member status, member rights.
- Backend users, orders, products, reviews, distribution, commissions, check-ins, and member views.

## Docker verification

PHP syntax check:

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php -l app/kefuapi/middleware/MvpRouteBlockMiddleware.php
docker exec -w /var/www/crmeb crmeb-local php -l app/kefuapi/route/route.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

Interface sampling test:

```bash
curl -i http://127.0.0.1:8080/kefuapi/config
curl -i http://127.0.0.1:8080/kefuapi/tourist/user
curl -i -X POST http://127.0.0.1:8080/kefuapi/login
curl -i -X POST http://127.0.0.1:8080/kefuapi/service/speechcraft
curl -i -X POST http://127.0.0.1:8080/kefuapi/upload
```

Expected results:

```json
{"status":400,"msg":"MVP module disabled"}
```

Reserved link random test:

```bash
curl -i http://127.0.0.1:8080/api/sign/config
curl -i http://127.0.0.1:8080/api/user/member/card/index
curl -i http://127.0.0.1:8080/adminapi/order/info/1
```

Expected results:

- Does not return `MVP module disabled`.
- It is allowed to return the original login state error of CRMEB in non-login environment, such as `please log in` or `login expired`.

Log check:

```bash
docker exec -w /var/www/crmeb crmeb-local sh -lc "grep -n '\\[MVP\\] blocked kefuapi route' runtime/log/20260618.log | tail -8"
```

It has been verified locally that the following types of records appear:

```text
[MVP] blocked kefuapi route: {"path":"config","switch":"enable_customer_service","pattern":"config$"}
[MVP] blocked kefuapi route: {"path":"tourist/user","switch":"enable_customer_service","pattern":"user/"}
[MVP] blocked kefuapi route: {"path":"login","switch":"enable_customer_service","pattern":"login$"}
```

## Risk point

- `kefuapi` is an independent application route and cannot only rely on `api` or `adminapi` middleware coverage.
- Currently it is "disable interception", not physical deletion; before actually deleting the customer service module, you need to check the front-end `api/kefu.js`, customer service page, Workerman/long connection configuration and background customer service configuration references.
- The `user/` rule will override `tourist/user`, which is expected behavior because guest customer service is also a customer service system capability.
- If you re-enable customer service later, you only need to open `enable_customer_service`, and there is no need to restore the routing file.
