# 2026-06-19 MVP slimming pre-delete handoff

## Purpose

This handoff records the current MVP slimming boundary before any physical deletion. The current state is still a soft-slimming state: features are retained in source but hidden, guarded, or route-blocked when MVP mode is enabled.

Do not delete files, database tables, route definitions, controllers, services, models, or frontend pages until the verification gate in this document is completed.

## Current MVP baseline

MVP mode is enabled through:

- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
- `src/CRMEB/CRMEB-master/template/uni-app/config/mvp.js`
- `src/CRMEB/CRMEB-master/template/admin/src/config/mvp.js`

Primary retained product scope:

- Login and user identity.
- Product list and product detail.
- Cart, order creation, order list/detail, order payment, and order callbacks.
- WeChat pay and pay notify callback.
- Basic second-level distribution, spread relationship, commission display, and commission records.
- Training-camp product path.
- Assessment records.
- Sign-in.
- Member/user level and member-card related features.
- Core admin user, product, order, finance/commission, education, and member views.

## Retained list

These must stay working through physical deletion:

- Mini-program login:
  - WeChat login pages and auth endpoints.
  - CRMEB auth token flow.
- Products:
  - `GET /api/products`
  - `GET /api/product/detail/:id`
  - PC product list such as `GET /api/pc/get_products`
  - Product detail must continue to return `coupons: []` in MVP mode, not fail.
- Orders and payment:
  - Order create, pay, detail, list, and take flows.
  - `pay/notify` callback.
  - WeChat pay configuration and callback handling.
- Distribution and commission:
  - Basic spread routes and commission routes.
  - Admin finance commission list.
  - Do not remove basic `spread`, `brokerage`, or retained commission data paths.
- Assessment:
  - `POST /api/education/assessment_records`
  - Admin education assessment-record list/detail.
- Sign-in and points records:
  - Sign-in entry and sign-in route family remain retained.
  - Basic point/integral records used by sign-in remain retained.
  - Points mall is disabled, but point records are not a deletion target yet.
- Members:
  - User/member pages and admin member configuration.
  - User level and member-card admin pages.
- Admin basics:
  - Admin login and dashboard shell.
  - User list/detail, product list/edit, order list/detail, finance/commission, education, system basics.

## Hidden list

These are hidden from menus, frontend routes, DIY components, or page entry points in MVP mode:

- Coupons:
  - Mini-program/H5 coupon entry points and DIY coupon components.
  - Admin coupon routes and coupon tabs in product/user detail.
  - Product detail still returns `coupons: []`.
- Marketing activities:
  - Bargain, combination, seckill, presell, lottery.
  - Admin marketing routes outside the retained sign-in, point-record, and member-config routes.
  - 后台商品活动检测接口 `product/product/check_activity` 已纳入路由拦截。
- Customer service:
  - Mini-program/H5 customer-service floating entries and DIY components.
  - Admin customer-service menu patterns.
  - 后台公共接口 `get_workerman_url` 已纳入路由拦截。
  - Kefu API surface is guarded.
- Live and short video:
  - Mini-program live/video DIY components and direct live-list request guards.
  - Admin live routes.
- CMS/news:
  - Admin CMS/article/news entries.
  - Mobile article routes.
  - PC `get_news_*` routes are now route-blocked.
- DIY/page decoration:
  - Admin DIY/theme/page decoration routes.
  - Public DIY data endpoints are blocked except retained sign-in DIY data.
- Offline and store pickup:
  - Offline payment.
  - Store list, store staff, pickup, verification orders.
- Optional user features:
  - Balance center, collection list, browse/visit records, share, system messages, cancellation, gift/receive-gift, friend pay, user finance export.
  - Admin user cancellation frontend route is hidden.
  - Admin new-user gift backend routes are blocked; marketing frontend whitelist excludes `marketing_gift`.
- Advanced distribution:
  - Division/agent/staff advanced distribution routes and admin entries.
- System extras:
  - Receipt printer/ticket routes.
  - External app/open API account and interface configuration.
  - Complex logistics configuration such as freight, city-data, shipping-template settings.
- Product extras:
  - 后台商品采集、商品迁移、虚拟卡密导入、视频上传密钥、运费模板接口已在 MVP 模式下隐藏或拦截。
- Invoice:
  - Mobile invoice routes.
  - Admin invoice and electronic-invoice configuration routes.

## Soft route-block list

Backend soft blocking is centralized in `config/mvp.php` and the route block middlewares.

Admin route blocks:

- Marketing disabled modules:
  - Coupon, bargain, combination, seckill, presell, points mall, recharge, lottery.
- Admin app/customer-service:
  - `app/`, WeChat app-admin routes, feedback, speechcraft, kefu, auto-reply.
- CMS/Diy:
  - `cms/`, `diy/`, `diy_pro/`, `theme/`, `theme_module/`.
- Invoice:
  - Order invoice, invoice issue/download/config paths.
- Offline/store:
  - Offline cashier, offline scan, scan list, store, store staff, verify order.
- Optional user:
  - User finance export, user cancellation list/actions, new-user gift.
- Logistics/system:
  - Freight, city settings, shipping templates, receipt printer tickets, external interface/account settings.
- Advanced distribution:
  - `agent/division`.
- Product extras:
  - `product/product/get_template`, `product/product/get_temp_keys`, `product/product/import_card`.
  - `product/product_export`, `product/product_import`.
  - `product/crawl`, `product/copy_config`, `product/copy`.

API and PC route blocks:

- Coupons:
  - `coupon/`, `coupons`, `new_coupon`, `get_today_coupon`, `order/product_coupon`, `theme/coupon`.
