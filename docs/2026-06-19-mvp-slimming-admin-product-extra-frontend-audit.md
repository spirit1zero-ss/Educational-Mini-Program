# 2026-06-19 MVP 后台商品扩展前端收口审计

## 本轮目标

在上一轮后端已拦截商品扩展接口的基础上，本轮继续收口后台前端入口，避免 MVP 模式下页面主动调用已禁用接口或暴露不需要的操作按钮。

## 已收口的前端入口

统一由 `template/admin/src/config/mvp.js` 中的 `isMvpProductExtrasEnabled()` 控制。

- 商品列表页：
  - 隐藏“商品采集”按钮。
  - 隐藏“商品迁移”下拉入口。
  - MVP 模式下商品迁移导入/导出方法增加短路提示。
- 批量物流设置：
  - MVP 模式下不展示“运费模板”选项。
  - MVP 模式下不再请求 `product/product/get_template`。
  - 仍保留固定邮费等基础物流字段，避免影响商品核心编辑。
- 商品编辑页：
  - MVP 模式下不再通过 query type 打开商品采集弹窗。
  - MVP 模式下不再自动请求运费模板接口。
  - MVP 模式下不展示新视频上传入口；已有视频仍可展示和删除。
  - MVP 模式下视频云上传逻辑不再请求 `product/product/get_temp_keys`。
  - MVP 模式下隐藏“导入卡密”上传按钮，并在导入回调中增加短路保护。

## 保留边界

本轮没有删除页面、组件或 API wrapper，仍保留：

- 商品列表、商品编辑、新增商品主流程。
- 普通商品、卡密/网盘商品、虚拟商品的基础编辑能力。
- 商品分类、规格、标签、参数、保障等基础管理能力。
- 商品普通数据导出 `export/storeProduct`。

## 变更文件

- `src/CRMEB/CRMEB-master/template/admin/src/config/mvp.js`
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productList/index.vue`
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/index.vue`
- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/components/BasicInfo.vue`

## 验证建议

建议在后台构建或本地开发环境中检查：

- 商品列表页不显示“商品采集”和“商品迁移”。
- 商品列表页普通“数据导出”仍显示。
- 批量修改中选择“物流设置”时不出现“运费模板”选项。
- 商品编辑页不出现新增视频上传入口。
- 商品编辑页打开时不再请求 `product/product/get_template`。
- 直接访问 `/product/add_product?type=-1` 不再弹出采集商品弹窗。

## 后续删除提示

真正物理删除前，还需要继续搜索并确认：

- `taoBao.vue` 采集弹窗是否可以整体删除。
- 商品迁移导入组件 `goodsImport.vue` 是否可以整体删除。
- `api/product.js` 和 `api/export.js` 中商品扩展 wrapper 是否还有非 MVP 路径引用。
- 后台菜单表、权限表中的商品采集和迁移权限是否要进入删除映射。
