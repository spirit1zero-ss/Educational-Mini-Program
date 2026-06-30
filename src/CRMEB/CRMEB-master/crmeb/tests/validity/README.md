# 商品有效期改造 — 验证说明

把繁琐的商品种类（普通/卡密/优惠券/虚拟）改造为两种**有效期类型**：

- `validity_type=0` 长期有效商品
- `validity_type=1` 有限期商品
  - `expire_mode=1` 固定到期日（`valid_end_time` 时间戳，过期后全场**可见但不可购买**）
  - `expire_mode=2` 购买后 N 天（`valid_days`，按用户购买时间起算）
- `validity_name` 自定义类型名称，前端可传入覆盖默认名（已做 XSS 剥离 + 长度限制）

## 一键验证

Windows：双击 `verify_validity.bat`（或命令行运行）
Linux/Mac：`bash tests/validity/verify_validity.sh`

脚本会：
1. 对 3 个改动文件执行 `php -l` 语法校验；
2. 运行 `validity_logic_test.php`（行为 + 安全断言，失败则非 0 退出）。

## 数据库迁移

```
mysql -u USER -p DBNAME < upgrade/versions/20260626_product_validity_fields.sql
```
只执行 `-- up` 段的 `ALTER TABLE`；`-- down` 段用于回滚。

## 改动文件

- `app/services/product/product/StoreProductServices.php`
  新增 `normalizeValidity / getValidityName / isProductExpired / attachValidityInfo / assertProductPurchasable`；
  接入 `save()`、`productDetail()`、`getGoodsList()`、`getInfo()`。
- `app/services/order/StoreCartServices.php`
  `checkProductStock()` 增加过期不可购买拦截。
- `app/adminapi/controller/v1/product/StoreProduct.php`
  `save()` 接收 `validity_type / validity_name / expire_mode / valid_end_date / valid_end_time / valid_days`。

## 建议的运行时安全自测（需服务已启动 + 管理员 token）

1. **构造请求绕过前端**：直接 POST 保存接口，传 `validity_type=2`、或有限期但缺失日期/天数 → 应返回校验错误（被 `normalizeValidity` 拦截）。
2. **过期商品下单**：把某商品设为 `expire_mode=1` 且到期日设为过去，前端商品仍可见但 `cart_button=0`；调用加入购物车/立即购买接口 → 应返回「该商品已过期，无法购买」。
3. **XSS**：`validity_name` 传入 `<script>alert(1)</script>会员` → 落库后应为纯文本 `会员`（标签被剥离）。
4. **SQL 注入**：`validity_name` 传入 `'; DROP TABLE eb_store_product;--` → 经 ThinkPHP ORM 参数绑定原样存为字符串，不会执行。

> 注：自动化逻辑/安全断言已覆盖第 1、3、4 点及过期判断；第 2 点的端到端拦截建议在运行环境手测一次。

---

## 第二轮：分类收口为 VIP + 后台表单只显示 2 个有效期选项

目标：后台商品只保留一个分类 **VIP**，商品类型选择器只显示 **长期有效商品 / 有限期商品**，其余旧分类与旧种类（卡密/优惠券/虚拟）隐藏。后台新增/编辑商品页可直接看到生效。

### 改动文件
- `upgrade/versions/20260626_single_vip_category.sql` —— 隐藏其他分类、种子并显示唯一分类 VIP（数据保留可恢复）。
- `template/admin/src/pages/product/productAdd/components/BasicInfo.vue` —— 商品类型选择器改为 2 个有效期选项，并新增「失效方式 / 到期日期 / 有效天数 / 类型名称」子配置。
- `template/admin/src/pages/product/productAdd/index.vue` —— `formValidate` 增加有效期字段；`ensureValidityDefaults()` 归一化（兼容编辑回显与提交）。

> 旧的 `virtual_type` 种类选择器已不再渲染，且始终保持 `virtual_type=0`；分类下拉由后端 `cascaderList(is_show=1)` 数据驱动，隐藏其他分类后自然只剩 VIP。

### 操作步骤（按顺序）
1. **跑两个迁移**（有效期字段 + VIP 分类收口）：
   ```
   mysql -u USER -p DBNAME < upgrade/versions/20260626_product_validity_fields.sql   (仅 -- up 段, 见上文方式一单行命令)
   mysql -u USER -p DBNAME < upgrade/versions/20260626_single_vip_category.sql
   ```
   `single_vip_category.sql` 的 up 段是幂等的 UPDATE/INSERT，可直接整文件执行。
2. **构建并部署后台**：双击 `template/admin/build_deploy_admin.bat`
   （会执行 `npm run build` 并把产物部署到 `crmeb/public/admin`，原目录自动备份）。
3. **验证生效**：登录管理后台 → 商品 → 添加商品，应看到：
   - 「商品类型」只有两张卡片：**长期有效商品 / 有限期商品**；
   - 选「有限期商品」后出现「失效方式（固定到期日 / 购买后N天）」及对应的日期/天数输入；
   - 「商品分类」下拉只有 **VIP** 一个。
   - 保存后在「商品列表」编辑该商品，有效期配置应正确回显。

> 后台构建只能在你本地执行（生产构建耗时较长，超出沙箱单次执行限制）。Vue 源码已用文件工具核验结构完整、模板与脚本闭合正确。
