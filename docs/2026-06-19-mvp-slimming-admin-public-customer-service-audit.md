# 2026-06-19 MVP 瘦身：后台公共客服接口收口审计

## 范围

继续执行 MVP 软瘦身，不删除文件、路由定义、控制器、服务、模型、数据库表或前端页面。

本轮只收口一个后台公共接口残留：

- `GET /adminapi/get_workerman_url`

该接口用于获取客服长连接相关数据。当前 MVP 模式下客服能力已禁用，因此该接口也应进入统一拦截范围。

## 本次调整

调整文件：

- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/route.php`

调整内容：

- 在 `enable_customer_service` 的后台路由拦截规则中增加 `get_workerman_url`。
- 给后台未登录公共路由组增加 `MvpRouteBlockMiddleware`。

该中间件按配置规则匹配路径，因此后台登录、登录信息、验证码、扫码上传、后台自定义 JS 等公共基础入口不会被拦截；只有命中已禁用 MVP 模块规则的接口会返回 `MVP module disabled`。

## 保留能力

本轮不影响：

- 后台登录。
- 后台验证码和登录信息。
- 后台菜单加载。
- 商品、订单、支付、教育、签到、会员和基础分销链路。
- 现有客服源码、控制器、页面和 kefu API 文件。

## 验证记录

已执行本地语法检查：

```powershell
php -l src/CRMEB/CRMEB-master/crmeb/config/mvp.php
php -l src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/route.php
```

结果：

- `config/mvp.php` 未发现语法错误。
- `app/adminapi/route/route.php` 未发现语法错误。

CRMEB 容器运行后建议补充接口抽测：

```powershell
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/login/info
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/get_workerman_url
```

预期：

- `GET /adminapi/login/info` 仍可访问。
- `GET /adminapi/get_workerman_url` 在 `enable_customer_service=false` 时返回 `MVP module disabled`。

## 后续备注

更大的 `serve` 路由组仍包含一号通、短信和电子面单相关接口。本轮没有处理它，因为其中短信配置可能属于运营保留能力，需要单独逐条判断后再决定是否拦截。
