# 2026-06-19 MVP Slimming: Backend Product Activity Detection Interface Closure Audit

## scope

Continue to implement MVP soft slimming without deleting product codes, marketing activity codes, product saving logic, or order and payment links.

This round only processes one non-MVP activity residue in the backend product interface:

- `GET /adminapi/product/product/check_activity/:id`

This interface is used to detect whether the product has marketing activities started. In the current MVP mode, activities such as price bargaining, group buying, flash sales, pre-sales, and lottery draws are all disabled, so there is no need to continue to expose this activity detection interface in the backend.

## This adjustment

Adjustment file:

- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/product.php`

Adjustments:

- Add `product/product/check_activity` to the interface interception rules of `enable_activity_status`.
- Add `MvpRouteBlockMiddleware` to the backend product routing group.

The product routing group still retains the original authentication, permissions and log middleware. The MVP middleware only intercepts the hit disabled interfaces according to the configuration rules, and does not close the entire product management interface.

## retain ability

This round does not affect:

- Backend product list, product details, product addition and editing.
- Product classification, specifications, attribute rules, product listing and removal.
- Product inventory, price, training camp product path.
- Order, payment, refund, commission, check-in and membership functions.

## Verify records

Local syntax check performed:

```powershell
php -l src/CRMEB/CRMEB-master/crmeb/config/mvp.php
php -l src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/product.php
```

result:

- `config/mvp.php` No syntax error found.
- `app/adminapi/route/product.php` No syntax error found.

After the CRMEB container is running, it is recommended to supplement the interface sampling test:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product/check_activity/1
```

expected:

- `GET /adminapi/product/product` still follows the original background authentication or normal product list logic and should not return `MVP module disabled`.
- `GET /adminapi/product/product/check_activity/1` returns `MVP module disabled` when `enable_activity_status=false` is used.

## Follow-up remarks

The backend product routing still has the capabilities of product collection, product migration, virtual card password import, video upload key, freight template, etc. These interfaces are not processed in this round because they are mixed with commodity management, logistics or operation configuration, and need to be separately judged later to determine whether they belong to MVP reserved capabilities.
