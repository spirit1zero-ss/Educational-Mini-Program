# 2026-06-22 MVP deep physical delete

## Dev4 branch note

This is the post-slimming source package prepared for the `dev4` branch.
It intentionally keeps only the MVP-required source code and removes dependency install outputs, generated admin/H5 assets, disabled mini-program routes, disabled DIY components, and related static assets.

Fresh checkouts of `dev4` are expected to reinstall dependencies before build or runtime use.

## Result

Project size after this round:

- Before deeper deletion: about 294.44 MB after the first cleanup measurement.
- After deeper deletion: about 56.88 MB.
- Current count: 2935 files, 819 directories.

## Removed dependency/build artifacts

These were removed because they are install/build outputs, not retained source code:

- `node_modules`
- `src/CRMEB/CRMEB-master/crmeb/vendor`
- `src/CRMEB/CRMEB-master/crmeb/public/admin`
- `src/CRMEB/CRMEB-master/crmeb/public/h5`
- `src/CRMEB/CRMEB-master/crmeb/public/static`
- `src/CRMEB/CRMEB-master/crmeb/public/pages`
- `src/CRMEB/CRMEB-master/crmeb/public/assets`

The source manifests remain:

- `package.json`
- `package-lock.json`
- `src/CRMEB/CRMEB-master/crmeb/composer.json`
- `src/CRMEB/CRMEB-master/crmeb/composer.lock`

Running the project from a fresh checkout now requires reinstalling dependencies.

## Removed mini-program disabled feature pages

`template/uni-app/pages.json` was rewritten as valid JSON and the following disabled MVP routes were removed:

- Points mall package: `pages/points_mall`
- News/CMS/customer-service pages under `pages/extension`
- Bargain, combination, seckill, presell, poster activity pages under `pages/activity`
- Lottery pages under `pages/goods`
- Live list under `pages/columnGoods`
- Coupon, invoice, gift, cancellation, collection, balance, bill, visit, message, friend-pay pages under `pages/users`
- Offline pay, offline result, VIP coupon, and special pages under `pages/annex`

Corresponding page directories were physically deleted.

## Removed disabled DIY components

The following disabled mobile DIY components were removed from `subpackage/diyComponents`, and `pageDesign.vue` no longer imports or registers them:

- `articleList.vue`
- `bargain.vue`
- `combination.vue`
- `coupon.vue`
- `customerService.vue`
- `liveBroadcast.vue`
- `news.vue`
- `seckill.vue`
- `presale.vue`
- `pointsMall.vue`
- `videos.vue`

## Route/reference cleanup

Navigation strings to deleted feature pages were removed or redirected away from deleted pages in:

- `template/uni-app/libs/order.js`
- `template/uni-app/components/orderGoods/index.vue`
- `template/uni-app/components/couponWindow/index.vue`
- `template/uni-app/pages/users/user_info/index.vue`
- `template/uni-app/pages/annex/vip_paid/index.vue`
- `template/uni-app/utils/index.js`
- `template/uni-app/pages/goods_details/index.vue`
- `template/uni-app/pages/index/index.vue`
- `template/uni-app/pages/user/index.vue`
- `template/uni-app/pages/goods/order_pay_status/index.vue`
- `template/uni-app/pages/goods/order_details/index.vue`
- `template/uni-app/components/kefuIcon/index.vue`
- `template/uni-app/subpackage/diyComponents/productBottom.vue`
- `template/uni-app/subpackage/diyComponents/menus.vue`
- `template/uni-app/subpackage/diyComponents/homeUserInfor.vue`
- `template/uni-app/subpackage/diyComponents/userInfor.vue`
- `template/uni-app/subpackage/diyComponents/newVip.vue`
- `template/uni-app/pages/goods/components/invoicePicker/index.vue`
- `template/uni-app/pages/admin/order_cancellation/index.vue`

## Static asset cleanup

Removed large or disabled-feature static assets:

- `public/statics/font/Alibaba-PuHuiTi-Regular.otf`
- Disabled marketing, coupon, customer-service, invoice, points, gift, and offline images.

Font references were switched to retained `public/statics/font/simsunb.ttf` in:

- `crmeb/utils/Canvas.php`
- `app/jobs/PosterJob.php`
- `app/api/controller/v1/user/UserBillController.php`
- `app/services/other/PosterServices.php`

## Verification

Passed:

```powershell
node -e "JSON.parse(require('fs').readFileSync('src/CRMEB/CRMEB-master/template/uni-app/pages.json','utf8'))"
docker exec -w /var/www/crmeb crmeb php -l crmeb/utils/Canvas.php
docker exec -w /var/www/crmeb crmeb php -l app/jobs/PosterJob.php
docker exec -w /var/www/crmeb crmeb php -l app/api/controller/v1/user/UserBillController.php
docker exec -w /var/www/crmeb crmeb php -l app/services/other/PosterServices.php
```

Residual note:

- A source import scan reports 7 pre-existing missing imports in admin/login/verify helper areas. They are not from the deleted MVP-disabled components.
- Full frontend/backend build smoke tests were not rerun after deleting `node_modules` and `vendor`, because reinstalling them would restore most of the removed size.

## Reinstall commands when running

Outer React/Vite shell:

```powershell
npm.cmd ci
```

CRMEB PHP dependencies:

```powershell
cd src/CRMEB/CRMEB-master/crmeb
composer install
```

Uni-app/admin dependencies should be installed in their own template directories only when those build targets are needed.
