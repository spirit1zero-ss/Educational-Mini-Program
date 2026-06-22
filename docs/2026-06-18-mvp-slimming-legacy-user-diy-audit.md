# CRMEB MVP slimming down: DIY component entrance and closing audit for old version users

Date: 2026-06-18

## Target

Continue to implement MVP soft slimming, only hide the entrance, do not delete the code, do not change the back-end interface, and do not destroy the main order and payment process.

This stage completes the optional user entry in the old version of DIY user information component.

## background

Previously closed:

- User center menu
- New version `homeUserInfor` DIY user component
- Optional capabilities on order confirmation page

Scanning found that older components may still be rendered by `pageDesign`:

- `src/CRMEB/CRMEB-master/template/uni-app/subpackage/diyComponents/userInfor.vue`

The component still displays and jumps:

- Coupon
- Points entrance
- Balance
- Collect items
- Browsing history

These entrances are already MVP-disabled or non-core optional capabilities.

## This adjustment

Location:

- `src/CRMEB/CRMEB-master/template/uni-app/subpackage/diyComponents/userInfor.vue`

deal with:

- Introduce unified `isMvpHiddenLink` rules.
- Extract `getMenuUrl(type)` to map the menu type to the actual page URL.
- Added `isMvpMenuVisible(type)`, the template determines whether to display based on the unified MVP hiding rules.
- `handleMenu(type)` adds covert protection, the hidden link will not jump even if it is called directly.

## retain ability

This time it does not affect:

- User avatar, nickname, mobile phone number display
- Member level and membership growth display
- Login portal
- Sign-in and membership capabilities
- Distribution commission entrance
- Products, orders, WeChat payment links

## local verification path

Front-end build:

```bash
cd src/CRMEB/CRMEB-master/template/uni-app
npm run build:mp-weixin
```

Page verification:

- WeChat developer tool import `src/CRMEB/CRMEB-master/template/uni-app/dist/build/mp-weixin`
- Open the personal center or backend DIY user center page
- Confirm that the old version of the user information component will no longer display non-MVP entries such as balance, coupons, collections, browsing history, etc.
- Confirm that member information can still be displayed

## Risk point

- Backend DIY configuration may switch between old and new user information components, so both old and new components need to retain the same set of MVP filtering rules.
- The underlying ability of points still needs to be reserved for the sign-in link. Currently, only the user-side points entrance is hidden, and the points account or turnover is not deleted.
- Before actually deleting the old version of DIY components, you need to confirm that all `pageDesign` configurations no longer reference `userInfor`.

