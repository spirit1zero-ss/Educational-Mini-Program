# 2026-06-19 MVP 瘦身预删除交接文档

## 文档目的

本文记录 MVP 瘦身进入物理删除前的边界。当前仍处于软瘦身阶段：代码、表、路由、控制器、服务和前端页面先保留，通过菜单隐藏、前端入口隐藏、配置开关和路由中间件完成 MVP 模式下的禁用。

在完成本文的验证门槛前，不要物理删除文件、数据库表、路由定义、控制器、服务、模型或前端页面。

## 当前 MVP 基线

MVP 模式由以下配置启用：

- `src/CRMEB/CRMEB-master/crmeb/config/mvp.php`
- `src/CRMEB/CRMEB-master/template/uni-app/config/mvp.js`
- `src/CRMEB/CRMEB-master/template/admin/src/config/mvp.js`

当前保留的主范围：

- 登录与用户身份。
- 商品列表、商品详情、后台商品核心管理。
- 购物车、下单、订单列表和详情、订单支付、支付回调。
- 微信支付与支付通知回调。
- 基础二级分销、推广关系、佣金展示与佣金记录。
- 训练营商品路径。
- 测评记录。
- 签到。
- 会员等级、会员卡相关功能。
- 后台核心用户、商品、订单、佣金财务、教育、会员配置视图。

## 必须保留

以下能力进入物理删除阶段时仍必须保持可用：

- 小程序登录：
  - 微信登录页面和授权接口。
  - CRMEB 授权 token 流程。
- 商品：
  - `GET /api/products`
  - `GET /api/product/detail/:id`
  - PC 商品列表，例如 `GET /api/pc/get_products`
  - MVP 模式下商品详情继续返回 `coupons: []`，不能失败。
- 订单与支付：
  - 下单、支付、订单详情、订单列表、确认收货。
  - `pay/notify` 回调。
  - 微信支付配置与回调处理。
- 分销与佣金：
  - 基础 `spread` 路由与佣金路由。
  - 后台财务佣金列表。
  - 不删除基础 `spread`、`brokerage` 或当前保留的佣金数据路径。
- 测评：
  - `POST /api/education/assessment_records`
  - 后台教育测评记录列表和详情。
- 签到与积分记录：
  - 签到入口和签到路由族继续保留。
  - 签到使用的基础积分记录继续保留。
  - 积分商城禁用，但积分记录暂不作为删除目标。
- 会员：
  - 用户会员页面与后台会员配置。
  - 用户等级和会员卡后台页面。
- 后台基础能力：
  - 后台登录和首页框架。
  - 用户列表和详情、商品列表和编辑、订单列表和详情、佣金财务、教育、系统基础设置。

## 已隐藏或软禁用

MVP 模式下以下能力已从菜单、前端路由、DIY 组件、页面入口或接口侧隐藏或拦截：

- 优惠券：
  - 小程序/H5 优惠券入口和 DIY 优惠券组件。
  - 后台优惠券路由和商品/用户详情中的优惠券标签。
  - 商品详情仍返回 `coupons: []`。
- 营销活动：
  - 砍价、拼团、秒杀、预售、抽奖。
  - 后台营销路由中除签到、积分记录、会员配置外的非保留路由。
  - 后台商品活动检测接口 `product/product/check_activity` 已纳入路由拦截。
- 客服：
  - 小程序/H5 客服悬浮入口和 DIY 组件。
  - 后台客服菜单。
  - 后台公共接口 `get_workerman_url` 已纳入路由拦截。
  - Kefu API 已整体加 MVP 拦截。
- 直播和短视频：
  - 小程序直播/视频 DIY 组件和直播列表直连请求。
  - 后台直播路由。
- CMS/新闻：
  - 后台 CMS、文章、新闻入口。
  - 移动端文章路由。
  - PC `get_news_*` 路由已拦截。
- DIY/页面装修：
  - 后台 DIY、主题、页面装修路由。
  - 公共 DIY 数据接口已拦截，保留签到使用的 DIY 数据。
- 线下和门店自提：
  - 线下支付。
  - 门店列表、门店员工、自提、核销订单。
- 可选用户功能：
  - 余额中心、收藏列表、浏览记录、分享、系统消息、注销、礼物/收礼、好友代付、用户财务导出。
  - 后台用户注销前端路由已隐藏。
  - 后台新人礼接口已拦截，营销前端白名单排除 `marketing_gift`。
- 高级分销：
  - 事业部、代理、员工等高级分销路由和后台入口。
- 系统扩展：
  - 小票打印、外部应用/open API 账号和接口配置。
  - 复杂物流配置，例如运费、城市数据、配送模板设置。
- 发票：
  - 移动端发票路由。
  - 后台发票和电子发票配置路由。
- 商品扩展：
  - 后台商品采集、商品迁移、虚拟卡密导入、视频上传密钥、运费模板接口已在 MVP 模式下拦截。
  - 后台商品列表页已隐藏商品采集和商品迁移入口。
  - 后台商品编辑页 MVP 模式下不再自动请求运费模板，不再展示视频上传入口，不再调用视频上传密钥或卡密导入接口。
  - 商品采集弹窗和商品迁移导入组件已从商品列表/商品编辑主页面静态依赖中摘除，文件暂留在删除映射中。
  - 商品采集弹窗、商品迁移导入组件，以及只服务它们的前端 API wrapper 已完成第一批前端物理删除。

