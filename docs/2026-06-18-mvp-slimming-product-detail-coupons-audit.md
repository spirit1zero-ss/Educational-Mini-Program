# CRMEB MVP Slimming: Product Details Coupon Response Closure Audit

## Goal of this round

Continue to implement MVP soft slimming, and only process the coupon response residue in the front-end product details interface. When `enable_coupon=false` is used in MVP mode, the product details will no longer return to the list of coupons that can be collected; the coupon service will not be deleted, the order logic will not be modified, and the product details, specifications, inventory, member price, payment, commission, check-in, and member core capabilities will not be affected.

## Changes in this round

document:

- `src/CRMEB/CRMEB-master/crmeb/app/services/product/product/StoreProductServices.php`

change:

- Reuse existing `mvp_enabled('enable_coupon', true)` configuration when assembling store listing responses in `productDetail()`.
- When `enable_coupon=false` is used, `StoreCouponIssueServices::getIssueCouponList()` will no longer be called to query product coupons.
- To keep the response structure stable, the `coupons` field is retained but set to an empty array `[]` in MVP mode.

## unchanged range

- The coupon service, Dao, Model, route or database table was not deleted.
- Unmodified orders, payments, payment callbacks, secondary distribution, commissions, check-ins, and memberships.
- Product editing, product saving, SKU coupon fields and order coupon logic have not been modified.
- The front-end page display logic has not been modified.

## local verification

Executed:

```powershell
cd src/CRMEB/CRMEB-master/crmeb
php -l app/services/product/product/StoreProductServices.php
docker exec -w /var/www/crmeb crmeb php think clear
curl.exe -i --max-time 20 http://127.0.0.1:8080/api/product/detail/1
curl.exe -i --max-time 20 http://127.0.0.1:8080/adminapi/marketing/coupon/released
```

Actual result:

- The `php -l app/services/product/product/StoreProductServices.php` syntax check in the container passes.
- `docker exec -w /var/www/crmeb crmeb php think clear` returns `Clear Successed`.
- `GET http://127.0.0.1:8080/api/product/detail/1` returns `HTTP/1.1 200 OK`, JSON `status:200`.
- `coupons` in the product detail response is `[]`.
- `GET http://127.0.0.1:8080/adminapi/marketing/coupon/released` returns `{"status":400,"msg":"MVP module disabled"}`.

Verification environment description:

- The current `crmeb` container has mounted the local `dev3` project directory to `/var/www/crmeb`.
- To prevent the local mounting directory from triggering the installation page jump, `public/install.lock` has been added to the local verification environment.

## Risk point

- This round only processes product details response display, and does not process order-side coupons, product editing-side coupons, and historical SKU coupon fields.
- The `coupons` empty array is retained to reduce front-end compatibility risks; if it is later confirmed that the front-end does not rely on this field, you can re-evaluate whether to completely hide the field.
- If `enable_coupon=true` is subsequently reopened, product details will restore the original coupon query and response.
