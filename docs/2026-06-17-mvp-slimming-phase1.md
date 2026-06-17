# 2026-06-17 CRMEB MVP 瘦身第一阶段执行记录

## 目标

在不删除业务代码、不改支付、不破坏订单状态机的前提下，先完成 MVP 第一阶段瘦身：

- 保留用户、商品、订单、微信支付、支付回调、二级分销、佣金、测评、签到、会员。
- 隐藏 H5/小程序和后台中非 MVP 的 P1 入口。
- 对已禁用模块的后台和移动端接口增加轻量拦截。
- 增加日志，方便本地排查误触发的禁用模块接口。

## 本阶段不做

- 不物理删除 PHP 控制器、服务、模型、数据库表。
- 不删除 CRMEB 官方 vendor、install、upgrade 和核心框架目录。
- 不重写支付网关、支付回调或订单状态机。
- 不把签到、会员、积分基础流水、二级分销和佣金链路列入删除范围。

## 保留清单

| 模块 | 当前动作 | 说明 |
| --- | --- | --- |
| 微信登录 | 保留 | 小程序登录链路继续走 CRMEB 原逻辑。 |
| 商品/商品详情 | 保留 | 训练营商品、商品详情、商品列表接口不拦截。 |
| 订单/支付/支付回调 | 保留 | 不改订单创建、支付发起、`pay/notify` 回调。 |
| 二级分销/佣金 | 保留 | 基础 spread、commission、后台佣金查看保留。 |
| 测评记录 | 保留 | `education/assessment_records` 保留。 |
| 签到 | 保留 | 签到入口、签到接口、积分基础记录保留。 |
| 会员 | 保留 | 会员中心、会员状态、会员权益相关入口和接口保留。 |

## 前端入口隐藏

| 子系统 | 文件 | 动作 |
| --- | --- | --- |
| 小程序/H5 MVP 配置 | `src/CRMEB/CRMEB-master/template/uni-app/config/mvp.js` | 隐藏优惠券、预售、抽奖、客服、CMS/文章、短视频等 P1 链接和 DIY 组件；签到、会员加入保留组件。 |
| 小程序/H5 菜单组件 | `src/CRMEB/CRMEB-master/template/uni-app/subpackage/diyComponents/menus.vue` | 菜单渲染和点击跳转前过滤 MVP 禁用链接。 |
| 小程序/H5 客服入口 | `components/kefuIcon/index.vue`、`subpackage/diyComponents/customerService.vue`、`utils/index.js` | MVP 模式隐藏客服浮窗、客服组件，并阻止客服跳转。 |
| 后台营销路由 | `src/CRMEB/CRMEB-master/template/admin/src/router/modules/marketing.js` | 只保留签到、会员配置、积分基础记录相关路由。 |
| 后台外部页面 | `src/CRMEB/CRMEB-master/template/admin/src/router/routers.js` | 隐藏客服相关 frameOut 路由，保留登录和订单打印。 |

## 后端接口拦截

| 子系统 | 文件 | 动作 |
| --- | --- | --- |
| MVP 配置 | `src/CRMEB/CRMEB-master/crmeb/config/mvp.php` | 增加 `admin_route_allow_patterns`、`admin_route_block_patterns`、`api_route_allow_patterns`、`api_route_block_patterns`。 |
| 后台拦截 | `src/CRMEB/CRMEB-master/crmeb/app/adminapi/middleware/MvpRouteBlockMiddleware.php` | 禁用模块后台接口返回 `MVP module disabled`。 |
| 移动端拦截 | `src/CRMEB/CRMEB-master/crmeb/app/api/middleware/MvpRouteBlockMiddleware.php` | 禁用模块移动端接口返回 `MVP module disabled`。 |
| 后台路由挂载 | `adminapi/route/app.php`、`cms.php`、`diy.php`、`live.php`、`marketing.php` | 在鉴权前挂载 MVP 拦截中间件，便于无 token 本地排查。 |
| 移动端路由挂载 | `app/api/route/v1.php`、`v2.php` | 在授权大组中、鉴权前挂载 MVP 拦截中间件。 |

## 当前禁用开关

| 开关 | 默认值 | 覆盖模块 |
| --- | --- | --- |
| `enable_coupon` | `false` | 优惠券领取、列表、订单优惠券。 |
| `enable_bargain` | `false` | 砍价。 |
| `enable_combination` | `false` | 拼团。 |
| `enable_seckill` | `false` | 秒杀。 |
| `enable_presell` | `false` | 预售/advance。 |
| `enable_points` | `false` | 积分商城玩法，不包含签到积分基础流水。 |
| `enable_recharge` | `false` | 充值。 |
| `enable_live` | `false` | 小程序直播。 |
| `enable_lottery` | `false` | 抽奖。 |
| `enable_customer_service` | `false` | 客服。 |
| `enable_cms` | `false` | CMS/文章后台。 |
| `enable_app_admin` | `false` | 应用后台管理。 |
| `enable_page_diy` | `false` | 后台 DIY 页面和移动端换色接口。 |
| `enable_invoice` | `false` | 发票。 |

