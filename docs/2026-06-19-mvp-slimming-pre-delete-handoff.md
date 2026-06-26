# 2026-06-19 MVP slimming pre-delete handover document

## Documentation purpose

This article documents the current boundaries of MVP slimming before entering physical deletion. Currently still in a soft slimming state: feature source code remains but is disabled via hiding, front-end protection or routing interception when MVP mode is enabled.

Do not delete files, database tables, route definitions, controllers, services, models, or front-end pages before completing the validation thresholds of this article.

## Current MVP Baseline

MVP mode is enabled by the following configuration:

- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
- `src/CRMEB/CRMEB-master/template/uni-app/config/mvp.js`
- `src/CRMEB/CRMEB-master/template/admin/src/config/mvp.js`

Currently the main product range reserved:

- Login and user identity.
- Product listings and product details.
- Shopping cart, order placement, order list/details, order payment and order callback.
- WeChat payment and payment notification callbacks.
- Basic secondary distribution, promotional relationships, commission display and commission records.
- Training camp product path.
- Evaluation records.
- Sign in.
- Member/user levels and membership card related functions.
- Backend core user, product, order, finance/commission, education and membership views.

## Must keep list

The following capabilities must continue to be available during physical deletion:

- Mini program login:
  - WeChat login page and authorization interface.
  - CRMEB authorization token process.
- commodity:
  - `GET /api/products`
  - `GET /api/product/detail/:id`
  - PC product list, for example `GET /api/pc/get_products`
  - In MVP mode, product details must continue to return `coupons: []` and cannot fail.
- Order and payment:
  - Ordering, payment, details, listing and receiving process.
  - `pay/notify` callback.
  - WeChat payment configuration and callback processing.
- Distribution and commissions:
  - Basic `spread` routing and commission routing.
  - Backend financial commission list.
  - Does not delete the underlying `spread`, `brokerage` or currently retained commission data paths.
- Evaluation:
  - `POST /api/education/assessment_records`
  - Backstage education assessment record list/details.
- Sign-in and points records:
  - The check-in entrance and check-in routing family will continue to be retained.
  - The record of basic points used for sign-in will continue to be retained.
  - The points mall has been disabled, but points records are not targeted for deletion yet.
- member:
  - User membership page and background membership configuration.
  - User level and membership card backend page.
- Basic backend capabilities:
  - Background login and home page frame.
  - User list/details, product list/edit, order list/details, finance/commission, education, system basic settings.

## List hidden

In MVP mode, the following capabilities are hidden from menus, front-end routing, DIY components, or page entries:

- Coupon:
  - Mini program/H5 coupon entrance and DIY coupon component.
  - Backend coupon routing and coupon tab in product/user details.
  - Product listings still return `coupons: []`.
- Marketing activities:
  - Bargaining, group buying, flash sales, pre-sales, and draws.
  - Routing in the background marketing routing except for retained check-ins, points records and member configuration.
  - The backend product activity detection interface `product/product/check_activity` has been included in routing interception.
- customer service:
  - Mini program/H5 customer service floating entrance and DIY components.
  - Backend customer service menu rules.
  - The backend public interface `get_workerman_url` has been included in route interception.
  - Kefu API entry is protected.
- Live broadcast and short video:
  - Mini program live broadcast/video DIY components and live broadcast list direct connection request protection.
  - Backstage live broadcast routing.
- CMS/News:
  - Backend CMS/article/news portal.
  - Mobile article routing.
  - PC `get_news_*` route has been blocked by the router.
- DIY/page decoration:
  - Backend DIY/theme/page decoration routing.
  - The public DIY data interface has been blocked, except for the DIY data used for sign-in retention.
- Offline and store pickup:
  - Offline payment.
  - Store list, store employees, self-pickup, and write-off orders.
- Optional user features:
  - Balance center, favorites list, browsing/access records, sharing, system messages, logout, gifts/receiving gifts, payment on behalf of friends, and user financial export.
  - The front-end routing for backend user logout has been hidden.
  - The backend newbie gift backend route has been blocked; the marketing frontend whitelist excludes `marketing_gift`.
- Advanced Distribution:
  - Advanced distribution routing and backend entrance for divisions/agents/employees.
- System extensions:
  - Ticket printer/ticket routing.
  - External application/open API account and interface configuration.
  - Complex logistics configuration, such as freight rates, city data, and delivery template settings.
- bill:
  - Mobile invoice routing.
  - Backend invoice and electronic invoice configuration routing.
- Product extension:
  - Backend product collection, product migration, virtual card key import, video upload key, and freight template interfaces have been blocked in MVP mode.
  - The product collection and product migration entrances have been hidden on the backend product list page.
  - In the MVP mode of the backend product editing page, the freight template will no longer be automatically requested, the video upload entrance will no longer be displayed, and the video upload key or card secret import interface will no longer be called.
  - The product collection pop-up window and product migration import components have been removed from the static dependencies of the product list/product editing main page, and the files are temporarily left in the deletion mapping.
  - The product collection pop-up window, product migration import component, and the front-end API wrapper that only serves them have completed the first batch of front-end physical deletions.
  - The first batch of backend physical deletions have been completed for the background routing, controller actions, and dedicated service methods of item collection and item migration.

