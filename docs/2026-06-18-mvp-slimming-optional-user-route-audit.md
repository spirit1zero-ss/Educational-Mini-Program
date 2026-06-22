# 2026-06-18 MVP 用户侧可选功能路由瘦身审计

## 本次目标

补齐移动端用户侧可选功能的 MVP 禁用防护。当前阶段不删除代码、不改订单主链路、不改地址和售后退款能力。

## 定位结果

| 项目 | 位置 | 结论 |
| --- | --- | --- |
| 收藏 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `collect/*` 非 MVP 核心能力 |
| 浏览/访问记录 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `user/visit_list`、`user/visit`、`user/set_visit` 非 MVP 核心能力 |
| 分享记录 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `user/share`、`user/share/words` 非 MVP 核心能力 |
| 站内信 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `user/message_system/*` 非 MVP 核心能力 |
| 用户注销 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `user_cancel` 非 MVP 验收能力 |
| 代付/礼物 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `order/friend_detail`、`order/receive_gift`、`order/gift_detail` 非 MVP 支付链路 |
| 余额统计 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `user/balance` 非 MVP 核心查看能力 |

## 本次变更

- 新增 MVP 开关：
  - `enable_optional_user_features=false`
- 在 `api_route_block_patterns.enable_optional_user_features` 中增加：
  - `collect/`
  - `user/visit`
  - `user/set_visit`
  - `user/share`
  - `user/message_system`
  - `user_cancel`
  - `order/friend_detail`
  - `order/receive_gift`
  - `order/gift_detail`
  - `user/balance`

## 保留边界

以下能力不受本次变更影响：

- 微信登录、用户信息、训练营商品、商品详情。
- 普通订单确认、创建、支付、详情、列表、确认收货。
- 微信支付和支付回调。
- 地址能力：暂时保留，避免影响实物订单确认页。
- 售后退款能力：暂时保留，避免影响订单状态机和售后流程。
- 二级分销、佣金、签到、会员、测评。

## Docker 验证

PHP 语法检查：

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

禁用接口抽测：

```bash
curl -i http://127.0.0.1:8080/api/collect/user
curl -i http://127.0.0.1:8080/api/user/visit_list
curl -i -X POST http://127.0.0.1:8080/api/user/set_visit
curl -i -X POST http://127.0.0.1:8080/api/user/share
curl -i http://127.0.0.1:8080/api/user/message_system/list
curl -i http://127.0.0.1:8080/api/user_cancel
curl -i http://127.0.0.1:8080/api/order/friend_detail
curl -i http://127.0.0.1:8080/api/order/gift_detail/test
curl -i http://127.0.0.1:8080/api/user/balance
```

期望结果：

```json
{"status":400,"msg":"MVP module disabled"}
```

保留接口抽测：

```bash
curl -i http://127.0.0.1:8080/api/user
curl -i http://127.0.0.1:8080/api/userinfo
curl -i http://127.0.0.1:8080/api/order/list
curl -i http://127.0.0.1:8080/api/order/detail/test
curl -i -X POST http://127.0.0.1:8080/api/order/pay
curl -i http://127.0.0.1:8080/api/sign/config
curl -i http://127.0.0.1:8080/api/user/member/card/index
```

期望结果：

- 不返回 `MVP module disabled`。
- 未登录环境下可以返回 CRMEB 原有登录态错误。

## 风险点

- 收藏按钮、浏览记录页、站内信页若仍有前端入口，会收到 MVP 禁用响应；下一阶段需要继续隐藏前端入口。
- `user/balance` 可能被旧用户中心用于展示余额，当前 MVP 不验收余额能力；如界面仍展示余额，应在前端入口阶段同步隐藏。
- 地址和售后退款本次不拦截，后续必须单独做依赖排查。
