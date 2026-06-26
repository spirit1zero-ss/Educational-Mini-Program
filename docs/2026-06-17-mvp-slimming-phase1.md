# 2026-06-17 CRMEB MVP first phase of weight loss execution record

## Target

Without deleting the business code, changing the payment, or destroying the order state machine, first complete the first phase of MVP slimming down:

- Retain users, products, orders, WeChat payment, payment callbacks, secondary distribution, commissions, evaluations, check-ins, and members.
- Hide the P1 entrance of non-MVP in H5/mini program and backend.
- Add lightweight interception to the backend and mobile interfaces of disabled modules.
- Add a log to facilitate local troubleshooting of accidentally triggered disabled module interfaces.

## Not done at this stage

- No physical deletion of PHP controllers, services, models, database tables.
- Do not delete the official vendor, install, upgrade and core framework directories of CRMEB.
- No rewriting of payment gateways, payment callbacks, or order state machines.
- Check-in, membership, points basic flow, secondary distribution and commission links are not included in the scope of deletion.

## keep list

| Module | Current Action | Description |
| --- | --- | --- |
| WeChat login | Reserved | The mini program login link continues to follow the original logic of CRMEB. |
| Product/Product Details | Reserved | Training camp products, product details, and product list interfaces are not blocked. |
| Order/Payment/Payment Callback | Reserved | Do not change order creation, payment initiation, `pay/notify` callback. |
| Secondary Distribution/Commission | Retention | Basic spread, commission, backend commission view retention. |
| Evaluation records | Reserved | `education/assessment_records` Reserved. |
| Sign-in | Retention | Sign-in entrance, sign-in interface, and points basic record retention. |
| Member | Retention | Member center, member status, member rights-related entrances and interfaces are retained. |

## Front-end entrance hidden

| Subsystem | File | Action |
| --- | --- | --- |
| Mini program/H5 MVP configuration | `src/CRMEB/CRMEB-master/template/uni-app/config/mvp.js` | Hide P1 links and DIY components such as coupons, pre-sales, lottery draws, customer service, CMS/articles, short videos, etc.; sign-in, membership retention components. |
| Mini Program/H5 Menu Component | `src/CRMEB/CRMEB-master/template/uni-app/subpackage/diyComponents/menus.vue` | Filter MVP disabled links before menu rendering and click jump. |
| Mini Program/H5 Customer Service Portal | `components/kefuIcon/index.vue`, `subpackage/diyComponents/customerService.vue`, `utils/index.js` | MVP mode hides customer service pop-up windows and customer service components, and prevents customer service from jumping. |
| Backend marketing routing | `src/CRMEB/CRMEB-master/template/admin/src/router/modules/marketing.js` | Only the routes related to sign-in, member configuration, and points basic records are retained. |
| Backend external page | `src/CRMEB/CRMEB-master/template/admin/src/router/routers.js` | Hide customer service related frameOut routing, retain login and order printing. |

## Backend interface interception

| Subsystem | File | Action |
| --- | --- | --- |
| MVP Configuration | `src/CRMEB/CRMEB-master/crmeb/config/mvp.php` | Added `admin_route_allow_patterns`, `admin_route_block_patterns`, `api_route_allow_patterns`, `api_route_block_patterns`. |
| Background interception | `src/CRMEB/CRMEB-master/crmeb/app/adminapi/middleware/MvpRouteBlockMiddleware.php` | Disable module background interface returns `MVP module disabled`. |
| Mobile interception | `src/CRMEB/CRMEB-master/crmeb/app/api/middleware/MvpRouteBlockMiddleware.php` | Disable the module mobile interface to return `MVP module disabled`. |
| Background route mounting | `adminapi/route/app.php`, `cms.php`, `diy.php`, `live.php`, `marketing.php` | Mount MVP interception middleware before authentication to facilitate local troubleshooting without token. |
| Mobile terminal routing mounting | `app/api/route/v1.php`, `v2.php` | Mount MVP interception middleware in the authorization group before authentication. |

## Currently disabled switch

| switches | defaults | override modules |
| --- | --- | --- |
| `enable_coupon` | `false` | Coupon collection, list, order coupons. |
| `enable_bargain` | `false` | Bargain. |
| `enable_combination` | `false` | Group-building. |
| `enable_seckill` | `false` | Flash sale. |
| `enable_presell` | `false` | Presale/advance. |
| `enable_points` | `false` | Points mall gameplay, does not include basic turnover of sign-in points. |
| `enable_recharge` | `false` | Recharge. |
| `enable_live` | `false` | Mini program live broadcast. |
| `enable_lottery` | `false` | Lottery. |
| `enable_customer_service` | `false` | Customer Service. |
| `enable_cms` | `false` | CMS/article backend. |
| `enable_app_admin` | `false` | Application background management. |
| `enable_page_diy` | `false` | Backend DIY page and mobile color changing interface. |
| `enable_invoice` | `false` | Invoice. |

## log

Write to the ThinkPHP log when a disabled interface is hit:

- Backend: `[MVP] blocked admin route`
- Mobile terminal: `[MVP] blocked api route`

