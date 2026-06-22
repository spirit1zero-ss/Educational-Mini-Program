# CRMEB MVP 瘦身：商品详情优惠券响应收口审计

## 本轮目标

继续执行 MVP 软瘦身，只处理前台商品详情接口中的优惠券响应残留。MVP 模式下 `enable_coupon=false` 时，商品详情不再返回可领取优惠券列表；不删除优惠券服务、不修改订单逻辑、不影响商品详情、规格、库存、会员价、支付、佣金、签到和会员核心能力。

## 本轮改动

文件：

- `src/CRMEB/CRMEB-master/crmeb/app/services/product/product/StoreProductServices.php`

改动：

- 在 `productDetail()` 组装商品详情响应时复用现有 `mvp_enabled('enable_coupon', true)` 配置。
- 当 `enable_coupon=false` 时，不再调用 `StoreCouponIssueServices::getIssueCouponList()` 查询商品优惠券。
- 为保持响应结构稳定，MVP 模式下保留 `coupons` 字段但设置为空数组 `[]`。

## 未改动范围

- 未删除优惠券服务、Dao、Model、路由或数据库表。
- 未修改订单、支付、支付回调、二级分销、佣金、签到、会员。
- 未修改商品编辑、商品保存、SKU 优惠券字段和订单赠券逻辑。
- 未修改前端页面展示逻辑。

## 本地验证

已执行：

```powershell
cd src/CRMEB/CRMEB-master/crmeb
php -l app/services/product/product/StoreProductServices.php
docker exec -w /var/www/crmeb crmeb php think clear
curl.exe -i --max-time 20 http://127.0.0.1:8080/api/product/detail/1
curl.exe -i --max-time 20 http://127.0.0.1:8080/adminapi/marketing/coupon/released
```

实际结果：

- 容器内 `php -l app/services/product/product/StoreProductServices.php` 语法检查通过。
- `docker exec -w /var/www/crmeb crmeb php think clear` 返回 `Clear Successed`。
- `GET http://127.0.0.1:8080/api/product/detail/1` 返回 `HTTP/1.1 200 OK`，JSON `status:200`。
- 商品详情响应中 `coupons` 为 `[]`。
- `GET http://127.0.0.1:8080/adminapi/marketing/coupon/released` 返回 `{"status":400,"msg":"MVP module disabled"}`。

验证环境说明：

- 当前 `crmeb` 容器已挂载本地 `dev3` 项目目录到 `/var/www/crmeb`。
- 为避免本地挂载目录触发安装页跳转，已在本地验证环境添加 `public/install.lock`。

## 风险点

- 本轮只处理商品详情响应展示，不处理订单侧优惠券、商品编辑侧优惠券和历史 SKU 优惠券字段。
- 保留 `coupons` 空数组是为了降低前端兼容风险；如果后续确认前端不依赖该字段，可再评估是否彻底隐藏字段。
- 如果后续重新开启 `enable_coupon=true`，商品详情会恢复原有优惠券查询和响应。