## Soft route interception list

Backend soft interception is concentrated in `config/mvp.php` and routing interception middleware.

Background routing interception:

- Marketing module disabled:
  - Coupons, bargaining, group buying, flash sales, pre-sales, points mall, recharge, and draws.
- Backend application/customer service:
  - `app/`, WeChat application background routing, feedback, speaking skills, customer service, and automatic reply.
- CMS/DIY：
  - `cms/`、`diy/`、`diy_pro/`、`theme/`、`theme_module/`。
- bill:
  - Order invoice, invoice issuance/download/configuration path.
- Offline/store:
  - Offline checkout, offline QR code scanning, QR code scanning list, stores, store employees, and write-off orders.
- Optional users:
  - User financial export, user logout list/operation, newcomer gift.
- Logistics/System:
  - Shipping costs, city settings, delivery templates, receipt printer tickets, external interface/account settings.
- Advanced Distribution:
  - `agent/division`。
- Product extension:
  - `product/product/get_template`、`product/product/get_temp_keys`、`product/product/import_card`
  - `product/product_export`、`product/product_import`
  - `product/crawl`、`product/copy_config`、`product/copy`

API and PC route interception:

- Coupon:
  - `coupon/`、`coupons`、`new_coupon`、`get_today_coupon`、`order/product_coupon`、`theme/coupon`。
- Marketing activities:
  - `bargain/`、`combination/`、`seckill/`、`advance/`、`lottery`、`user/activity`。
- Points mall and recharge:
  - `store_integral/`、`recharge/`。
- live streaming:
  - `wechat/live`。
- CMS：
  - `article/`、`theme/article`、`get_news_`。
- customer service:
  - `user/service/`、`get_customer_type`、`get_workerman_url`。
- bill:
  - `invoice`、`order/invoice`、`order/make_up_invoice`、`order/down_invoice`。
- Offline/store:
  - `order/offline/`、`store_list`。
- Complex logistics:
  - `order/order_verific`。
- Optional users:
  - `collect/`、`get_collect_list`、`get_balance_record`、`user/visit`、`user/set_visit`、`user/share`、`user/message_system`、`user_cancel`、`order/friend_detail`、`order/receive_gift`、`order/gift_detail`、`user/balance`。
- Advanced Distribution:
  - Force interception of `agent/` and `v2/agent/`, and interception of `division/order`.
- Page DIY:
  - `diy/color_change`、`diy/get_diy`、`diy/get_version`、`diy/get_store_status`。

Kefu API interception:

- When customer service is disabled, login, key, code scanning, configuration, WeChat, upload, user, order, product, customer service, and visitor paths are all blocked.

## Do not delete yet

Even if the following capabilities are hidden or intercepted, their source code and data are still retained:

- Active module disabled:
  - Coupons, bargaining, group buying, flash sales, pre-sales, lottery, live broadcast, CMS, DIY/theme, points mall, recharge.
- Customer service and kefu code:
  - Backend customer service page/controller.
  - `app/kefuapi`。
- Optional user modules:
  - Balance, collection, browsing history, sharing, messages, logout, gift/friend payment path, newbie gift.
- Store/offline module:
  - Offline payment, store pickup, store staff, and verification of orders.
- Invoice module:
  - User invoice, order invoice, electronic invoice.
- Logistics expansion:
  - Freight template, city data settings, delivery template settings, receipt printer.
- Product extension:
  - Back-end product collection/copying, product migration, import and export have completed the first batch of physical deletions.
  - Virtual card secret import, video upload key, and freight template interfaces are still persisted and protected by MVP routing interception.
  - The front-end product collection pop-up window, product migration import component and dedicated API wrapper have completed the first batch of physical deletions.
- Advanced Distribution:
  - Business unit/agent/employee advanced distribution and basic second-level distribution will continue to be retained.
- Build/run the product:
  - `template/uni-app/dist`
  - `crmeb/public/statics/mp_view`
  - Run log/cache
  - `public/install.lock` for local use only
- Database tables and migrations:
  - No table should be physically dropped until the validation threshold is passed and the mapping is ready to be dropped.

## Physical deletion threshold

Before any physical deletion, the following checks are performed and the output is logged to a new date document.

Backend syntax and caching:

```powershell
docker exec -w /var/www/crmeb crmeb php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb php -l app/api/route/v1.php
docker exec -w /var/www/crmeb crmeb php -l app/api/route/v2.php
docker exec -w /var/www/crmeb crmeb php -l app/api/route/pc.php
docker exec -w /var/www/crmeb crmeb php think clear
```

Mini program build must be performed:

```powershell
cd C:\Users\pc\Documents\ssp\Educational-Mini-Program-dev3\src\CRMEB\CRMEB-master\template\uni-app
npm run build:mp-weixin
```

Mini program construction is the mandatory threshold before physical deletion. If dependencies are missing, install them first and record the exact installation commands and all warnings. Expected output directory:

```text
src/CRMEB/CRMEB-master/template/uni-app/dist/build/mp-weixin
```

