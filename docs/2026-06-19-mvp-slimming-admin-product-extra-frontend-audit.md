# 2026-06-19 MVP back-end product expansion front-end closing audit

## Goal of this round

On the basis that the last round of back-end intercepted the product extension interface, this round continues to close the back-end front-end entrance to prevent the page from actively calling disabled interfaces or exposing unnecessary operation buttons in MVP mode.

## Closed front entrance

Unification is controlled by `isMvpProductExtrasEnabled()` in `template/admin/src/config/mvp.js`.

- Product list page:
  - Hide the "Product Collection" button.
  - Hide the "Product Migration" drop-down entry.
  - A short-circuit prompt is added to the product migration import/export method in MVP mode.
  - The static dependencies of the collection pop-up window `taoBao.vue` and the migration import component `goodsImport.vue` have been removed from the main product list page.
- Batch logistics settings:
  - The "Shipping Template" option is not displayed in MVP mode.
  - `product/product/get_template` is no longer requested in MVP mode.
  - Basic logistics fields such as fixed postage are still retained to avoid affecting the core editing of products.
- Product editing page:
  - In MVP mode, the product collection pop-up window is no longer opened through query type.
  - The freight template interface is no longer automatically requested in MVP mode.
  - In MVP mode, the new video upload portal is not displayed; existing videos can still be displayed and deleted.
  - In MVP mode, the video cloud upload logic no longer requests `product/product/get_temp_keys`.
  - Hide the "Import Card Secret" upload button in MVP mode, and add short-circuit protection in the import callback.
  - The static dependency of the collection pop-up window `taoBao.vue` has been removed from the main product editing page.

## preserve boundaries

Pages, components or API wrappers have not been deleted in this round and remain:

- Product list, product editing, and main process of adding new products.
- Basic editing capabilities for ordinary products, card secret/network disk products, and virtual products.
- Basic management capabilities such as product classification, specifications, labels, parameters, and guarantees.
- Product general data export `export/storeProduct`.

## change file

- `src/CRMEB/CRMEB-master/template/admin/src/config/mvp.js`
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productList/index.vue`
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/index.vue`
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/components/BasicInfo.vue`

## Verify recommendations

It is recommended to check in the background build or local development environment:

- The product list page does not display "Product Collection" and "Product Migration".
- The normal "Data Export" on the product list page is still displayed.
- The "Freight Template" option does not appear when "Logistics Settings" is selected in batch modification.
- The new video upload entry does not appear on the product editing page.
- `product/product/get_template` is no longer requested when the product edit page is opened.
- Directly accessing `/product/add_product:type=-1` will no longer pop up the product collection pop-up window.

## Subsequent deletion tips

Before actual physical deletion, you still need to continue searching and confirming:

- `taoBao.vue` Whether the collection pop-up window can be deleted as a whole.
- Whether the product migration import component `goodsImport.vue` can be deleted as a whole.
- Whether there are non-MVP path references for the product extension wrapper in `api/product.js` and `api/export.js`.
- Whether the product collection and migration permissions in the backend menu table and permission table need to enter the deletion mapping.

## Current residual status

The following files are no longer statically imported from the main product page and have been physically deleted in subsequent small batches:

- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/taoBao.vue`
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productList/taoBao.vue`
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productList/components/goodsImport.vue`

The following API wrappers have confirmed unreserved path references and have been physically removed in subsequent mini-batches:

- `copyConfigApi`
- `crawlFromApi`
- `crawlSaveApi`
- `exportProductExport`
- `importProductImport`
