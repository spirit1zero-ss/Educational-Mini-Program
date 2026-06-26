# 2026-06-20 MVP Product Extra Template, Video Key, and Virtual Card Evaluation

## Goal

Evaluate the remaining backend product-extra endpoints before any further physical deletion:

- `product/product/get_template`
- `product/product/get_temp_keys`
- `product/product/import_card`

This round is evaluation only. No source code was deleted.

## Current Backend Protection

The endpoints remain defined in `crmeb/app/adminapi/route/product.php`:

- `GET product/get_template`
- `GET product/get_temp_keys`
- `GET product/import_card`

They are still listed under `enable_product_extras=false` in `crmeb/config/mvp.php`:

- `admin_menu_hidden_patterns`
- `admin_route_block_patterns`

Because the product admin route group runs backend authentication before the MVP route-block middleware, unauthenticated requests can return `401`. To verify the MVP block result, log in to the backend first and pass `Authori-zation: Bearer <token>`.

## Reference Map

### `productGetTemplateApi`

Frontend wrapper:

- `template/admin/src/api/product.js`

Direct frontend callers:

- `template/admin/src/pages/product/productAdd/index.vue`
- `template/admin/src/pages/product/productList/index.vue`
- `template/admin/src/pages/marketing/storeBargain/create.vue`
- `template/admin/src/pages/marketing/storeCombination/create.vue`
- `template/admin/src/pages/marketing/storePresell/create.vue`
- `template/admin/src/pages/marketing/storeSeckill/create.vue`
- `template/admin/src/pages/marketing/storeSeckill/createMore.vue`

Assessment:

- Product add/edit and product list still reference this API for freight-template data.
- In MVP mode, product add/edit and product list already guard the call with product-extra checks and set the template list to empty when product extras are disabled.
- Disabled marketing activity pages still contain references, but those pages are outside the MVP surface.
- Do not delete this backend implementation yet. It is still coupled to product editing and batch logistics settings.

### `productGetTempKeysApi`

Frontend wrapper:

- `template/admin/src/api/product.js`

Direct frontend callers:

- `template/admin/src/pages/product/productAdd/index.vue`
- `template/admin/src/components/uploadVideo/index.vue`
- `template/admin/src/components/uploadVideo/index copy.vue`
- `template/admin/src/components/uploadVideo2/index.vue`
- `template/admin/src/components/uploadVideo2/index copy.vue`
- `template/admin/src/components/uploadVideos/index copy.vue`
- `template/admin/src/pages/system/group/visualization.vue`
- `template/admin/src/pages/marketing/recharge/index.vue`
- `template/admin/src/pages/marketing/sign/index.vue`

Indirect surfaces:

- Rich-text editor video insertion through `components/wangEditor/index.vue`
- System file video upload through `pages/system/file/index.vue`
- Global video modal registration through `main.js`

Assessment:

- This is not only a product video feature. It is a generic video-upload credential endpoint reused by editor, file, visualization, and some marketing/settings surfaces.
- Product add/edit already guards direct product video upload in MVP mode.
- Generic upload components do not have an obvious product-extra guard.
- Do not delete this backend implementation yet. It is high risk because it is shared outside the product-extra area.

### `importCard`

Frontend wrapper:

- `template/admin/src/api/product.js`

Direct frontend caller:

- `template/admin/src/pages/product/productAdd/index.vue`

Assessment:

- The only direct frontend caller is the product add/edit page.
- The product add/edit page already checks product extras before calling `importCard`.
- The backend endpoint parses an uploaded spreadsheet and returns virtual-card data.
- This is the best candidate for a later physical deletion round, but it should still wait until the product add/edit virtual-product UI and persisted virtual-card fields are checked together.

## Docker Smoke Test

Docker backend was already running on:

```text
http://127.0.0.1:8011
```

Containers were up:

- `crmeb_nginx`
- `crmeb_php`
- `crmeb_mysql`
- `crmeb_redis`

Smoke-test results:

- `GET /api/version`
  - `status=200`
  - `msg=success`
- `GET /api/product/detail/1`
  - `status=200`
  - `msg=success`
  - `coupons=[]`
- `GET /api/pc/get_products`
  - `status=200`
  - `msg=success`
- `GET /api/pc/get_news_list`
  - `status=400`
  - `msg=MVP module disabled`
- `GET /adminapi/product/product`
  - unauthenticated request returns backend auth protection, not `MVP module disabled`
- Backend login with the local admin account succeeded.
- Authenticated checks:
  - `GET /adminapi/product/product/get_template`
  - `GET /adminapi/product/product/get_temp_keys`
  - `GET /adminapi/product/product/import_card`
  - all returned `status=400`, `msg=MVP module disabled`

Runtime note:

- The Docker backend remains slow on Windows bind mounts. Some requests took about 20-40 seconds. Use long timeouts for smoke tests.

## Recommendation

Do not physically delete these endpoints in the next round.

Next small-batch target:

1. Add or confirm frontend MVP guards for the generic video upload surfaces that still call `productGetTempKeysApi`.
2. Keep the backend `get_temp_keys` route blocked by MVP config while the shared upload usage is reviewed.
3. Separately audit product add/edit virtual-product UI before deciding whether `importCard` can be removed.
4. Keep `get_template` for now because product add/edit and product list still have freight-template coupling, even when the current MVP path suppresses calls.

Suggested next verification set:

```powershell
curl http://127.0.0.1:8011/api/product/detail/1
curl http://127.0.0.1:8011/api/pc/get_products
curl http://127.0.0.1:8011/api/pc/get_news_list
curl http://127.0.0.1:8011/adminapi/product/product
```

For backend product-extra endpoints, log in first and pass:

```text
Authori-zation: Bearer <token>
```
