# CRMEB MVP 瘦身：后台装修优惠券配置入口收口审计

## 本轮目标

继续执行 MVP 软瘦身，只隐藏后台 DIY/装修里的优惠券配置入口和预览取数兜底，不删除代码、不改装修路由、不影响商品、订单、支付、二级分销、佣金、签到和会员核心能力。

## 本轮改动

### 后台自定义组件配置

文件：

- `src/CRMEB/CRMEB-master/template/admin/src/components/mobileConfig/c_custom_component.vue`

改动：

- 引入 `isMvpCouponEnabled()`。
- MVP 模式下过滤自定义组件 `selectType` 中的 `coupon` 选项。
- 如果历史装修数据已经保存为 `coupon`，配置面板会降级到 `user`。
- `coupon` 配置分支增加 MVP 判断，避免继续展示优惠券数据源、优惠券选择器、优惠券筛选条件。

### 后台自定义组件预览

文件：

- `src/CRMEB/CRMEB-master/template/admin/src/components/mobilePage/home_custom_component.vue`

改动：

- 引入 `isMvpCouponEnabled()`。
- MVP 模式下历史 `coupon` 自定义组件降级为 `user` 预览。
- `fetchCouponList()` 增加兜底，MVP 模式下不再请求优惠券列表接口。

### 后台装修组件面板

文件：

- `src/CRMEB/CRMEB-master/template/admin/src/pages/setting/devise/diyIndex.vue`

改动：

- 引入 `isMvpCouponEnabled()`。
- MVP 模式下左侧组件面板过滤独立 `home_coupon` / `coupon` 组件。
- 历史自定义组件角标遇到 `coupon` 时返回空文本，避免继续突出优惠券类型。

## 未改动范围

- 未删除 `home_coupon.vue`、`c_home_coupon.vue` 等组件文件。
- 未修改后台 DIY 路由和保存接口。
- 未修改订单、支付、支付回调、分销、佣金、签到、会员。
- 未修改数据库表和历史装修数据。

## 本地验证

```powershell
git diff --check
cd src/CRMEB/CRMEB-master/template/admin
npm run build
docker exec -w /var/www/crmeb crmeb-local php think clear
curl.exe -i --max-time 20 http://127.0.0.1:8080/api/product/detail/1
curl.exe -i --max-time 20 http://127.0.0.1:8080/adminapi/marketing/coupon/released
```

后台手工验证：

- 登录后台进入装修/DIY 页面。
- 确认左侧营销组件中不再显示独立优惠券组件。
- 添加自定义组件，确认选择信息中不再显示优惠券。
- 如果加载历史优惠券自定义组件，确认不会继续请求优惠券列表接口。

## 风险点

- 本轮是前端软隐藏，历史装修数据中仍可能保留优惠券组件配置。
- 后台 DIY 路由此前已按 MVP 配置禁用；如果后续重新开启 DIY 页面，需要同时确认页面级入口和组件级入口。
- 会员组件中仍可能展示会员权益相关优惠券文案。会员功能是 MVP 保留项，本轮未处理会员内部展示，避免误伤会员中心。
- 真正物理删除优惠券装修组件前，还需要排查 `mobilePage/index.js` 自动注册、`mobileConfig/index.js` 自动注册、主题保存数据、历史页面 JSON 和数据库装修表。