It is recommended to perform a background build:

```powershell
cd C:\Users\pc\Documents\ssp\Educational-Mini-Program-dev3\src\CRMEB\CRMEB-master\template\admin
npm run build
```

Backend smoke test:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/api/product/detail/1
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/api/pc/get_products
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/api/pc/get_news_list
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/user/user
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/user/cancel_list
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product/get_template
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product_import
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/crawl
```

Minimum expected results:

- `GET /api/product/detail/1`
  - `status=200`
  - `msg=success`
  - `coupons=[]`
- `GET /api/pc/get_products`
  - `status=200`
  - Cannot be `MVP module disabled`
- `GET /api/pc/get_news_list`
  - `status=400`
  - `msg=MVP module disabled`
- `GET /adminapi/user/user`
  - Authentication protection response, such as login expiration
  - Cannot be `MVP module disabled`
- `GET /adminapi/user/cancel_list`
  - `status=400`
  - `msg=MVP module disabled`
- `GET /adminapi/product/product`
  - Can return authentication responses such as login expiration
  - Cannot be `MVP module disabled`
- `GET /adminapi/product/product/get_template`
  - Should be intercepted in MVP mode.
- `POST /adminapi/product/product_import`
  - Should be intercepted in MVP mode.
- `POST /adminapi/product/crawl`
  - Should be intercepted in MVP mode.

Manual inspection of the small program after executing `npm run build:mp-weixin`:

- Import `dist/build/mp-weixin` into WeChat developer tools.
- Confirm that the login page can be opened.
- Confirm that the MVP homepage/product entrance can be opened.
- Confirm that the product details can be opened and the coupon UI is not displayed.
- Confirm cart/order confirmation is still available.
- Confirm that the WeChat payment entrance is still accessible during the normal order process.
- Confirm that the evaluation entrance can be opened and can be submitted after logging in.
- Confirm check-in and member paths are still visible where expected.
- Confirm that the following hidden entrances are not visible:
  - Coupon
  - customer service
  - Live broadcast/video
  - Articles/CMS/News
  - Points Mall
  - top up
  - bill
  - Store pickup/offline payment
  - Balance/Collection/Browse/Gift/Friend Payment/Cancel.
  - Backend product collection/product migration/video upload/card secret import/freight template expansion entrance

## delete rule

After the verification threshold is passed, physical deletion must still be promoted in small batches:

- Only delete one module family at a time.
- Each module family must retain retroactive deletion mappings:
  - Front-end pages/components
  - Backend routing/page/API wrapper
  - API/backend route definition
  - controller/service/dao/model
  - Menu record
  - Database tables and migration/installation SQL
- The shared helper must be deleted after at least two rounds of searches to confirm that no path references are retained.
- Do not delete anything that the following capabilities depend on:
  - Product details
  - Order/Payment/Callback/List/Details
  - WeChat login/payment
  - Basic Distribution/Commission
  - Evaluation
  - Sign in
  - Member functions.

## Audit source documents

This article summarizes the following soft slimming round records:

- `docs/2026-06-17-mvp-slimming-candidates.md`
- `docs/2026-06-17-mvp-slimming-phase1.md`
- `docs/2026-06-18-mvp-slimming-optional-user-route-audit.md`
- `docs/2026-06-18-mvp-slimming-optional-user-frontend-audit.md`
- `docs/2026-06-18-mvp-slimming-checkout-optional-frontend-audit.md`
- `docs/2026-06-18-mvp-slimming-mobile-admin-route-audit.md`
- `docs/2026-06-18-mvp-slimming-mobile-diy-route-audit.md`
- `docs/2026-06-18-mvp-slimming-offline-store-route-audit.md`
- `docs/2026-06-18-mvp-slimming-admin-offline-store-route-audit.md`
- `docs/2026-06-18-mvp-slimming-advanced-distribution-route-audit.md`
- `docs/2026-06-18-mvp-slimming-admin-dashboard-advanced-distribution-audit.md`
- `docs/2026-06-18-mvp-slimming-logistics-route-audit.md`
- `docs/2026-06-18-mvp-slimming-system-route-audit.md`
- `docs/2026-06-18-mvp-slimming-invoice-route-audit.md`
- `docs/2026-06-18-mvp-slimming-customer-service-route-audit.md`
- `docs/2026-06-18-mvp-slimming-kefuapi-route-audit.md`
- `docs/2026-06-18-mvp-slimming-frontend-live-video-audit.md`
- `docs/2026-06-18-mvp-slimming-product-detail-coupons-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-export-route-audit.md`
- `docs/2026-06-19-mvp-slimming-pc-optional-user-route-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-user-optional-route-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-user-frontend-route-audit.md`
- `docs/2026-06-19-mvp-slimming-pc-cms-route-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-public-customer-service-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-product-activity-api-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-product-extra-api-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-product-extra-frontend-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-product-extra-deletion-map.md`
- `docs/2026-06-19-mvp-slimming-admin-product-extra-frontend-delete.md`
- `docs/2026-06-19-mvp-slimming-admin-product-extra-backend-delete.md`
