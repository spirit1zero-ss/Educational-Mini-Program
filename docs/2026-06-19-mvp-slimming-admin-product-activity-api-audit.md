# 2026-06-19 MVP 瘦身：后台商品活动检测接口收口审计

## 范围

继续执行 MVP 软瘦身，不删除商品代码、不删除营销活动代码、不改商品保存逻辑、不改订单和支付链路。

本轮只处理后台商品接口中的一个非 MVP 活动残留：

- `GET /adminapi/product/product/check_activity/:id`

该接口用于检测商品是否已有营销活动开启。当前 MVP 模式下砍价、拼团、秒杀、预售、抽奖等活动能力均已禁用，因此后台不需要继续暴露这个活动检测接口。

## 本次调整

调整文件：

- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/product.php`

调整内容：

- 在 `enable_activity_status` 的接口拦截规则中增加 `product/product/check_activity`。
- 给后台商品路由组增加 `MvpRouteBlockMiddleware`。

商品路由组仍保留原有认证、权限和日志中间件。MVP 中间件只按配置规则拦截命中的禁用接口，不会整组关闭商品管理接口。

## 保留能力

本轮不影响：

- 后台商品列表、商品详情、商品新增和编辑。
- 商品分类、规格、属性规则、商品上下架。
- 商品库存、价格、训练营商品路径。
- 订单、支付、退款、佣金、签到和会员功能。

## 验证记录

已执行本地语法检查：

```powershell
php -l src/CRMEB/CRMEB-master/crmeb/config/mvp.php
php -l src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/product.php
```

结果：

- `config/mvp.php` 未发现语法错误。
- `app/adminapi/route/product.php` 未发现语法错误。

CRMEB 容器运行后建议补充接口抽测：

```powershell
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product/check_activity/1
```

预期：

- `GET /adminapi/product/product` 仍走原有后台认证或正常商品列表逻辑，不应返回 `MVP module disabled`。
- `GET /adminapi/product/product/check_activity/1` 在 `enable_activity_status=false` 时返回 `MVP module disabled`。

## 后续备注

后台商品路由里仍有商品采集、商品迁移、虚拟卡密导入、视频上传密钥、运费模板等能力。本轮没有处理这些接口，因为它们与商品管理、物流或运营配置存在混用，需要后续单独判断是否属于 MVP 保留能力。