## 后端软拦截清单

后端软拦截集中在 `config/mvp.php` 和各端路由拦截中间件。

后台路由拦截：

- 营销禁用模块：
  - 优惠券、砍价、拼团、秒杀、预售、积分商城、充值、抽奖。
- 后台应用和客服：
  - `app/`、微信应用后台路由、反馈、话术、客服、自动回复。
- CMS/DIY：
  - `cms/`、`diy/`、`diy_pro/`、`theme/`、`theme_module/`。
- 发票：
  - 订单发票、发票开具/下载/配置路径。
- 线下/门店：
  - 线下收银、线下扫码、扫码列表、门店、门店员工、核销订单。
- 可选用户：
  - 用户财务导出、用户注销列表/动作、新人礼。
- 物流/系统：
  - 运费、城市设置、配送模板、小票打印、外部接口/账号设置。
- 高级分销：
  - `agent/division`。
- 商品扩展：
  - `product/product/get_template`、`product/product/get_temp_keys`、`product/product/import_card`
  - `product/product_export`、`product/product_import`
  - `product/crawl`、`product/copy_config`、`product/copy`

API 和 PC 路由拦截：

- 优惠券：
  - `coupon/`、`coupons`、`new_coupon`、`get_today_coupon`、`order/product_coupon`、`theme/coupon`。
- 营销活动：
  - `bargain/`、`combination/`、`seckill/`、`advance/`、`lottery`、`user/activity`。
- 积分商城和充值：
  - `store_integral/`、`recharge/`。
- 直播：
  - `wechat/live`。
- CMS：
  - `article/`、`theme/article`、`get_news_`。
- 客服：
  - `user/service/`、`get_customer_type`、`get_workerman_url`。
- 发票：
  - `invoice`、`order/invoice`、`order/make_up_invoice`、`order/down_invoice`。
- 线下/门店：
  - `order/offline/`、`store_list`。
- 复杂物流：
  - `order/order_verific`。
- 可选用户：
  - `collect/`、`get_collect_list`、`get_balance_record`、`user/visit`、`user/set_visit`、`user/share`、`user/message_system`、`user_cancel`、`order/friend_detail`、`order/receive_gift`、`order/gift_detail`、`user/balance`。
- 高级分销：
  - 强制拦截 `agent/` 和 `v2/agent/`，并拦截 `division/order`。
- 页面 DIY：
  - `diy/color_change`、`diy/get_diy`、`diy/get_version`、`diy/get_store_status`。

Kefu API 拦截：

- 客服禁用时，登录、key、扫码、配置、微信、上传、用户、订单、商品、客服、游客路径均拦截。

## 暂不删除

以下能力即使已隐藏或拦截，当前仍保留源码和数据：

- 已禁用的活动模块：
  - 优惠券、砍价、拼团、秒杀、预售、抽奖、直播、CMS、DIY/主题、积分商城、充值。
- 客服和 kefu 代码：
  - 后台客服页面/控制器。
  - `app/kefuapi`。
- 可选用户模块：
  - 余额、收藏、浏览记录、分享、消息、注销、礼物/好友代付、新人礼。
- 门店/线下模块：
  - 线下支付、门店自提、门店员工、核销订单。
- 发票模块：
  - 用户发票、订单发票、电子发票。
- 物流扩展：
  - 运费模板、城市数据设置、配送模板设置、小票打印。
- 商品扩展：
  - 后端商品采集/复制、商品迁移导入导出、虚拟卡密导入、视频上传密钥、运费模板接口仍暂留并由 MVP 路由拦截保护。
  - 前端商品采集弹窗、商品迁移导入组件和专用 API wrapper 已完成第一批物理删除。
- 高级分销：
  - 事业部/代理/员工高级分销，基础二级分销继续保留。
- 构建和运行产物：
  - `template/uni-app/dist`
  - `crmeb/public/statics/mp_view`
  - 运行日志和缓存
  - 仅本地使用的 `public/install.lock`
- 数据库表和迁移：
  - 验证门槛通过且准备删除映射前，不物理删除任何表。

## 物理删除门槛

任何物理删除前，都要执行以下检查，并把输出记录到新的日期文档中。

后端语法和缓存：

```powershell
docker exec -w /var/www/crmeb crmeb php -l config/mvp.php
docker exec -w /var/www/crmeb crmeb php -l app/api/route/v1.php
docker exec -w /var/www/crmeb crmeb php -l app/api/route/v2.php
docker exec -w /var/www/crmeb crmeb php -l app/api/route/pc.php
docker exec -w /var/www/crmeb crmeb php think clear
```

必须执行小程序构建：

```powershell
cd C:\Users\pc\Documents\ssp\Educational-Mini-Program-dev3\src\CRMEB\CRMEB-master\template\uni-app
npm run build:mp-weixin
```

小程序构建是物理删除前的强制门槛。如果依赖缺失，先安装依赖，并记录准确的安装命令和告警信息。预期输出目录：