Log fields include:

- `path`
- `switch`
- `pattern`

## Local verification command

Executed or recommended:

```bash
git diff --check
```

Docker PHP syntax check:

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php -l app/adminapi/middleware/MvpRouteBlockMiddleware.php
docker exec -w /var/www/crmeb crmeb-local php -l app/api/middleware/MvpRouteBlockMiddleware.php
docker exec -w /var/www/crmeb crmeb-local php -l app/api/route/v1.php
docker exec -w /var/www/crmeb crmeb-local php -l app/api/route/v2.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

Front-end build:

```bash
npm run build
cd src/CRMEB/CRMEB-master/template/admin
npm run build
cd ../uni-app
npm run build:mp-weixin
```

## HTTP spot test path

After the Docker service is stable, use the following path for random testing:

Should be intercepted:

```bash
curl http://127.0.0.1:8080/api/coupons
curl http://127.0.0.1:8080/api/v2/coupons
curl http://127.0.0.1:8080/api/v2/lottery/record
curl http://127.0.0.1:8080/adminapi/marketing/coupon
curl http://127.0.0.1:8080/adminapi/cms/article
```

Should continue to be reachable or enter the original authentication/business logic:

```bash
curl http://127.0.0.1:8080/api/sign/config
curl http://127.0.0.1:8080/api/product/detail/1
curl http://127.0.0.1:8080/api/v2/diy/sign
curl http://127.0.0.1:8080/adminapi/marketing/sign/rewards
curl http://127.0.0.1:8080/adminapi/member_config
```

## Current risks

- MySQL in the local `crmeb-local` container repeatedly exits and restarts, and the HTTP interface sampling test times out; the runtime behavior needs to be confirmed after restoring the stability of Docker/MySQL.
- `api_route_block_patterns` is intercepted by path pattern. If accidental damage is found later, you can add whitelist to `api_route_allow_patterns` first.
- The points mall gameplay has been disabled, but check-in depends on the points account, points flow, and points display. The underlying ability of points cannot be deleted directly in the future.
- Distribution cannot be deleted as a whole, only basic second-level distribution/commission and advanced agent/business department can be split.
- It is still the first stage of downsizing, and the complete MVP acceptance checklist must be re-run before the files are actually physically deleted.

## 2026-06-17 Runtime retest supplement

The container `crmeb-local` subsequently returned to a stable operating state, and the MySQL process has continued to run. After clearing the ThinkPHP cache, retest as follows:

Confirmed to be intercepted by MVP:

| Path | Result |
| --- | --- |
| `/api/coupons` | `{"status":400,"msg":"MVP module disabled"}` |
| `/api/v2/coupons` | `{"status":400,"msg":"MVP module disabled"}` |
| `/api/v2/lottery/record` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/marketing/coupon/released` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/marketing/bargain` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/marketing/lottery/list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/diy/get_list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/cms/cms` | `{"status":400,"msg":"MVP module disabled"}` |

It has been confirmed that it has not been intercepted by MVP and the original authentication logic is entered:

| Path | Result |
| --- | --- |
| `/api/sign/config` | `{"status":401,"msg":"please log in"}` || `/api/user/member/card/index` | `{"status":401,"msg":"please log in"}` || `POST /api/education/assessment_records` | `{"status":401,"msg":"please log in"}` || `/adminapi/marketing/sign/rewards` | `{"status":401,"msg":"login expired, please log in again","data":[]}` || `/adminapi/marketing/integral` | `{"status":401,"msg":"login expired, please log in again","data":[]}` |
Fixed and confirmed recovery:

| Path | Result |
| --- | --- |
| `/api/index` | `{"status":200,"msg":"success",...}` |
| `/api/products` | `{"status":200,"msg":"success",...}` |
| `/api/category` | `{"status":200,"msg":"success",...}` |

Repair instructions:

- `/api/index` and `/api/products` timeouts from product lists still querying disabled campaign and coupon tags.
- In MVP mode, when coupons, price bargaining, group buying, and flash sales are all disabled, the product service skips these activity tag queries and only returns ordinary product data.
- This fix does not affect product details, orders, payments, check-ins, memberships, reviews, and distribution commission links.

## 2026-06-17 Exposed surface retest supplement

After continuing to audit the P1 exposure surface, complete the following interceptions:

| Path | Result |
| --- | --- |
| `/api/article/category/list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/api/theme/article` | `{"status":400,"msg":"MVP module disabled"}` |
| `/api/user/activity` | `{"status":400,"msg":"MVP module disabled"}` |
| `/api/v2/diy/color_change/red` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/finance/recharge` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/export/bargain_list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/export/combination_list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/export/seckill_list` | `{"status":400,"msg":"MVP module disabled"}` |

Keep the link intact:

| Path | Result |
| --- | --- |
| `/adminapi/export/userCommission` | `{"status":401,"msg":"login expired, please log in again","data":[]}` |
Still need follow-up investigation:

- `/api/education/assessment_records` has been used to confirm entry into the original authentication; the complete save still needs to return with the login status and evaluation payload.
