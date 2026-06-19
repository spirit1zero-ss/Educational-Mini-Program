# 2026-06-19 MVP 后台商品扩展接口瘦身审计

## 本轮目标

本轮继续采用软瘦身策略，不删除路由定义、控制器、服务、模型、数据表或前端文件，只在 MVP 模式下收口后台商品模块中不属于当前最小产品范围的扩展能力。

## 已纳入拦截的后台商品扩展能力

统一由 `config/mvp.php` 中的 `enable_product_extras=false` 控制：

- 商品采集：
  - `POST /adminapi/product/crawl`
  - `GET /adminapi/product/copy_config`
  - `POST /adminapi/product/copy`
  - `POST /adminapi/product/crawl/save`
- 商品迁移：
  - `GET /adminapi/product/product_export`
  - `POST /adminapi/product/product_import`
- 虚拟卡密导入：
  - `GET /adminapi/product/product/import_card`
- 视频上传密钥：
  - `GET /adminapi/product/product/get_temp_keys`
- 运费模板：
  - `GET /adminapi/product/product/get_template`

## 保留边界

以下后台商品核心能力本轮不拦截，仍作为 MVP 商品管理主流程保留：

- 商品列表、详情、新增、编辑、上下架、回收站。
- 商品分类、规格、规则、属性生成。
- 商品类型配置。
- 商品标签、参数、保障等基础管理能力。

## 影响说明

- 后台商品路由组已经接入 `MvpRouteBlockMiddleware`，本轮通过新增配置模式完成拦截。
- 菜单侧同步加入商品扩展隐藏匹配，减少后台入口暴露。
- 商品核心接口未整组禁用，避免影响后台商品列表和编辑页的主流程。

## 验证记录

本轮需要至少完成：

```powershell
php -l src/CRMEB/CRMEB-master/crmeb/config/mvp.php
php -l src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/product.php
```

建议后续有后台登录态时补充接口烟测：

```powershell
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product/get_template
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product_import
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/crawl
```

预期结果：

- `product/product` 这类核心商品列表接口不应因为本轮配置被 MVP 拦截。
- `product/product/get_template`、`product/product_import`、`product/crawl` 等商品扩展接口应返回 MVP 禁用提示或等价拦截结果。

## 后续删除提示

真正物理删除前，需要继续确认：

- 是否还有前端按钮或页面直接调用这些接口。
- 是否有商品编辑表单依赖运费模板返回值做必填初始化。
- 是否有历史商品数据迁移、导入卡密或采集任务需要留存只读入口。
