# 2026-06-18 MVP 移动端 DIY 公共接口瘦身审计

## 本次目标

补齐移动端公共 DIY 数据接口的 MVP 禁用防护。当前阶段不删除 DIY 代码、不删除路由文件、不改小程序页面结构，只在 `enable_page_diy=false` 时拦截非 MVP 的首页装修接口。

## 定位结果

| 项目 | 位置 | 结论 |
| --- | --- | --- |
| v1 DIY 公共接口 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php` | 存在 `diy/get_diy/[:id]` |
| v2 DIY 公共接口 | `src/CRMEB/CRMEB-master/crmeb/app/api/route/v2.php` | 存在 `diy/get_diy/[:name]`、`diy/get_version/[:name]`、`diy/get_store_status`、`diy/color_change/:name` |
| MVP API 防护 | `src/CRMEB/CRMEB-master/crmeb/app/api/middleware/MvpRouteBlockMiddleware.php` | 已挂载在 v1/v2 API 路由组 |
| MVP 配置 | `src/CRMEB/CRMEB-master/crmeb/config/mvp.php` | `enable_page_diy=false`，本次补齐公共 DIY 数据接口规则 |

## 本次变更

在 `api_route_block_patterns.enable_page_diy` 中补充：

- `diy/get_diy`
- `diy/get_version`
- `diy/get_store_status`

原有 `diy/color_change` 保持不变。

## 保留边界

以下能力不受本次变更影响：

- H5 MVP 首页固定入口。
- 训练营商品、商品详情、下单、微信支付、支付回调。
- 二级分销关系和佣金记录。
- 测评记录。
- 签到入口和签到展示：`diy/sign` 已在 API 白名单中保留。
- 会员中心、会员状态、会员权益。

## Docker 验证

PHP 语法检查：

```bash
docker exec -w /var/www/crmeb crmeb-local php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb-local php think clear
```

禁用接口抽测：

```bash
curl -i http://127.0.0.1:8080/api/diy/get_diy
curl -i http://127.0.0.1:8080/api/v2/diy/get_diy
curl -i http://127.0.0.1:8080/api/v2/diy/get_version
curl -i http://127.0.0.1:8080/api/v2/diy/get_store_status
curl -i http://127.0.0.1:8080/api/v2/diy/color_change/red
```

期望结果：

```json
{"status":400,"msg":"MVP module disabled"}
```

保留接口抽测：

```bash
curl -i http://127.0.0.1:8080/api/v2/diy/sign
curl -i http://127.0.0.1:8080/api/sign/config
curl -i http://127.0.0.1:8080/api/user/member/card/index
```

期望结果：

- 不返回 `MVP module disabled`。
- 未登录环境下可以返回 CRMEB 原有登录态错误。

## 风险点

- 如果旧版小程序首页仍强依赖 `diy/get_diy`，禁用后会返回 MVP 拦截结果；当前 MVP 目标是固定入口，不再依赖 DIY 装修首页。
- `diy/sign` 必须继续保留，因为签到页面可能依赖该接口。
- 真正删除 DIY 模块前，还需要排查 `template/uni-app/subpackage/diyComponents`、后台 `diy` 页面、主题模块和数据库装修数据。
