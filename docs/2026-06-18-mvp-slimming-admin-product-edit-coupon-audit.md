# CRMEB MVP slimming down: backend product newly added editing page coupon entrance closing audit

Date: 2026-06-18

## Target

Continue to implement MVP soft slimming, only hide the coupon gameplay entrance in the back-end product addition/edit page and add a front-end cover. The code will not be deleted, the product saving interface will not be changed, and the products, orders, payments, secondary distribution, commissions, check-ins and core membership capabilities will not be affected.

This stage focuses on the remaining entrances to the product editing page that still exist after the last round of backend product lists were closed:

- Coupon products in product type.
- Purchase coupons in product marketing settings.
- Select coupons in single specification/multiple specifications.
- Select the coupon branch that appears with the coupon product on the member price/commission page.

## This adjustment

### New edit page parent component for products

Location:

- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/index.vue`

deal with:

- The product type list passed to the basic information component in MVP mode filters the coupon products of `id=2`.
- In MVP mode, the general coupon selection pop-up window and the product specification coupon selection pop-up window are not mounted.
- `virtualbtn()` Adds coupon product interception.
- `addCoupon()`, `addGoodsCoupon()`, `see()` Add MVP hints to avoid internal calls outside the hidden entrance to continue opening the coupon selection.

### Specs Stock Components

Location:

- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/components/SpecStock.vue`

deal with:

- Added `isMvpMode` input parameter.
- In MVP mode, the single-specification/multi-specification coupon selection button and the selected coupon viewing portal are hidden.
- Keep the card password/add card password entry for network disk products.

### Member price/commission component

Location:

- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/components/PriceCommission.vue`

deal with:

- In MVP mode, the selected coupon branch related to coupon products is hidden.
- Commission settings are retained and basic secondary distribution amount configuration is continued to be supported.

## retain ability

This time it does not affect:

- Add and edit general products.
- Card secret/network disk product entrance.
- Virtual goods portal.
- Product specifications, inventory, prices, product details, and logistics settings.
- Product commission settings.
- View the backend product list.
- WeChat payment, payment callback, order status machine.
- Secondary Distribution and Commission View.
- Sign-in and member core entrance.

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
- After logging in, enter the product addition page and confirm that coupon products are not displayed in the product type.
- Enter the general product editing/new marketing settings and confirm that the coupon for purchase is not displayed.
- Enter the specification inventory and confirm that the selected coupon entry related to the coupon product is not displayed.
- Confirm that ordinary products, card code/network disk products, and virtual products can still enter the editing process.

## Risk point

- At this stage, only the backend front-end entrance is hidden; if the product interface returns historical coupon product data, no physical cleaning is currently performed.
- Before actually deleting the ability to use coupon products, you need to check product specifications, coupon selection components, marketing APIs, historical product data, and database fields.
- The underlying capabilities of points need to be reserved for the sign-in link, and points-related fields or interfaces will not be deleted at this stage.