- Marketing activities:
  - `bargain/`, `combination/`, `seckill/`, `advance/`, `lottery`, `user/activity`.
- Points mall and recharge:
  - `store_integral/`, `recharge/`.
- Live:
  - `wechat/live`.
- CMS:
  - `article/`, `theme/article`, `get_news_`.
- Customer service:
  - `user/service/`, `get_customer_type`, `get_workerman_url`.
- Invoice:
  - `invoice`, `order/invoice`, `order/make_up_invoice`, `order/down_invoice`.
- Offline/store:
  - `order/offline/`, `store_list`.
- Complex logistics:
  - `order/order_verific`.
- Optional user:
  - `collect/`, `get_collect_list`, `get_balance_record`, `user/visit`, `user/set_visit`, `user/share`, `user/message_system`, `user_cancel`, `order/friend_detail`, `order/receive_gift`, `order/gift_detail`, `user/balance`.
- Advanced distribution:
  - Force-blocked `agent/` and `v2/agent/`, plus `division/order`.
- Page DIY:
  - `diy/color_change`, `diy/get_diy`, `diy/get_version`, `diy/get_store_status`.

Kefu API blocks:

- Login, key, scan, config, wechat, upload, user, order, product, service, tourist paths are blocked while customer service is disabled.

## Temporarily not deleted

The following remain in source and data for now, even if hidden or blocked:

- Disabled activity modules:
  - Coupon, bargain, combination, seckill, presell, lottery, live, CMS, DIY/theme, points mall, recharge.
- Customer-service and kefu code:
  - Admin customer-service pages/controllers.
  - `app/kefuapi`.
- Optional user modules:
  - Balance, collections, browse records, share, messages, cancellation, gift/friend-pay paths, new-user gift.
- Store/offline modules:
  - Offline payment, store pickup, store staff, verification orders.
- Invoice modules:
  - User invoice, order invoice, electronic invoice.
- Logistics extras:
  - Freight templates, city data settings, shipping template settings, receipt printer.
- Advanced distribution:
  - Division/agent/staff advanced distribution, while basic second-level distribution stays retained.
- Build/runtime artifacts:
  - `template/uni-app/dist`
  - `crmeb/public/statics/mp_view`
  - runtime logs/cache
  - local-only `public/install.lock`
- Database tables and migrations:
  - No table should be physically dropped until the verification gate passes and a deletion map is prepared.

## Physical deletion gate

Before any physical deletion, run all checks below and record the output in a new dated doc.

Backend syntax and cache:

```powershell
docker exec -w /var/www/crmeb crmeb php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb php -l app/api/route/v1.php
docker exec -w /var/www/crmeb crmeb php -l app/api/route/v2.php
docker exec -w /var/www/crmeb crmeb php -l app/api/route/pc.php
docker exec -w /var/www/crmeb crmeb php think clear
```

Required mini-program build:

```powershell
cd C:\Users\pc\Documents\ssp\Educational-Mini-Program-dev3\src\CRMEB\CRMEB-master\template\uni-app
npm run build:mp-weixin
```

This mini-program build is mandatory before physical deletion. If dependencies are missing, install them first and document the exact install command and any warnings. The expected output directory is:

```text
src/CRMEB/CRMEB-master/template/uni-app/dist/build/mp-weixin
```

Recommended admin build:

```powershell
cd C:\Users\pc\Documents\ssp\Educational-Mini-Program-dev3\src\CRMEB\CRMEB-master\template\admin
npm run build
```

Backend smoke tests:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/api/product/detail/1
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/api/pc/get_products
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/api/pc/get_news_list
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/user/user
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/user/cancel_list
```

Minimum expected results:

- `GET /api/product/detail/1`
  - `status=200`
  - `msg=success`
  - `coupons=[]`
- `GET /api/pc/get_products`
  - `status=200`
  - not `MVP module disabled`
- `GET /api/pc/get_news_list`
  - `status=400`
  - `msg=MVP module disabled`
- `GET /adminapi/user/user`
  - auth-protected response such as login expired
  - not `MVP module disabled`
- `GET /adminapi/user/cancel_list`
  - `status=400`
  - `msg=MVP module disabled`

Manual mini-program checks after `npm run build:mp-weixin`:

- Import `dist/build/mp-weixin` into WeChat Developer Tools.
- Confirm login page opens.
- Confirm MVP home/product entry opens.
- Confirm product detail opens and no coupon UI is visible.
- Confirm cart/order confirmation still works.
- Confirm WeChat pay entry is still reachable in the normal order flow.
- Confirm assessment entry opens and can submit after login.
- Confirm sign-in and member paths are still visible where expected.
- Confirm hidden entries are absent:
  - coupon
  - customer service
  - live/video
  - article/CMS/news
  - points mall
  - recharge
  - invoice
  - store pickup/offline payment
  - balance/collection/browse/gift/friend-pay/cancellation.

## Deletion rules

After the gate passes, deletion must still be done in small PR-sized rounds:

- Delete one module family at a time.
- Keep a reversible deletion map for each family:
  - frontend pages/components
  - admin routes/pages/API wrappers
  - API/admin route definitions
  - controllers/services/DAO/models
  - menu records
  - database tables and migration/install SQL
- Do not delete shared helpers until at least two search passes confirm no retained path imports them.
- Do not delete anything used by:
  - product detail
  - order create/pay/callback/list/detail
  - WeChat login/pay
  - basic distribution/commission
  - assessment
  - sign-in
  - member features.

## Audit source docs

This handoff summarizes the soft-slimming rounds recorded in:

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
