# 2026-06-19 MVP backend product expansion backend physical deletion record
## Goal of this round
After the front-end product collection and product migration code has been deleted, this round continues to delete the back-end callable implementation of the back-end product extension. The scope of deletion is limited to product collection and product migration, and freight templates, video upload keys, and virtual card password imports that still need to be evaluated separately will not be processed.
## Route deleted
Removed from `app/adminapi/route/product.php`:
- `GET /adminapi/product/product_export`
- `POST /adminapi/product/product_import`
- `POST /adminapi/product/crawl`
- `GET /adminapi/product/copy_config`
- `POST /adminapi/product/copy`
- `POST /adminapi/product/crawl/save`

## Controller deleted
- Delete `app/adminapi/controller/v1/product/CopyTaobao.php`
  - Original purpose: product collection and configuration, copying products, and saving collected products.
- Removed from `app/adminapi/controller/v1/product/StoreProduct.php`:
  - `productExport`
  - `productImport`
## Service method deleted
- Removed from `app/services/product/product/CopyTaobaoServices.php`:
  - `copyProduct`
- Removed from `app/services/product/product/StoreProductServices.php`:
  - `productExportList`
  - `productImport`
## Reserved for this round
- The entire `CopyTaobaoServices` file is retained.
  - Reason: `ProductCopyJob`, `StoreProductServices`, `SystemAttachmentServices` still reuse the remote image download capabilities, such as `downloadImage`, `downloadCopyImage`.
- The background permissions and upgrade records have not been cleared yet.
  - Reason: `UpgradeController`, menu/permission records need to be sorted out separately to avoid affecting the installation or upgrade process.
- `product/product/get_template`
- `product/product/get_temp_keys`
- `product/product/import_card`
  - Reason: These are freight templates, video keys, and virtual card password imports, which have been intercepted or hidden by MVP, but cross-module references still need to be confirmed separately before deleting them.
## Verify records
This round has been executed:
```powershell
php -l src/CRMEB/CRMEB-master/crmeb/config/mvp.php
php -l src/CRMEB/CRMEB-master/crmeb/app/services/product/product/CopyTaobaoServices.php
php -l src/CRMEB/CRMEB-master/crmeb/app/services/product/product/StoreProductServices.php
php -l src/CRMEB/CRMEB-master/crmeb/app/adminapi/controller/v1/product/StoreProduct.php
php -l src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/product.php
```

The results are all without syntax errors.
## Residue description
The current search will still hit:
- `CopyTaobaoServices`
  - This is a reuse class for remote image download capabilities and is reserved for this round.
- Legacy file checksum menu/permissions insertion records in `UpgradeController`.
  - It falls within the scope of upgrade/privilege data cleaning and will be processed separately in the next round.
- Menu hiding flag in `config/mvp.php`.
  - Used to continue hiding the permission menu that may exist in the database, and then delete it after the permission records are cleared.
## Next round of suggestions
The next round of recommended entry permissions and upgrade record cleaning:
- Clean up the product collection and migration related file verification and menu permission insertion records in `UpgradeController`.
- Continue to clean up the product collection/migration menu hidden logo corresponding to the route in `config/mvp.php`.
- Then separately evaluate whether the back-end implementation of freight template, video upload key, and virtual card password import can be deleted.