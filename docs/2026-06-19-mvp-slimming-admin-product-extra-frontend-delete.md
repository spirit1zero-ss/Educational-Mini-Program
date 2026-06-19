# 2026-06-19 MVP 后台商品扩展前端物理删除记录

## 本轮目标

在商品采集和商品迁移入口已经被隐藏、主页面静态依赖已经摘除后，本轮执行第一批前端物理删除，只删除已经确认不再被商品主流程引用的前端文件和专用 API wrapper。

## 已删除文件

- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/taoBao.vue`
  - 原用途：新增商品页商品采集弹窗。
  - 删除依据：商品编辑主页面已不再导入、不再挂载、不再通过 `?type=-1` 打开。
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productList/taoBao.vue`
  - 原用途：商品列表页商品采集弹窗。
  - 删除依据：商品列表主页面已不再导入、不再挂载。
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productList/components/goodsImport.vue`
  - 原用途：商品迁移导入弹窗。
  - 删除依据：商品列表主页面已隐藏商品迁移入口，并已移除组件静态依赖。

## 已删除 API wrapper

- `src/CRMEB/CRMEB-master/template/admin/src/api/product.js`
  - `copyConfigApi`
  - `crawlFromApi`
  - `crawlSaveApi`
- `src/CRMEB/CRMEB-master/template/admin/src/api/export.js`
  - `exportProductExport`
  - `importProductImport`

## 保留内容

以下内容本轮不删除：

- 后端路由、控制器、服务和权限记录。
- `productGetTemplateApi`
- `productGetTempKeysApi`

原因：

- 后端仍需继续通过 MVP 路由拦截保护，后续按后端删除映射单独处理。
- `productGetTemplateApi` 和 `productGetTempKeysApi` 仍存在跨模块引用，需要单独评估后再决定是否删除或迁移。

## 验证记录

本轮已确认：

- 商品列表和商品编辑主页面不再引用 `taoBao` 或 `goodsImport`。
- 后台前端源码中不再出现以下符号：
  - `copyConfigApi`
  - `crawlFromApi`
  - `crawlSaveApi`
  - `exportProductExport`
  - `importProductImport`
- 后台构建仍因本地未安装依赖阻塞，错误为 `vue-cli-service` 不存在。

## 后续建议

下一轮建议继续处理后端删除映射：

- 删除或迁移商品采集后端控制器和服务。
- 删除商品迁移导入/导出后端方法。
- 清理权限和菜单记录中的商品采集、迁移、卡密导入、视频密钥、运费模板标识。
