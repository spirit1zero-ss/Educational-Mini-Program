# CRMEB MVP Slimming: Backend Decoration Coupon Configuration Entrance Closure Audit

## Goal of this round

Continue to implement MVP soft slimming, only hiding the coupon configuration entrance and preview retrieval in the background DIY/decoration, without deleting codes, not changing decoration routes, and not affecting products, orders, payments, secondary distribution, commissions, check-ins, and core member capabilities.

## Changes in this round

### Backend custom component configuration

document:

- `src/CRMEB/CRMEB-master/template/admin/src/components/mobileConfig/c_custom_component.vue`

change:

- Introduced `isMvpCouponEnabled()`.
- Filter the `coupon` option in custom component `selectType` in MVP mode.
- If historical decoration data has been saved as `coupon`, the configuration panel will be downgraded to `user`.
- `coupon` Configure the branch to add MVP judgment to avoid continuing to display coupon data sources, coupon selectors, and coupon filter conditions.

### Backend custom component preview

document:

- `src/CRMEB/CRMEB-master/template/admin/src/components/mobilePage/home_custom_component.vue`

change:

- Introduced `isMvpCouponEnabled()`.
- Historical `coupon` custom component is downgraded to `user` preview in MVP mode.
- `fetchCouponList()` adds a cover, no longer requests the coupon list interface in MVP mode.

### Backstage decoration component panel

document:

- `src/CRMEB/CRMEB-master/template/admin/src/pages/setting/devise/diyIndex.vue`

change:

- Introduced `isMvpCouponEnabled()`.
- The left component panel in MVP mode filters independent `home_coupon` / `coupon` components.
- When the historical custom component corner mark encounters `coupon`, it returns empty text to avoid continuing to highlight the coupon type.

## unchanged range

- Component files such as `home_coupon.vue` and `c_home_coupon.vue` are not deleted.
- The backend DIY routing and saving interfaces have not been modified.
- Unmodified orders, payments, payment callbacks, distribution, commissions, check-ins, and memberships.
- The database tables and historical decoration data have not been modified.

## local verification

```powershell
git diff --check
cd src/CRMEB/CRMEB-master/template/admin
npm run build
docker exec -w /var/www/crmeb crmeb-local php think clear
curl.exe -i --max-time 20 http://127.0.0.1:8080/api/product/detail/1
curl.exe -i --max-time 20 http://127.0.0.1:8080/adminapi/marketing/coupon/released
```

Backend manual verification:

- Log in to the backend to enter the decoration/DIY page.
- Confirm that the standalone coupon component is no longer displayed in the marketing component on the left.
- Add a custom component and confirm that the coupon is no longer displayed in the selection message.
- If the historical coupon custom component is loaded, confirm that it will not continue to request the coupon list interface.

## Risk point

- This round is soft-hidden on the front end, and the coupon component configuration may still be retained in the historical decoration data.
- The background DIY routing has been disabled according to the MVP configuration; if you subsequently reopen the DIY page, you need to confirm both the page-level entry and the component-level entry.
- Coupon copy related to membership benefits may still be displayed in the membership component. The membership function is a reserved item of MVP, and the internal display of members is not processed in this round to avoid accidentally damaging the member center.
- Before actually physically deleting the coupon decoration component, you need to check the `mobilePage/index.js` automatic registration, `mobileConfig/index.js` automatic registration, theme save data, history page JSON and database decoration table.
