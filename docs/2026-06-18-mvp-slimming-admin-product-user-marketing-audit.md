# CRMEB MVP slimming down: background product and user marketing entrance and closing audit

Date: 2026-06-18

## Target

Continue to implement MVP soft slimming, only hide non-MVP marketing entrances and add front-end cover. No code will be deleted, no interface will be changed, and no impact on products, orders, payments, secondary distribution, commissions, sign-ins, and member core capabilities.

This stage focuses on the P1 marketing entrance that is still visible in the background:

- Coupon products in the product list filter.
- Purchases in the product list batch operation will receive coupons.
- Bargaining, group buying, and flash sale jumps in the activity tab of the product list.
- Send coupons in the user list.

## This adjustment

### Backend MVP configuration

Location:

- `src/CRMEB/CRMEB-master/template/admin/src/config/mvp.js`

deal with:

- Added `isMvpCouponEnabled()`.
- Added `isMvpMarketingActivityEnabled(type)`.
- Disabled in MVP mode:
  - `coupon`
  - `bargain`
  - `combination`
  - `seckill`

### Product list

Location:

- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productList/index.vue`

deal with:

- Hide coupon products in product type filtering in MVP mode.
- In MVP mode, purchase coupons in batch operations are hidden.
- In MVP mode, bargaining, group buying, and flash sale event labels are hidden.
- `batchSelect(4)`, `activityDetail()`, `addCoupon()` Add MVP front-end back-end prompts to prevent internal calls outside the hidden entrance from continuing into the disabled gameplay.

### User list

Location:

- `src/CRMEB/CRMEB-master/template/admin/src/pages/user/list/index.vue`

deal with:

- Hide the send coupon button in MVP mode.
- In MVP mode, the coupon sending pop-up window component is not mounted.
- `onSend()` Add MVP front-end tips.

## retain ability

This time it does not affect:

- View the backend product list.
- Product addition, editing, loading and unloading, and general label settings.
- View the background user list.
- View user details.
- View member status and member configuration.
- Secondary Distribution and Commission View.
- WeChat payment, payment callback, order status machine.
- Sign-in function.

## local verification path

Background build:

```bash
cd src/CRMEB/CRMEB-master/template/admin
npm run build
```

Docker backend core sampling test:

```bash
docker exec -w /var/www/crmeb crmeb-local php think clear
curl.exe -i --max-time 20 http://127.0.0.1:8080/api/product/detail/1
curl.exe -i --max-time 20 http://127.0.0.1:8080/adminapi/marketing/coupon/released
curl.exe -i --max-time 20 http://127.0.0.1:8080/adminapi/marketing/bargain/list
```

Browser background path:

- `http://127.0.0.1:8080/admin`
- After logging in, enter the product list, confirm the coupon products, purchase coupons, bargain, group buy, and flash sale entrances are not displayed.
- After logging in, enter the user list and confirm that the send coupon button is not displayed.
- Confirm that the product list and user list can still be opened and queried normally.

## Risk point

- The product list interface may still return the activity tag field. At this stage, only the backend and front end are closed, and the product interface response is not changed.
- The backend interfaces for coupons, bargaining, group buying, and flash sales have been intercepted by MVP configuration; associated components, export interfaces, permission menus, and database tables still need to be checked before subsequent physical deletion.
- Points-related abilities need to be reserved for sign-in links. There is no hidden purchase to give points this time.
