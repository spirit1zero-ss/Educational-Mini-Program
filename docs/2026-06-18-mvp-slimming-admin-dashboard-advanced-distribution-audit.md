# CRMEB MVP 瘦身：后台首页与高级分销入口收口审计

日期：2026-06-18

## 目标

继续执行 MVP 软瘦身，不删除代码、不重写路由体系、不影响基础二级分销和佣金查看。

本阶段聚焦后台前端仍可见的非 MVP 入口：

- 后台首页快捷入口中的 CMS/文章
- 后台首页快捷入口中的优惠券
- 后台静态路由中的事业部/代理商高级分销模块

## 本次调整

### 后台 MVP 配置

位置：

- `src/CRMEB/CRMEB-master/template/admin/src/config/mvp.js`

处理：

- 新增 `isMvpAdminLinkVisible(link)`。
- MVP 模式下隐藏后台首页快捷入口里的：
  - `/cms/`
  - `/marketing/store_coupon`
  - `/marketing/coupon`

### 后台首页快捷入口

位置：

- `src/CRMEB/CRMEB-master/template/admin/src/pages/index/components/gridMenu.vue`

处理：

- CMS/文章快捷入口按 MVP 规则隐藏。
- 优惠券快捷入口按 MVP 规则隐藏。
- 用户、系统设置、商品、订单、基础分销入口保留。

### 后台静态路由

位置：

- `src/CRMEB/CRMEB-master/template/admin/src/router/routers.js`

处理：

- MVP 模式下不挂载 `division` 静态路由。
- `agent` 基础分销路由保留，避免影响二级分销和佣金查看。

### 后端 MVP 配置补齐

位置：

- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/agent.php`

处理：

- 后台菜单隐藏规则补充 `enable_advanced_distribution`：
  - `division`
  - `agent-division`
- 后台接口拦截规则补充：
  - `agent/division`
- 后台 `agent` 路由组接入现有 `MvpRouteBlockMiddleware`，只拦截 `agent/division` 高级分销接口，保留基础二级分销接口。

## 保留能力

本次不影响：

- 后台用户查看
- 后台商品查看
- 后台订单查看
- 基础二级分销
- 佣金记录查看
- 签到
- 会员
- 微信支付和支付回调

## 本地验证路径

后台构建：

```bash
cd src/CRMEB/CRMEB-master/template/admin
npm run build
```

Docker 后端抽测：

```bash
docker exec -w /var/www/crmeb crmeb-local php think clear
curl.exe -i --max-time 20 http://127.0.0.1:8080/adminapi/agent/division/list
```

后台浏览器路径：

- `http://127.0.0.1:8080/admin`
- 登录后查看后台首页快捷入口
- 确认 CMS/文章、优惠券快捷入口不显示
- 确认用户、商品、订单、基础分销入口仍保留

## 风险点

- 基础分销与高级事业部/代理商共享 `agent` 命名空间，不能整体删除 `agent`。
- 真正物理删除前，需要继续拆分基础二级分销接口和 `agent/division` 高级分销接口。
- 后台菜单还可能由后端权限菜单动态返回，因此本次同时补了前端静态路由和后端 MVP 菜单/接口规则。
