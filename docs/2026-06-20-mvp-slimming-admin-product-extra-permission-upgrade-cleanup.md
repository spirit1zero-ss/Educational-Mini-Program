# 2026-06-20 MVP backend product expansion permissions and upgrade record cleanup
## Goal of this round
Continue to focus on the backend product expansion and finishing, and prioritize cleaning up the permissions, menus and upgrade records related to product collection/product migration. This round only processes the remnants of product collection/product migration that have been physically deleted from the front and back ends; freight templates, video upload keys, and virtual card passwords are only imported for reference evaluation and will not be deleted directly.
## Cleaned content
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/controller/UpgradeController.php`
  - Delete the `app/adminapi/controller/v1/product/CopyTaobao.php` file verification record that no longer exists.
  - Delete the `Product collection configuration` record in the background menu.
  - Delete the `Product collection` parent record in the backend product menu, as well as the acquisition/copy/product editing multiplex permission sub-records hanging under the parent record, to avoid upgrading and inserting deleted entries or orphan permissions.
- `src/CRMEB/CRMEB-master/crmeb/public/install/crmeb.sql`
  - Delete `CopyTaobao.php` file records and file verification records in new installation data.
  - Delete the `Product collection configuration`, `Product collection` menu records and their sub-permission records in the new installation data.
  - Delete the product collection interface document record and interface document grouping pointing to `CopyTaobao.php`.
- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
  - Clean up the hidden identifiers of the product collection menu that no longer correspond to routes: `product-crawl`, `product-copy`, `product-copy_config`.
  - Retain freight templates, video upload keys, menu hiding and routing interception rules for virtual card password import.
- `src/CRMEB/CRMEB-master/template/admin/src/router/modules/setting.js`
  - Delete the `Product collection configuration` entry in the background and front-end settings routing.
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productList/index.vue`
  - Delete the hidden `Product collection` button and the corresponding `onCopy()` dead code in the product list page to avoid continuing to reference the deleted collection permissions.
  - Delete the `Product migration` drop-down entry in the product list page, as well as the corresponding `goodsMove()`, `onImport()` and migration export-specific parameters.
  - Retain the normal `Data export` button and `export-storeProduct` permissions, which will not affect the normal export of the product list.
## Retention and evaluation for this round
- The `CopyTaobaoServices` file remains.
  - Reason: `ProductCopyJob`, `StoreProductServices`, `SystemAttachmentServices` still reuse the remote image download capability.
- Shipping template `product/product/get_template` remains and is protected by MVP interception.
  - Still referenced by paths such as product addition/editing, product list batch logistics settings, disabled marketing activity creation page, etc.
- The video upload key `product/product/get_temp_keys` remains and is protected by MVP interception.
  - Still referenced by the general video upload component, product addition/editing, page visualization, and some disabled marketing pages.
- Virtual card key import `product/product/import_card` remains and is protected by MVP interception.
  - The expansion capability of the product is currently reserved for the next round of separate evaluation and will not be deleted in this round.
## Verify records
Executed:
```powershell
php -l .\src\CRMEB\CRMEB-master\crmeb\config\mvp.php
php -l .\src\CRMEB\CRMEB-master\crmeb\app\adminapi\controller\UpgradeController.php
git diff --check
npm.cmd ci
npm.cmd install --legacy-peer-deps
npm.cmd run build:mp-weixin
npm.cmd install --legacy-peer-deps --package-lock=false
npm.cmd run build
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/api/product/detail/1
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product
```

