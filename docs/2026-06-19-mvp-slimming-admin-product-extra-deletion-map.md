# 2026-06-19 MVP backend product extension delete mapping

## Purpose

This article only deletes mapping and does not physically delete files in this round. The current goal is to confirm that the product expansion capability has been separated from the main back-end product process, and to prepare for the next round of deleting components, API wrappers, permission records and back-end implementation in small batches.

## Front-end dependencies that have been removed from the product main process

The following component files are no longer statically imported by the product list or product editing main page, and have been physically deleted in the front-end mini-batch:

- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/taoBao.vue`
  - Original purpose: Open the collection pop-up window through `:type=-1` on the new product page.
  - Current status: The product editing page is no longer imported, mounted, or opened through query.
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productList/taoBao.vue`
  - Original purpose: Product collection pop-up window on product list page.
  - Current status: The product list page is no longer imported or mounted.
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productList/components/goodsImport.vue`
  - Original purpose: product migration and import.
  - Current status: The product list page is no longer imported or mounted.

## Frontend API wrapper removed

The following wrappers have confirmed no preserved path references and have been removed:

- `src/CRMEB/CRMEB-master/template/admin/src/api/product.js`
  - `copyConfigApi`
  - `crawlFromApi`
  - `crawlSaveApi`
- `src/CRMEB/CRMEB-master/template/admin/src/api/export.js`
  - `exportProductExport`
  - `importProductImport`

Note: `productGetTemplateApi` and `productGetTempKeysApi` are still referenced by other disabled modules or universal upload components. They are not included in the direct deletion items in this round. Cross-module confirmation should be completed first.

## Background permissions and menu records to be deleted

Before subsequently deleting SQL or menu permissions, you need to locate and process the following permission identifiers:

- `product-crawl`
- `product-copy_config`
- `product-crawl-save`
- `product-copy`
- `product-product-get_template`
- `product-product-get_temp_keys`
- `product-product-import_card`
- `product-product_export`
- `product-product_import`

Currently these identities are closed via MVP menu hiding and routing interception.

## Backend implementation to be deleted

This round of back-end physical deletion of product collection and product migration has been completed, and tool classes and permission records that require cross-module confirmation are still retained:

- Deleted `app/adminapi/controller/v1/product/CopyTaobao.php`
- Removed `productExport`, `productImport` in `app/adminapi/controller/v1/product/StoreProduct.php`
- Removed `copyProduct` in `app/services/product/product/CopyTaobaoServices.php`
- Removed `productExportList`, `productImport` in `app/services/product/product/StoreProductServices.php`
- Product collection and product migration routes in `app/adminapi/route/product.php` have been deleted
- Still to be evaluated `get_template`, `getTempKeys`, `import_card`
- The `CopyTaobaoServices` file is still retained for remote image download and reuse.

## Next round of suggestions

Two things should be done first in the next round:

- Clean up product collection, product migration related permissions and upgrade records.
- Continue to evaluate the back-end implementation and permission records corresponding to card secret import, video keys, and freight templates.
- Then evaluate the cross-module references of `productGetTemplateApi` and `productGetTempKeysApi` separately to avoid accidentally deleting code that is still indirectly referenced by the universal upload component or the disabled marketing module.
