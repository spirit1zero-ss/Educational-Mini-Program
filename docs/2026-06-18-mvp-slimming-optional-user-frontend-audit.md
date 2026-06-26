# CRMEB MVP slimming down: user-side optional entrance and front-end closing audit

Date: 2026-06-18

## Target

On the premise of not deleting code, not rewriting payment, and not destroying the order state machine, make the H5/mini program user-side entrance consistent with the back-end MVP routing interception.

This time I only do soft slimming:

- Hide entry for non-MVP users
- Prevent access to footprint reporting under MVP
- Only the WeChat payment entrance is reserved under MVP
- Prevent non-MVP payment paths such as gift orders, agency payments, balances, and offline payments from continuing to be initiated from the front end

## This adjustment

### MVP link hiding rules

Location:

- `src/CRMEB/CRMEB-master/template/uni-app/config/mvp.js`

Add hidden keywords:

- `user_goods_collection`
- `user_invoice`
- `user_money`
- `visit_list`
- `message_center`
- `message_system`
- `payment_on_behalf`
- `receive_gift`
- `receive_gifts_status`
- `user_cancellation`

Reserved entrance:

- User Center
- commodity
- Order
- WeChat Pay
- Sign in
- member
- Distribution commission

### User center access footprints

Location:

- `src/CRMEB/CRMEB-master/template/uni-app/pages/user/index.vue`

deal with:

- `setVisit` is no longer called in MVP mode
- Prevent the frontend from continuing to request `user/set_visit` that has been intercepted by the backend MVP

### User Information DIY Components

Location:

- `src/CRMEB/CRMEB-master/template/uni-app/subpackage/diyComponents/homeUserInfor.vue`

deal with:

- Balance, coupons, points mall entrance, favorite products, and browsing history are filtered according to unified `isMvpHiddenLink` rules
- Retain promotion commissions, promoters, and promotion order entrances

illustrate:

- Sign-in may rely on the underlying points ability, so this time we only hide the points mall/points entrance, and do not delete the points account and points transfer capabilities.

### Cashier payment method

Location:

- `src/CRMEB/CRMEB-master/template/uni-app/pages/goods/cashier/index.vue`

deal with:

- Only WeChat payment is retained in MVP mode
- Hide Alipay, balance, offline payment, payment by friends
- When the user triggers non-WeChat payment through the old state, the front end directly prompts and terminates it.

### Order confirmation payment method and gift order

Location:

- `src/CRMEB/CRMEB-master/template/uni-app/pages/goods/order_confirm/index.vue`

deal with:

- Only WeChat payment is retained in MVP mode
- Gift order parameters will no longer be submitted when creating an order, order price calculation, and order confirmation.
- The gift order collection portal is directly terminated in MVP mode.

## local verification path

Suggested verification:

```bash
cd src/CRMEB/CRMEB-master/template/uni-app
npm run build:mp-weixin
```

Docker backend sampling test:

```bash
docker ps
docker exec -w /var/www/crmeb crmeb-local php think clear
```

Browser/H5:

- `http://127.0.0.1:8080`

WeChat developer tools:

- import `src/CRMEB/CRMEB-master/template/uni-app/dist/build/mp-weixin`
- Open the user center and confirm that the balance, collection, browsing history, payment, and gift order entrances are not visible.
- Open the order confirmation page and confirm that only WeChat payment is displayed.
- Initiate an order for ordinary training camp products and confirm that the order creation process will not be affected.

## Risk point

- Some menus come from the background DIY configuration, this time relying on unified link keyword filtering; if a non-standard URL is added in the background, keywords will need to be added later.
- The underlying capabilities of points cannot be deleted directly, because check-in may depend on points account, points flow or points display.
- Membership, sign-in, secondary distribution, and commission entrances must be retained and cannot be deleted along with the user-side optional functions.
- This time it is just the front-end soft hiding, and the actual physical deletion still requires subsequent dependency troubleshooting and regression verification.

