# 2026-06-19 MVP 后台商品扩展后端物理删除记录

## 本轮目标

在前端商品采集和商品迁移代码已删除后，本轮继续删除后台商品扩展的后端可调用实现。删除范围限定在商品采集和商品迁移，不处理仍需单独评估的运费模板、视频上传密钥和虚拟卡密导入。

## 已删除路由

从 `app/adminapi/route/product.php` 删除：

- `GET /adminapi/product/product_export`
- `POST /adminapi/product/product_import`
- `POST /adminapi/product/crawl`
- `GET /adminapi/product/copy_config`
- `POST /adminapi/product/copy`
- `POST /adminapi/product/crawl/save`

## 已删除控制器

- 删除 `app/adminapi/controller/v1/product/CopyTaobao.php`
  - 原用途：商品采集配置、复制商品、保存采集商品。
- 从 `app/adminapi/controller/v1/product/StoreProduct.php` 删除：
  - `productExport`
  - `productImport`

## 已删除服务方法

- 从 `app/services/product/product/CopyTaobaoServices.php` 删除：
  - `copyProduct`
- 从 `app/services/product/product/StoreProductServices.php` 删除：
  - `productExportList`
  - `productImport`

## 本轮保留

- `CopyTaobaoServices` 文件整体仍保留。
  - 原因：`ProductCopyJob`、`StoreProductServices`、`SystemAttachmentServices` 仍复用其中的远程图片下载能力，例如 `downloadImage`、`downloadCopyImage`。
- 后台权限和升级记录暂未清理。
  - 原因：`UpgradeController`、菜单/权限记录需要单独梳理，避免影响安装或升级流程。
- `product/product/get_template`
- `product/product/get_temp_keys`
- `product/product/import_card`
  - 原因：这些属于运费模板、视频密钥、虚拟卡密导入，已被 MVP 拦截或隐藏，但仍需单独确认跨模块引用后再删。

## 验证记录

本轮已执行：

```powershell
php -l src/CRMEB/CRMEB-master/crmeb/config/mvp.php
php -l src/CRMEB/CRMEB-master/crmeb/app/services/product/product/CopyTaobaoServices.php
php -l src/CRMEB/CRMEB-master/crmeb/app/services/product/product/StoreProductServices.php
php -l src/CRMEB/CRMEB-master/crmeb/app/adminapi/controller/v1/product/StoreProduct.php
php -l src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/product.php
```

结果均为无语法错误。

## 残留说明

当前搜索仍会命中：

- `CopyTaobaoServices`
  - 这是远程图片下载能力的复用类，本轮保留。
- `UpgradeController` 中的旧文件校验和菜单/权限插入记录。
  - 属于升级/权限数据清理范围，下一轮单独处理。
- `config/mvp.php` 中的菜单隐藏标识。
  - 用于继续隐藏数据库里可能存在的权限菜单，待权限记录清理后再删。

## 下一轮建议

下一轮建议进入权限和升级记录清理：

- 清理 `UpgradeController` 中商品采集、迁移相关文件校验和菜单权限插入记录。
- 继续清理 `config/mvp.php` 中已无路由对应的商品采集/迁移菜单隐藏标识。
- 再单独评估运费模板、视频上传密钥、虚拟卡密导入的后端实现是否可以删除。
