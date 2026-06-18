# 2026-06-18 MVP 移动端商家管理路由瘦身审计

## 本次目标

补齐移动端商家/店员管理接口的 MVP 禁用防护。当前阶段不删除路由、不删除控制器、不改后台 `adminapi` 核心查看能力，只拦截移动端 `api` 下的商家管理入口。

## 定位结果

| 项目 | 位置 | 结论 |
| --- | --- | --- |
| 移动端商家管理入口 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `admin/order/*`、`admin/manage/*`、`order/order_verific` 在同一移动端管理路由组 |
| 原有中间件 | `AllowOriginMiddleware`、`StationOpenMiddleware`、`AuthTokenMiddleware`、`CustomerMiddleware` | 原先没有挂 `MvpRouteBlockMiddleware` |
| MVP API 防护 | `src/CRMEB/CRMEB-master/crmeb/app/api/middleware/MvpRouteBlockMiddleware.php` | 已支持按配置拦截并记录日志 |
| MVP 配置 | `src/CRMEB/CRMEB-master/crmeb/config/mvp.php` | `enable_app_admin=false`、`enable_complex_logistics=false` |

## 本次变更

- 在移动端商家管理路由组挂载 `\app\api\middleware\MvpRouteBlockMiddleware::class`。
- 在 `api_route_force_block_patterns.enable_app_admin` 中增加：
  - `admin/`
- 在 `api_route_block_patterns.enable_complex_logistics` 中增加：
  - `order/order_verific`

`admin/` 使用强制禁用优先级，是因为普通用户订单白名单包含 `order/list`、`order/detail` 等模式，移动端商家管理中的 `admin/order/list`、`admin/order/detail` 也包含这些片段，必须先于白名单判断。

## 保留边界

以下 MVP 核心链路不受本次变更影响：

- 普通用户创建订单、订单支付、订单详情、订单列表、确认收货。
- 微信支付和支付回调。
- 后台 `adminapi` 用户、订单、商品、测评、分销、佣金、签到、会员查看。
- 二级分销关系和佣金记录。
- 签到和会员功能。

## Docker 验证

PHP 语法检查：

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php -l app/api/route/v1.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

禁用接口抽测：

```bash
curl -i http://127.0.0.1:8080/api/admin/order/list
curl -i http://127.0.0.1:8080/api/admin/manage/statistics
curl -i -X POST http://127.0.0.1:8080/api/order/order_verific
```

期望结果：

```json
{"status":400,"msg":"MVP module disabled"}
```

保留接口抽测：

```bash
curl -i http://127.0.0.1:8080/api/order/list
curl -i http://127.0.0.1:8080/api/order/detail/test
curl -i http://127.0.0.1:8080/adminapi/order/info/1
curl -i http://127.0.0.1:8080/api/sign/config
curl -i http://127.0.0.1:8080/api/user/member/card/index
```

期望结果：

- 不返回 `MVP module disabled`。
- 未登录环境下可以返回 CRMEB 原有登录态错误。

## 风险点

- 这是移动端商家/店员管理能力，不是 PC 后台 `adminapi`；后台核心查看能力仍然保留。
- `order/order_verific` 属于核销能力，当前 MVP 暂不需要，且与门店/线下场景耦合，先拦截、后续再决定是否物理删除。
- 如果后续需要移动端店员发货或核销，只需打开对应开关或缩小 `admin/` 拦截范围。
