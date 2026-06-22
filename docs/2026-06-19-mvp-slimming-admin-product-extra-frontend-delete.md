# 2026-06-19 MVP back-end product expansion front-end physical deletion record
## Goal of this round
After the product collection and product migration entrances have been hidden, and the static dependencies of the main page have been removed, the first batch of front-end physical deletions will be executed in this round, and only the front-end files and dedicated API wrappers that have been confirmed to be no longer referenced by the main product process will be deleted.
## Deleted files
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/taoBao.vue`
  - Original purpose: Add a product collection pop-up window on the product page.
  - Deletion basis: The main product editing page is no longer imported, mounted, or opened through `:type=-1`.
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productList/taoBao.vue`
  -Original purpose: Product collection pop-up window on product list page.
  - Deletion basis: The main product list page is no longer imported or mounted.
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productList/components/goodsImport.vue`
  - Original purpose: Product migration import pop-up window.
  - Deletion basis: The product migration entrance has been hidden on the main product list page, and static dependencies of components have been removed.
## API wrapper removed
- `src/CRMEB/CRMEB-master/template/admin/src/api/product.js`
  - `copyConfigApi`
  - `crawlFromApi`
  - `crawlSaveApi`
- `src/CRMEB/CRMEB-master/template/admin/src/api/export.js`
  - `exportProductExport`
  - `importProductImport`

## Reserved content
The following content will not be deleted this round:
- Backend routing, controllers, services and permissions logging.
- `productGetTemplateApi`
- `productGetTempKeysApi`
reason:
- The backend still needs to continue to be protected by MVP route interception, and subsequent backend deletion mappings will be processed separately.
- `productGetTemplateApi` and `productGetTempKeysApi` still have cross-module references and need to be evaluated individually before deciding whether to delete or migrate them.
## Verify records
This round has been confirmed:
- The product list and the main product editing page no longer reference `taoBao` or `goodsImport`.
- The following symbols no longer appear in the background and front-end source code:
  - `copyConfigApi`
  - `crawlFromApi`
  - `crawlSaveApi`
  - `exportProductExport`
  - `importProductImport`
- The background build is still blocked because the dependency is not installed locally, and the error is that `vue-cli-service` does not exist.
## Follow-up suggestions
The next round of recommendations continues with backend deletion mapping:
- Delete or migrate product collection backend controllers and services.
- Removed product migration import/export backend methods.
- Clean up product collection, migration, card password import, video key, and freight template identification in permissions and menu records.