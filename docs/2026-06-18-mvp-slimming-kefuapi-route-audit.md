# 2026-06-18 MVP 客服端 kefuapi 路由瘦身审计

## 本次目标

补齐客服独立 `kefuapi` 路由的 MVP 禁用防护。当前阶段仍然不物理删除客服代码、不删除路由文件、不改订单/支付/分销/签到/会员核心链路。

## 定位结果

| 项目 | 位置 | 结论 |
| --- | --- | --- |
| 客服端路由入口 | `src/CRMEB/CRMEB-master/crmeb/app/kefuapi/route/route.php` | 独立于 `api`、`adminapi`，原先只挂载跨域和客服鉴权 |
| MVP 配置 | `src/CRMEB/CRMEB-master/crmeb/config/mvp.php` | `enable_customer_service=false`，客服属于 P1 非 MVP 功能 |
| 新增中间件 | `src/CRMEB/CRMEB-master/crmeb/app/kefuapi/middleware/MvpRouteBlockMiddleware.php` | 根据 `kefuapi_route_block_patterns` 拦截禁用路由 |
| 日志位置 | `runtime/log/20260618.log` | 命中时记录 `[MVP] blocked kefuapi route` |

## 本次变更

- 新增 `app/kefuapi/middleware/MvpRouteBlockMiddleware.php`。
- 在 `app/kefuapi/route/route.php` 根路由组挂载 MVP 防护。
- 在 `config/mvp.php` 新增 `kefuapi_route_block_patterns`：
  - `login`
  - `key`
  - `scan`
  - `config`
  - `wechat`
  - `upload`
  - `user`
  - `order`
  - `product`
  - `service`
  - `tourist`

## 保留边界

以下 MVP 核心能力不受本次变更影响：

- 微信登录、用户、商品、商品详情、订单、微信支付、支付回调。
- 二级分销关系、佣金流水。
- 测评记录。
- 签到入口、签到记录、签到依赖的积分基础链路。
- 会员中心、会员状态、会员权益。
- 后台用户、订单、商品、测评、分销、佣金、签到、会员查看。

## Docker 验证

PHP 语法检查：

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php -l app/kefuapi/middleware/MvpRouteBlockMiddleware.php
docker exec -w /var/www/crmeb crmeb-local php -l app/kefuapi/route/route.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

接口抽测：

```bash
curl -i http://127.0.0.1:8080/kefuapi/config
curl -i http://127.0.0.1:8080/kefuapi/tourist/user
curl -i -X POST http://127.0.0.1:8080/kefuapi/login
curl -i -X POST http://127.0.0.1:8080/kefuapi/service/speechcraft
curl -i -X POST http://127.0.0.1:8080/kefuapi/upload
```

期望结果：

```json
{"status":400,"msg":"MVP module disabled"}
```

保留链路抽测：

```bash
curl -i http://127.0.0.1:8080/api/sign/config
curl -i http://127.0.0.1:8080/api/user/member/card/index
curl -i http://127.0.0.1:8080/adminapi/order/info/1
```

期望结果：

- 不返回 `MVP module disabled`。
- 未登录环境下允许返回 CRMEB 原有登录态错误，例如 `请登录` 或 `登录已过期`。

日志检查：

```bash
docker exec -w /var/www/crmeb crmeb-local sh -lc "grep -n '\\[MVP\\] blocked kefuapi route' runtime/log/20260618.log | tail -8"
```

本地已验证出现如下类型记录：

```text
[MVP] blocked kefuapi route: {"path":"config","switch":"enable_customer_service","pattern":"config$"}
[MVP] blocked kefuapi route: {"path":"tourist/user","switch":"enable_customer_service","pattern":"user/"}
[MVP] blocked kefuapi route: {"path":"login","switch":"enable_customer_service","pattern":"login$"}
```

## 风险点

- `kefuapi` 是独立应用路由，不能只依赖 `api` 或 `adminapi` 中间件覆盖。
- 当前是“禁用拦截”，不是物理删除；真正删除客服模块前，还需要排查前端 `api/kefu.js`、客服页面、Workerman/长连接配置和后台客服配置引用。
- `user/` 规则会覆盖 `tourist/user`，这是预期行为，因为游客客服也属于客服系统能力。
- 如果后续重新启用客服，只需打开 `enable_customer_service`，不需要恢复路由文件。
