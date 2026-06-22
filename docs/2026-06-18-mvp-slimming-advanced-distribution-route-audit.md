# 2026-06-18 MVP 高级分销路由瘦身审计

## 本次目标

保留 MVP 必需的基础二级分销和佣金链路，同时拦截代理商、事业部、员工分佣、分销等级任务等高级分销入口。当前阶段不删除代码、不改佣金生成逻辑、不改支付回调闭环。

## 定位结果

| 项目 | 位置 | 结论 |
| --- | --- | --- |
| 基础分销绑定 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `user/spread` 需要保留，用于用户上级关系绑定 |
| 基础分销明细 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `spread/people`、`spread/order`、`spread/commission`、`spread/count`、`spread/banner` 需要保留 |
| 佣金中心 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `commission` 需要保留 |
| 高级代理商 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `agent/*` 属于代理商/员工分佣高级能力 |
| 事业部订单 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | `division/order` 属于事业部高级分销能力 |
| 分销等级任务 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v2.php` | `v2/agent/level_list`、`v2/agent/level_task_list` 属于高级分销展示 |

## 本次变更

- 新增 MVP 开关：
  - `enable_advanced_distribution=false`
- 在 `api_route_force_block_patterns.enable_advanced_distribution` 中增加：
  - `agent/`
  - `v2/agent/`
- 在 `api_route_block_patterns.enable_advanced_distribution` 中增加：
  - `division/order`

`agent/` 使用强制禁用优先级，是为了避免未来与基础分销白名单发生误匹配。基础 `spread/*` 和 `commission` 仍在白名单中保留。

## 保留边界

以下 MVP 核心链路不受本次变更影响：

- 支付成功后读取/绑定用户上级关系。
- 二级分销佣金生成。
- 用户佣金中心：`commission`。
- 推广用户、推广订单、佣金明细：`spread/*`。
- 邀请海报：`spread/banner`。
- 后台分销和佣金查看。

## Docker 验证

PHP 语法检查：

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

禁用接口抽测：

```bash
curl -i http://127.0.0.1:8080/api/agent/apply/info
curl -i http://127.0.0.1:8080/api/agent/get_staff_list
curl -i http://127.0.0.1:8080/api/v2/agent/level_list
curl -i -X POST http://127.0.0.1:8080/api/division/order
```

期望结果：

```json
{"status":400,"msg":"MVP module disabled"}
```

保留接口抽测：

```bash
curl -i http://127.0.0.1:8080/api/commission
curl -i http://127.0.0.1:8080/api/spread/count/1
curl -i http://127.0.0.1:8080/api/spread/commission/1
curl -i -X POST http://127.0.0.1:8080/api/user/spread
```

期望结果：

- 不返回 `MVP module disabled`。
- 未登录环境下可以返回 CRMEB 原有登录态错误。

## 风险点

- 代理商/事业部和基础二级分销共用部分用户字段，当前只做接口拦截，不做数据库或模型删除。
- `division/order` 属于事业部推广订单，不等同于基础 `spread/order`；基础推广订单继续保留。
- 如果后续要启用高级代理商或事业部，只需打开 `enable_advanced_distribution` 或缩小对应规则。
