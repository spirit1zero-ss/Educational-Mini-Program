# 2026-06-19 MVP backend product expansion interface slimming audit

## Goal of this round

This round continues to adopt the soft slimming strategy, without deleting route definitions, controllers, services, models, data tables or front-end files, and only closing the expansion capabilities in the backend product module that do not fall within the current minimum product scope in MVP mode.

## Backend product expansion capability status

Currently, `enable_product_extras=false` in `config/mvp.php` continues to control the remaining extended interfaces; product collection and product migration have entered the physical deletion stage.

- Product collection has been physically deleted:
  - `POST /adminapi/product/crawl`
  - `GET /adminapi/product/copy_config`
  - `POST /adminapi/product/copy`
  - `POST /adminapi/product/crawl/save`
- Product migration has been physically deleted:
  - `GET /adminapi/product/product_export`
  - `POST /adminapi/product/product_import`
- Virtual card secret import is still intercepted by MVP routing:
  - `GET /adminapi/product/product/import_card`
- Video upload key is still intercepted by MVP routing:
  - `GET /adminapi/product/product/get_temp_keys`
- The shipping template is still intercepted by the MVP route:
  - `GET /adminapi/product/product/get_template`

## preserve boundaries

The following backend product core capabilities are not intercepted in this round and are still retained as the main process of MVP product management:

- Product list, details, new addition, editing, loading and unloading, and recycle bin.
- Product classification, specifications, rules, and attribute generation.
- Product type configuration.
- Basic management capabilities such as product labels, parameters, and guarantees.

## Impact statement

- The backend product routing group has been connected to `MvpRouteBlockMiddleware`, and the undeleted extended interfaces continue to be intercepted through configuration mode.
- Item collection and item migration routes, controller actions, and dedicated service methods have been physically removed in subsequent mini-batches.
- The product extension hidden matching is added to the menu side simultaneously to reduce the exposure of the backend entrance.
- The core product interfaces are not disabled as a whole group to avoid affecting the main process of the backend product list and editing page.

## Verify records

This round needs to complete at least:

```powershell
php -l src/CRMEB/CRMEB-master/crmeb/config/mvp.php
php -l src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/product.php
```

It is recommended to supplement the interface smoke test when there is a background login state in the future:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product/get_template
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product_import
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/crawl
```

Expected results:

- `product/product` This type of core product list interface should not be intercepted by MVP due to this round of configuration.
- Remaining commodity extension interfaces such as `product/product/get_template` should return MVP disable prompts or equivalent interception results.
- Deleted interfaces such as `product/product_import` and `product/crawl` no longer exist as callable background capabilities.

## Subsequent deletion tips

Before actual physical deletion, you need to continue to confirm:

- Is there any front-end button or page that calls these interfaces directly:
- Whether there is a product editing form that relies on the return value of the freight template for required initialization.
- Whether there are any historical product data migration, card secret import or collection tasks that require a read-only entry.
