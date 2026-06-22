# CRMEB MVP 瘦身：旧版用户 DIY 组件入口收口审计

日期：2026-06-18

## 目标

继续执行 MVP 软瘦身，只隐藏入口，不删除代码、不改后端接口、不破坏订单和支付主流程。

本阶段补齐旧版 DIY 用户信息组件中的可选用户入口。

## 背景

此前已收口：

- 用户中心菜单
- 新版 `homeUserInfor` DIY 用户组件
- 订单确认页可选能力

扫描发现旧版组件仍可能被 `pageDesign` 渲染：

- `src/CRMEB/CRMEB-master/template/uni-app/subpackage/diyComponents/userInfor.vue`

该组件仍展示并跳转：

- 优惠券
- 积分入口
- 余额
- 收藏商品
- 浏览记录

这些入口已属于 MVP 禁用或非核心可选能力。

## 本次调整

位置：

- `src/CRMEB/CRMEB-master/template/uni-app/subpackage/diyComponents/userInfor.vue`

处理：

- 引入统一的 `isMvpHiddenLink` 规则。
- 抽出 `getMenuUrl(type)`，把菜单类型映射到实际页面 URL。
- 新增 `isMvpMenuVisible(type)`，模板根据统一 MVP 隐藏规则决定是否显示。
- `handleMenu(type)` 增加兜底保护，隐藏链接即使被直接调用也不会跳转。

## 保留能力

本次不影响：

- 用户头像、昵称、手机号展示
- 会员等级和会员成长展示
- 登录入口
- 签到和会员能力
- 分销佣金入口
- 商品、订单、微信支付链路

## 本地验证路径

前端构建：

```bash
cd src/CRMEB/CRMEB-master/template/uni-app
npm run build:mp-weixin
```

页面验证：

- 微信开发者工具导入 `src/CRMEB/CRMEB-master/template/uni-app/dist/build/mp-weixin`
- 打开个人中心或后台 DIY 用户中心页面
- 确认旧版用户信息组件不再展示余额、优惠券、收藏、浏览记录等非 MVP 入口
- 确认会员信息仍可显示

## 风险点

- 后台 DIY 配置可能切换新旧用户信息组件，因此新旧组件都需要保留同一套 MVP 过滤规则。
- 积分底层能力仍需保留给签到链路，当前只隐藏用户侧积分入口，不删除积分账户或流水。
- 后续真正删除旧版 DIY 组件前，需要确认所有 `pageDesign` 配置不再引用 `userInfor`。

