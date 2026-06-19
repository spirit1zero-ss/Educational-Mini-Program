# 2026-06-19 MVP 后台商品扩展删除映射

## 目的

本文只做删除映射，不在本轮物理删除文件。当前目标是确认商品扩展能力已经从后台商品主流程脱离，为下一轮按小批次删除组件、API wrapper、权限记录和后端实现做准备。

## 已从商品主流程摘除的前端依赖

以下组件文件已不再由商品列表或商品编辑主页面静态导入，并已在前端小批次中物理删除：

- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/taoBao.vue`
  - 原用途：新增商品页通过 `?type=-1` 打开采集弹窗。
  - 当前状态：商品编辑页不再导入、不再挂载、不再通过 query 打开。
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productList/taoBao.vue`
  - 原用途：商品列表页商品采集弹窗。
  - 当前状态：商品列表页不再导入、不再挂载。
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productList/components/goodsImport.vue`
  - 原用途：商品迁移导入。
  - 当前状态：商品列表页不再导入、不再挂载。

## 已删除前端 API wrapper

以下 wrapper 已确认无保留路径引用，并已删除：

- `src/CRMEB/CRMEB-master/template/admin/src/api/product.js`
  - `copyConfigApi`
  - `crawlFromApi`
  - `crawlSaveApi`
- `src/CRMEB/CRMEB-master/template/admin/src/api/export.js`
  - `exportProductExport`
  - `importProductImport`

注意：`productGetTemplateApi` 和 `productGetTempKeysApi` 仍被其他已禁用模块或通用上传组件引用，本轮暂不列入直接删除项，应先完成跨模块确认。

## 待删除后台权限和菜单记录

后续删除 SQL 或菜单权限前，需要定位并处理以下权限标识：

- `product-crawl`
- `product-copy_config`
- `product-crawl-save`
- `product-copy`
- `product-product-get_template`
- `product-product-get_temp_keys`
- `product-product-import_card`
- `product-product_export`
- `product-product_import`

当前这些标识已通过 MVP 菜单隐藏和路由拦截收口。

## 待删除后端实现

本轮已完成商品采集和商品迁移的后端物理删除，仍保留需要跨模块确认的工具类和权限记录：

- 已删除 `app/adminapi/controller/v1/product/CopyTaobao.php`
- 已删除 `app/adminapi/controller/v1/product/StoreProduct.php` 中的 `productExport`、`productImport`
- 已删除 `app/services/product/product/CopyTaobaoServices.php` 中的 `copyProduct`
- 已删除 `app/services/product/product/StoreProductServices.php` 中的 `productExportList`、`productImport`
- 已删除 `app/adminapi/route/product.php` 中商品采集和商品迁移路由
- 仍待评估 `get_template`、`getTempKeys`、`import_card`
- `CopyTaobaoServices` 文件仍保留，用于远程图片下载复用

## 下一轮建议

下一轮优先做两件事：

- 清理商品采集、商品迁移相关权限和升级记录。
- 继续评估卡密导入、视频密钥、运费模板对应的后端实现和权限记录。
- 再单独评估 `productGetTemplateApi` 与 `productGetTempKeysApi` 的跨模块引用，避免误删仍被通用上传组件或已禁用营销模块间接引用的代码。
