# 2026-06-18 MVP 线下支付与门店自提路由瘦身审计

## 本次目标

补齐移动端线下付款和门店列表接口的 MVP 禁用防护。当前阶段不删除代码、不修改订单状态机、不影响微信支付和普通订单创建。

## 定位结果

| 项目 | 位置 | 结论 |
| --- | --- | --- |
| 线下付款接口 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `order/offline/check/price`、`order/offline/create`、`order/offline/pay/type` 属于线下付款链路 |
| 门店列表接口 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `store_list` 属于门店/自提场景 |
| 普通订单接口 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `order/create`、`order/pay`、`order/detail`、`order/list` 必须保留 |
| MVP API 防护 | `src/CRMEB/CRMEB-master/crmeb/app/api/middleware/MvpRouteBlockMiddleware.php` | 已支持按配置拦截并记录日志 |

## 本次变更

- 新增 MVP 开关：
  - `enable_offline_payment=false`
  - `enable_store_pickup=false`
- 在 `api_route_block_patterns.enable_offline_payment` 中增加：
  - `order/offline/`
- 在 `api_route_block_patterns.enable_store_pickup` 中增加：
  - `store_list`

## 保留边界

以下 MVP 核心链路不受本次变更影响：

- 普通订单确认、创建、订单支付、订单详情、订单列表、确认收货。
- 微信支付发起和支付回调。
- 二级分销关系、佣金生成和佣金查看。
- 签到、会员、测评。
- 后台订单查看。

本次没有拦截 `order/check_shipping`，因为它可能参与订单确认页判断配送方式；真正删除门店自提前再做二次依赖排查。

## Docker 验证

PHP 语法检查：

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

禁用接口抽测：

```bash
curl -i http://127.0.0.1:8080/api/order/offline/pay/type
curl -i -X POST http://127.0.0.1:8080/api/order/offline/check/price
curl -i -X POST http://127.0.0.1:8080/api/order/offline/create
curl -i http://127.0.0.1:8080/api/store_list
```

期望结果：

```json
{"status":400,"msg":"MVP module disabled"}
```

保留接口抽测：

```bash
curl -i http://127.0.0.1:8080/api/order/list
curl -i http://127.0.0.1:8080/api/order/detail/test
curl -i -X POST http://127.0.0.1:8080/api/order/pay
curl -i http://127.0.0.1:8080/adminapi/order/info/1
```

期望结果：

- 不返回 `MVP module disabled`。
- 未登录环境下可以返回 CRMEB 原有登录态错误。

## 风险点

- 线下支付与到店自提可能和旧版订单确认 UI 有耦合；当前只拦截独立接口，不物理删除页面。
- `store_list` 被拦截后，门店选择页不可用；这符合当前 MVP 不做门店自提的边界。
- `order/check_shipping` 暂时保留，避免订单确认页依赖该接口时被误伤。