result:
- `config/mvp.php` No syntax error.
- `UpgradeController.php` No syntax errors.
- `git diff --check` passes; it only prompts that Git may convert some text files LF to CRLF according to the local settings in the future.
- Restored `src/CRMEB/CRMEB-master/crmeb/public/install/crmeb.sql` to UTF-8 without BOM to avoid extra characters in the installation SQL file header.
- Background `template/admin` dependency installation is not completed:
  - `npm.cmd ci` failed because `package.json` and `package-lock.json` were out of sync and missing lock file records such as `eslint-plugin-node`, `eslint-plugin-promise`, `eslint-plugin-standard`, etc.
  - `npm.cmd install --legacy-peer-deps` continues to fail because the old dependency `deasync` fails to be natively compiled under the current Node 24.16.0; the project states that the support scope is Node `>14.0.0 < 23.0.0`.
  - After subsequently switching to temporary Node 16.20.2, the execution of `npm.cmd install --legacy-peer-deps --package-lock=false` was successful; the command did not change `package-lock.json`.
  - The background build `npm.cmd run build` passed and generated `template/admin/dist`.
  - After deleting the product migration drop-down entry, `npm.cmd run build` has been executed again and the build has passed.
  - There are existing warnings in the build output: `mini-css-extract-plugin` style order conflict, large size of some resources, old dependency/security vulnerability warning.
- The dependency installation of the applet `template/uni-app` is completed:
  - `npm.cmd ci` succeeds and executes `scripts/patch-uni-loader.cjs` in `postinstall`.
  - The installation output still contains old dependencies, `EBADENGINE` and security vulnerability warnings, and records need to be kept.
- The applet build failed for the first time:
  - `npm.cmd run build:mp-weixin` fails with the old build chain calling `util.isRegExp`.
  - This API is no longer available in Node 24.16.0.
- The mini program build has passed for the second time:
  - Re-executing `npm.cmd run build:mp-weixin` with temporary Node 16.20.2 succeeded.
  - `src/CRMEB/CRMEB-master/template/uni-app/dist/build/mp-weixin` generated.
  - There are existing warnings in the build output: several export not found prompts, Sass `@import` deprecation prompts, custom components recommended to be moved to sub-packages, etc.
- The interface smoke test is not completed:
  - `http://127.0.0.1:8080/api/product/detail/1` cannot connect.
  - `http://127.0.0.1:8080/adminapi/product/product` cannot connect.
  - The native `docker` command is not available, and the Docker backend container in the document cannot be started in the current environment.
Residual search performed:
- In `UpgradeController.php`, `config/mvp.php`, `public/install/crmeb.sql`, background setting routing, product list page, product collection/copy related permissions and menu residues are no longer hit:
  - `product-crawl`
  - `product-copy_config`
  - `product-crawl-save`
  - `product-copy`
  - `product/crawl`
  - `product/copy_config`
  - `product/copy`
  - `CopyTaobao.php`
  - `setting-other-copy`
- Freight templates, video upload keys, and virtual card password imports are still expected to hit, indicating that these three types of suspension capabilities have not been directly deleted in this round.
- `Product migration`, `Product import`, `goodsMove`, `onImport` are no longer hit in the product list page.
- `Product export` / `product-export` still retained in `UpgradeController.php` and `public/install/crmeb.sql` are ordinary product list data export permissions and do not belong to the import and export entrance of product migration deleted in this round.
- The `product_import`, `product_export`, `product/product_import`, and `product/product_export` that are specific to product migration are no longer hit in the backend and backend source codes.
- Only the common product list export `exportProductList()` is retained in the background `src/api/export.js`, and the interface is `/export/product_list`.
## Risks and next steps
- This round of front-end build threshold has been passed under temporary Node 16.20.2.
- Before entering the next batch of deletions, it is recommended to use the Node version supported by the project to perform the build to avoid Node 24 triggering the old build chain compatibility issue again.
- The background `package.json` and `package-lock.json` are currently out of sync; in this round, in order to avoid expanding dependency changes, `--package-lock=false` is used to complete the verification, and the lock file is not modified. If you want a long-term stable build in the future, dependency lock synchronization should be handled separately.
- The interface smoke test has not been completed in this round; the core interface smoke test still needs to be performed in the runnable backend environment before the next round of deletion.
- The next round of suggestions will only be evaluated, not deleted directly:
  - Split the references of `productGetTemplateApi` in the product main process, batch logistics settings, and disabled marketing activities.
  - Split references to `productGetTempKeysApi` in the generic video upload component and disabled marketing/renovation pages.
  - Separately confirm whether `product/product/import_card` only serves virtual card password extensions.