```text
src/CRMEB/CRMEB-master/template/uni-app/dist/build/mp-weixin
```

建议执行后台构建：

```powershell
cd C:\Users\pc\Documents\ssp\Educational-Mini-Program-dev3\src\CRMEB\CRMEB-master\template\admin
npm run build
```

后端烟测：

```powershell
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/api/product/detail/1
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/api/pc/get_products
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/api/pc/get_news_list
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/user/user
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/user/cancel_list
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product/get_template
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/product_import
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8080/adminapi/product/crawl
```

最低预期：

- `GET /api/product/detail/1`
  - `status=200`
  - `msg=success`
  - `coupons=[]`
- `GET /api/pc/get_products`
  - `status=200`
  - 不能是 `MVP module disabled`
- `GET /api/pc/get_news_list`
  - `status=400`
  - `msg=MVP module disabled`
- `GET /adminapi/user/user`
  - 可返回登录过期等鉴权响应
  - 不能是 `MVP module disabled`
- `GET /adminapi/user/cancel_list`
  - `status=400`
  - `msg=MVP module disabled`
- `GET /adminapi/product/product`
  - 可返回登录过期等鉴权响应
  - 不能是 `MVP module disabled`
- `GET /adminapi/product/product/get_template`
  - MVP 模式下应被拦截。
- `POST /adminapi/product/product_import`
  - MVP 模式下应被拦截。
- `POST /adminapi/product/crawl`
  - MVP 模式下应被拦截。

小程序构建后人工检查：

- 将 `dist/build/mp-weixin` 导入微信开发者工具。
- 确认登录页能打开。
- 确认 MVP 首页/商品入口能打开。
- 确认商品详情能打开，且不显示优惠券 UI。
- 确认购物车/订单确认仍可用。
- 确认正常订单流程中微信支付入口仍可达。
- 确认测评入口可打开，登录后可提交。
- 确认签到和会员路径在预期位置可见。
- 确认以下隐藏入口不可见：
  - 优惠券
  - 客服
  - 直播/视频
  - 文章/CMS/新闻
  - 积分商城
  - 充值
  - 发票
  - 门店自提/线下支付
  - 余额/收藏/浏览/礼物/好友代付/注销
  - 后台商品采集/商品迁移/视频上传/卡密导入/运费模板扩展入口

## 删除规则

验证门槛通过后，物理删除仍要按小批次推进：

- 一次只删除一个模块族。
- 每个模块族都要保留可回溯删除映射：
  - 前端页面/组件
  - 后台路由/页面/API wrapper
  - API/后台路由定义
  - 控制器/服务/DAO/模型
  - 菜单记录
  - 数据库表和迁移/安装 SQL
- 共享 helper 至少经过两轮搜索确认没有保留路径引用后再删除。
- 不删除以下能力依赖的内容：
  - 商品详情
  - 下单/支付/回调/列表/详情
  - 微信登录/支付
  - 基础分销/佣金
  - 测评
  - 签到
  - 会员功能

## 审计来源文档

本文汇总以下软瘦身记录：

- `docs/2026-06-17-mvp-slimming-candidates.md`
- `docs/2026-06-17-mvp-slimming-phase1.md`
- `docs/2026-06-18-mvp-slimming-optional-user-route-audit.md`
- `docs/2026-06-18-mvp-slimming-optional-user-frontend-audit.md`
- `docs/2026-06-18-mvp-slimming-checkout-optional-frontend-audit.md`
- `docs/2026-06-18-mvp-slimming-mobile-admin-route-audit.md`
- `docs/2026-06-18-mvp-slimming-mobile-diy-route-audit.md`
- `docs/2026-06-18-mvp-slimming-offline-store-route-audit.md`
- `docs/2026-06-18-mvp-slimming-admin-offline-store-route-audit.md`
- `docs/2026-06-18-mvp-slimming-advanced-distribution-route-audit.md`
- `docs/2026-06-18-mvp-slimming-admin-dashboard-advanced-distribution-audit.md`
- `docs/2026-06-18-mvp-slimming-logistics-route-audit.md`
- `docs/2026-06-18-mvp-slimming-system-route-audit.md`
- `docs/2026-06-18-mvp-slimming-invoice-route-audit.md`
- `docs/2026-06-18-mvp-slimming-customer-service-route-audit.md`
- `docs/2026-06-18-mvp-slimming-kefuapi-route-audit.md`
- `docs/2026-06-18-mvp-slimming-frontend-live-video-audit.md`
- `docs/2026-06-18-mvp-slimming-product-detail-coupons-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-export-route-audit.md`
- `docs/2026-06-19-mvp-slimming-pc-optional-user-route-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-user-optional-route-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-user-frontend-route-audit.md`
- `docs/2026-06-19-mvp-slimming-pc-cms-route-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-public-customer-service-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-product-activity-api-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-product-extra-api-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-product-extra-frontend-audit.md`
- `docs/2026-06-19-mvp-slimming-admin-product-extra-deletion-map.md`
- `docs/2026-06-19-mvp-slimming-admin-product-extra-frontend-delete.md`
