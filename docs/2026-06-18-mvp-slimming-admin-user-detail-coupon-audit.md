# CRMEB MVP Slimming: backend user details coupon entrance closing audit

Date: 2026-06-18

## Target

Continue to implement MVP soft slimming, only hide the coupon viewing entrance in the backend user details and add a front-end cover. No code will be deleted, no user details interface will be changed, and it will not affect users, orders, products, payments, secondary distribution, commissions, check-ins and core member capabilities.

This stage focuses on the remaining entries in the background user details drawer:

- Hold coupons in the user details tab.
- Coupon details query triggered when switching from internal state to `coupon`.

## This adjustment

Location:

- `src/CRMEB/CRMEB-master/template/admin/src/pages/user/list/handle/userDetails.vue`

deal with:

- Introduced `isMvpCouponEnabled()`.
- Added `mvpList` calculated attribute, filtering `coupon` tab in MVP mode.
- `changeTab()` Adds coupon interception.
- `changeType()` adds `coupon` type covert interception to avoid triggering the coupon details interface from internal status or paging.

## retain ability

This time it does not affect:

- View background user details.
- Backend user editing.
- Consumption records.
- Points details.
- Sign in record.
- Friendship.
- View member status.
- Secondary distribution and commission core links.

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
```

Browser background path:

- `http://127.0.0.1:8080/admin`
- After logging in, enter the user list.
- Open any user details and confirm that the Coupon Holding tab is not displayed.
- Confirm that user information, consumption records, points details, check-in records, and friend relationships can still be viewed.

## Risk point

- At this stage, only the back-end front-end entrance is hidden; if the back-end user details interface still supports coupon details, no physical deletion is currently performed.
- The balance change tab is still retained in the user details and is a cautious candidate for P2; whether to hide it in the future needs to be confirmed separately to avoid accidental damage to funds/after-sales related viewing.
- Before physically deleting the coupon capability, you need to check the user details interface, coupon issuance component, marketing routing, permission menu and historical coupon data.
