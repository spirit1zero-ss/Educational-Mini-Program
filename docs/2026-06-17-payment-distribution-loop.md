# 2026-06-17 MVP 支付订单与分销佣金闭环说明

## 本次目标

检查并强化 CRMEB MVP 在微信支付成功后的订单与二级分销佣金闭环：

微信支付成功 -> 支付回调校验 -> 更新订单为已支付 -> 绑定或读取用户上级关系 -> 按两级分销规则生成佣金记录 -> 后台可查看佣金记录。

本次没有重写支付逻辑，也没有改变 CRMEB 原有订单状态机。改动只补充排查日志，并确认现有状态机中佣金生成发生在确认收货阶段。

## 支付回调入口

- 路由入口：`src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php`
- 路由：`Route::any('pay/notify/:type', 'v1.PayController/notify')`
- 控制器：`src/CRMEB/CRMEB-master/crmeb/app/api/controller/v1/PayController.php`
- 事件监听：`src/CRMEB/CRMEB-master/crmeb/app/listener/pay/NotifyListener.php`

新增日志：

- `mvp_pay_notify_received`
- `mvp_pay_notify_dispatch`

用于确认微信支付通知是否进入 CRMEB 事件链，并记录 `pay_type`、`attach`、`out_trade_no`、`transaction_id` 等关键字段。

## 订单状态更新位置

- 业务入口：`src/CRMEB/CRMEB-master/crmeb/app/services/pay/PayNotifyServices.php`
- 商品订单回调方法：`wechatProduct($order_id, $trade_no, $payType)`
- 订单支付成功处理：`src/CRMEB/CRMEB-master/crmeb/app/services/order/StoreOrderSuccessServices.php`
- 核心方法：`paySuccess(...)`

现有逻辑会：

- 根据 `order_id` 查询订单
- 已支付订单直接返回，保持幂等
- 未支付订单更新 `paid`、`pay_type`、`pay_time`、`trade_no`
- 触发 `OrderPaySuccessListener`

新增日志：

- `mvp_pay_product_notify_start`
- `mvp_pay_product_notify_order_missing`
- `mvp_pay_product_notify_already_paid`
- `mvp_pay_product_notify_finish`
- `mvp_pay_product_notify_error`
- `mvp_order_pay_success_update`
- `mvp_order_pay_success_event_dispatched`

## 分销关系读取位置

- 订单创建后 Job：`src/CRMEB/CRMEB-master/crmeb/app/jobs/OrderCreateAfterJob.php`
- 上级读取方法：`src/CRMEB/CRMEB-master/crmeb/app/services/user/UserServices.php`
- 核心方法：`getSpreadUid(...)`

CRMEB 在订单创建后预计算并写入：

- `spread_uid`
- `spread_two_uid`
- `one_brokerage`
- `two_brokerage`

新增日志：

- `mvp_order_brokerage_precomputed`

用于排查订单是否正确读取一级、二级上级关系，以及是否预计算佣金金额。

## 佣金生成位置

CRMEB 现有状态机不是在支付成功瞬间生成普通商品佣金记录，而是在确认收货阶段生成佣金。

- 确认收货服务：`src/CRMEB/CRMEB-master/crmeb/app/services/order/StoreOrderTakeServices.php`
- 一级佣金：`backOrderBrokerage(...)`
- 二级佣金：`backOrderBrokerageTwo(...)`
- 佣金流水写入：`src/CRMEB/CRMEB-master/crmeb/app/services/user/UserBrokerageServices.php`
- 核心方法：`income(...)`

新增日志：

- `mvp_order_take_brokerage_start`
- `mvp_order_brokerage_income_one`
- `mvp_order_brokerage_income_two`

用于确认订单确认收货后，一级、二级佣金是否计算、入账并生成流水。

## 后台查看位置

后台佣金列表路由：

- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/finance.php`
- `GET finance/commission_list`
- 控制器：`v1.finance.Finance/get_commission_list`

后台订单、用户、商品仍沿用 CRMEB 原有后台模块。

## Docker 本地验证结果

本次按 Docker 验证，不依赖宿主机 `php` 命令。

当前可用容器：

- `crmeb-local`
- 访问地址：`http://127.0.0.1:8080`

已通过容器内 PHP 语法检查：

```bash
docker exec -w /var/www/crmeb crmeb-local php -l app/listener/pay/NotifyListener.php
docker exec -w /var/www/crmeb crmeb-local php -l app/services/pay/PayNotifyServices.php
docker exec -w /var/www/crmeb crmeb-local php -l app/services/order/StoreOrderSuccessServices.php
docker exec -w /var/www/crmeb crmeb-local php -l app/services/order/StoreOrderTakeServices.php
docker exec -w /var/www/crmeb crmeb-local php -l app/jobs/OrderCreateAfterJob.php
```

结果均为：

```text
No syntax errors detected
```

服务连通性：

```bash
docker exec crmeb-local bash -lc "mysqladmin -uroot -p123456 ping"
docker exec crmeb-local bash -lc "redis-cli -a 123456 ping"
```

结果：

- MySQL：`mysqld is alive`
- Redis：`PONG`

后台动态接口验证：

```bash
curl -i http://127.0.0.1:8080/adminapi/auth
```

未登录状态返回 `401 登录已过期`，属于预期结果，说明动态接口可达。

## 本地模拟测试方法

1. 启动一体化容器：

```bash
docker start crmeb-local
```

2. 如动态接口超时，先清理 ThinkPHP 缓存：

```bash
docker exec -w /var/www/crmeb crmeb-local php think clear
```

3. 验证后台动态接口：

```bash
curl -i http://127.0.0.1:8080/adminapi/auth
```

4. 创建订单并发起微信支付：

- 小程序进入训练营商品详情
- 创建订单
- 发起微信支付
- 支付成功后等待微信真实回调

5. 查看日志关键字：

```bash
docker exec crmeb-local bash -lc "grep -n 'mvp_pay_notify\|mvp_order_pay_success\|mvp_order_brokerage' /var/www/crmeb/runtime/log/20260617.log /var/www/crmeb/runtime/log/20260617_error.log 2>/dev/null | tail -80"
```

6. 确认收货后检查佣金：

- 后台订单列表确认订单状态
- 后台财务佣金列表查看佣金记录
- 日志查看 `mvp_order_brokerage_income_one` 与 `mvp_order_brokerage_income_two`

## 风险点

- 普通 `curl POST /api/pay/notify/wechat` 不能模拟真实微信支付回调；缺少微信签名与有效通知报文时会卡在 SDK 校验/解析层。
- CRMEB 普通商品佣金记录按原状态机在确认收货阶段生成，不是在支付成功瞬间生成。
- 仓库自带 `help/docker/docker-compose.yml` 是分离式容器，当前 `.env` 使用 `127.0.0.1`，在 `crmeb_php` 容器中会连接不到独立的 MySQL/Redis。当前本地验证应优先使用一体化 `crmeb-local` 容器，或调整 compose 环境变量和 `.env`。
- `runtime/`、`install.lock`、Docker MySQL 数据、日志文件均为本地运行产物，不应提交到 GitHub。
- 今天只增强日志和验收路径，没有修改支付网关、订单状态流转和佣金生成规则。

