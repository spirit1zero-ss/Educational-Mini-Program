# 上线前临时隐藏范围记录 - 2026-07-07

> 2026-07-11 更新：本文记录的前端退休范围已经开始物理删除。当前删除清单、保留边界和验证结果见 `admin-surface-pruning-2026-07-11.md`。后端共享业务代码仍按本文的渐进策略保留。

## 目标

当前目标是先做出可上线版本，不直接大规模删除 CRMEB 原有模块代码。上线前仅做可回滚的隐藏和接口收口，后续维护期再按本文记录逐步慢删除多余内容。

## 本次策略

- 不物理删除商城、营销、PC、老 H5、文章资讯、外部开放接口等模块代码。
- 后台菜单通过数据库 `is_show` / `is_show_path` 隐藏。
- 后台接口通过 `RetiredAdminApiMiddleware` 返回 403。
- Nginx 对已废弃公开入口继续返回 404。
- 后台静态资源关闭长缓存，并用版本参数处理本次会员卡弹窗缓存问题。

## 隐藏的后台菜单范围

配置文件：`src/CRMEB/CRMEB-master/crmeb/config/retired.php`

数据库补丁：`src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-07-tighten-retired-admin-surface.sql`

主要隐藏范围：

- 商城商品：`/product`、`product/`、`store_product`、商品导入模板等。
- 订单/售后：`/order`、`store_order`、`refund`、发货、售后、核销相关商城订单功能。
- 营销：优惠券、砍价、拼团、秒杀、预售、积分商城、签到、抽奖、充值、直播。
- PC / APP / 公众号老入口：`/app`、`wechat/`、`wechat_qrcode`、小程序下载/CI/链接生成、PC 配置、APP 配置。
- 老 H5 / 页面装修：`pages`、`diy`、`theme`、`micro_page`、老移动商城页面。
- 文章资讯/客服：`cms`、`article`、`news`、`special`、`kefu`、`customer_service`、话术、反馈、自动回复。
- 物流/门店/配送/发票：运费模板、配送员、线下支付、到店自提、门店、店员、发票。
- 外部开放接口：`system_out_account`、`system_out_interface`。
- 开发/升级/文件工具：在线升级、跨版本升级、代码生成、系统文件、上传入口、视频上传、在线上传。

## 拦截的后台接口范围

中间件：`src/CRMEB/CRMEB-master/crmeb/app/adminapi/middleware/RetiredAdminApiMiddleware.php`

已挂载路由文件：

- `app/adminapi/route/marketing.php`
- `app/adminapi/route/app.php`
- `app/adminapi/route/file.php`
- `app/adminapi/route/export.php`
- `app/adminapi/route/system.php`

当前 403 拦截片段：

- `marketing/`
- `app/wechat`
- `app/wechat_qrcode`
- `app/routine/download`
- `app/routine/ci`
- `app/routine/scheme`
- `file/`
- `system/file`
- `system/write_md5`
- `system/upgrade`
- `system/package_download`
- `system/upgrade_download`
- `system/upgrade_progress`
- `system/cross_version`
- `system/rollback`
- `system/crud`
- `system/clear/`
- `system/replace_site_url`
- `export/userPoint`

## 明确保留的功能

- 小程序已使用 API：
  - `/api/miniapp/auth/login`
  - `/api/miniapp/mine/overview`
  - `/api/miniapp/referral/poster`
  - `/api/miniapp/referral/invites`
  - `/api/miniapp/referral/income`
  - `/api/miniapp/redeem-code/use`
  - `/api/miniapp/training-camp/member-plans`
  - `/api/miniapp/training-camp/member-order`
  - `/api/miniapp/training-camp/orders`
  - 教育评测记录保存接口
- 付费会员/卡密会员后台：
  - 会员系统从 CRMEB 默认的营销父级移动到用户父级。
  - 保留会员类型、卡密会员、会员记录、会员权益、会员配置。
  - 保留 `user/member...` 和 `export/member_card...` 接口。
- 后台登录、用户、分销、财务、教育、设置、系统基础能力。
- 支付回调、转账/通知等上线必须保留的服务端能力。

## 已处理的会员卡弹窗问题

问题：卡密会员“添加批次”后端已经要求 `expire_time`，但浏览器继续使用旧后台静态资源，弹窗里看不到“兑换截止”。

处理：

- 后台入口 `public/admin/index.html` 静态资源增加版本参数。
- 旧 `chunk-27e552c0.*.js` 也补上兑换截止时间字段，兼容已缓存旧入口的浏览器。
- Nginx `/admin/` 和 `/admin/index.html` 增加 `Clear-Site-Data: "cache"`。
- Nginx `/admin/system_static/` 从 30 天 immutable 缓存改为 no-cache。

## 回滚方式

恢复单个接口：

1. 从 `config/retired.php` 的 `admin_api_patterns` 删除对应片段。
2. 清 ThinkPHP 缓存。
3. 刷新后台页面。

恢复单个菜单：

1. 将对应 `eb_system_menus` 行的 `is_show` 和 `is_show_path` 改回 1。
2. 确认父级菜单也可见。
3. 清 Redis 和 ThinkPHP 缓存。

恢复整批隐藏：

1. 回滚 `2026-07-07-tighten-retired-admin-surface.sql` 对菜单的影响，或从备份库恢复菜单表。
2. 临时清空 `config/retired.php` 的隐藏片段。
3. 移除 `RetiredAdminApiMiddleware` 路由挂载。

## 后续慢删除顺序建议

1. 先删已被 Nginx 404 的公开入口和老页面包。
2. 再删已被后台菜单隐藏、且无小程序调用链的营销模块。
3. 再删商城商品、商城订单、售后、物流配送、门店自提等商城业务代码。
4. 再删 PC、老 H5、APP/公众号配置、页面装修、文章资讯、客服等后台页面和接口。
5. 最后删系统开发工具、在线升级、文件管理、外部开放接口等高风险管理入口。

每一步删除前先做：

- 搜索小程序和后台是否仍有调用。
- 保留一个可回滚提交。
- 删除后跑后台 PHP lint、关键接口 smoke test、小程序主流程测试。