## 日志

命中禁用接口时写入 ThinkPHP 日志：

- 后台：`[MVP] blocked admin route`
- 移动端：`[MVP] blocked api route`

日志字段包含：

- `path`
- `switch`
- `pattern`

## 本地验证命令

已执行或建议执行：

```bash
git diff --check
```

Docker PHP 语法检查：

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php -l app/adminapi/middleware/MvpRouteBlockMiddleware.php
docker exec -w /var/www/crmeb crmeb-local php -l app/api/middleware/MvpRouteBlockMiddleware.php
docker exec -w /var/www/crmeb crmeb-local php -l app/api/route/v1.php
docker exec -w /var/www/crmeb crmeb-local php -l app/api/route/v2.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

前端构建：

```bash
npm run build
cd src/CRMEB/CRMEB-master/template/admin
npm run build
cd ../uni-app
npm run build:mp-weixin
```

## HTTP 抽测路径

Docker 服务稳定后，用以下路径抽测：

应被拦截：

```bash
curl http://127.0.0.1:8080/api/coupons
curl http://127.0.0.1:8080/api/v2/coupons
curl http://127.0.0.1:8080/api/v2/lottery/record
curl http://127.0.0.1:8080/adminapi/marketing/coupon
curl http://127.0.0.1:8080/adminapi/cms/article
```

应继续可达或进入原有鉴权/业务逻辑：

```bash
curl http://127.0.0.1:8080/api/sign/config
curl http://127.0.0.1:8080/api/product/detail/1
curl http://127.0.0.1:8080/api/v2/diy/sign
curl http://127.0.0.1:8080/adminapi/marketing/sign/rewards
curl http://127.0.0.1:8080/adminapi/member_config
```

## 当前风险

- 本地 `crmeb-local` 容器内 MySQL 反复退出重启，HTTP 接口抽测出现超时；需要先恢复 Docker/MySQL 稳定性后才能确认运行时行为。
- `api_route_block_patterns` 是 path pattern 拦截，后续如果发现误伤，可以优先在 `api_route_allow_patterns` 加白名单。
- 积分商城玩法已禁用，但签到依赖积分账户、积分流水、积分展示，后续不能直接删除积分底层能力。
- 分销不能整体删除，只能拆分基础二级分销/佣金与高级代理商/事业部。
- 当前仍是第一阶段轻瘦身，真正物理删除文件前必须重新跑完整 MVP 验收清单。

## 2026-06-17 运行时复测补充

容器 `crmeb-local` 后续恢复到稳定运行状态，MySQL 进程已可持续运行。清理 ThinkPHP 缓存后复测如下：

已确认被 MVP 拦截：

| 路径 | 结果 |
| --- | --- |
| `/api/coupons` | `{"status":400,"msg":"MVP module disabled"}` |
| `/api/v2/coupons` | `{"status":400,"msg":"MVP module disabled"}` |
| `/api/v2/lottery/record` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/marketing/coupon/released` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/marketing/bargain` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/marketing/lottery/list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/diy/get_list` | `{"status":400,"msg":"MVP module disabled"}` |
| `/adminapi/cms/cms` | `{"status":400,"msg":"MVP module disabled"}` |

已确认未被 MVP 拦截，进入原鉴权逻辑：

| 路径 | 结果 |
| --- | --- |
| `/api/sign/config` | `{"status":401,"msg":"请登录"}` |
| `/api/user/member/card/index` | `{"status":401,"msg":"请登录"}` |
| `POST /api/education/assessment_records` | `{"status":401,"msg":"请登录"}` |
| `/adminapi/marketing/sign/rewards` | `{"status":401,"msg":"登录已过期,请重新登录","data":[]}` |
| `/adminapi/marketing/integral` | `{"status":401,"msg":"登录已过期,请重新登录","data":[]}` |

已修复并确认恢复：

| 路径 | 结果 |
| --- | --- |
| `/api/index` | `{"status":200,"msg":"success",...}` |
| `/api/products` | `{"status":200,"msg":"success",...}` |
| `/api/category` | `{"status":200,"msg":"success",...}` |

修复说明：

- `/api/index` 和 `/api/products` 超时来自商品列表仍在查询已禁用的营销活动和优惠券标记。
- MVP 模式下，当优惠券、砍价、拼团、秒杀均禁用时，商品服务跳过这些活动标记查询，只返回普通商品数据。
- 该修复不影响商品详情、订单、支付、签到、会员、测评、分销佣金链路。

仍需后续排查：

- `/api/education/assessment_records` 已用 `POST` 确认进入原鉴权；完整保存仍需携带登录态和测评 payload 回归。
