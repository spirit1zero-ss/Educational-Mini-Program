# CRMEB MVP 瘦身：后台商品与用户营销入口收口审计

日期：2026-06-18

## 目标

继续执行 MVP 软瘦身，只隐藏非 MVP 营销入口并加前端兜底，不删除代码、不改接口、不影响商品、订单、支付、二级分销、佣金、签到和会员核心能力。

本阶段聚焦后台仍可见的 P1 营销入口：

- 商品列表筛选里的优惠券商品。
- 商品列表批量操作里的购买送优惠券。
- 商品列表活动标签里的砍价、拼团、秒杀跳转。
- 用户列表里的发送优惠券。

## 本次调整

### 后台 MVP 配置

位置：

- `src/CRMEB/CRMEB-master/template/admin/src/config/mvp.js`

处理：

- 新增 `isMvpCouponEnabled()`。
- 新增 `isMvpMarketingActivityEnabled(type)`。
- MVP 模式下禁用：
  - `coupon`
  - `bargain`
  - `combination`
  - `seckill`

### 商品列表

位置：

- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productList/index.vue`

处理：

- MVP 模式下隐藏商品类型筛选里的优惠券商品。
- MVP 模式下隐藏批量操作里的购买送优惠券。
- MVP 模式下隐藏砍价、拼团、秒杀活动标签。
- `batchSelect(4)`、`activityDetail()`、`addCoupon()` 增加 MVP 前端兜底提示，避免隐藏入口外的内部调用继续进入禁用玩法。

### 用户列表

位置：

- `src/CRMEB/CRMEB-master/template/admin/src/pages/user/list/index.vue`

处理：

- MVP 模式下隐藏发送优惠券按钮。
- MVP 模式下不挂载发送优惠券弹窗组件。
- `onSend()` 增加 MVP 前端兜底提示。

## 保留能力

本次不影响：

- 后台商品列表查看。
- 商品新增、编辑、上下架、普通标签设置。
- 后台用户列表查看。
- 用户详情查看。
- 会员状态和会员配置查看。
- 二级分销和佣金查看。
- 微信支付、支付回调、订单状态机。
- 签到功能。

## 本地验证路径

后台构建：

```bash
cd src/CRMEB/CRMEB-master/template/admin
npm run build
```

Docker 后端核心抽测：

```bash
docker exec -w /var/www/crmeb crmeb-local php think clear
curl.exe -i --max-time 20 http://127.0.0.1:8080/api/product/detail/1
curl.exe -i --max-time 20 http://127.0.0.1:8080/adminapi/marketing/coupon/released
curl.exe -i --max-time 20 http://127.0.0.1:8080/adminapi/marketing/bargain/list
```

浏览器后台路径：

- `http://127.0.0.1:8080/admin`
- 登录后进入商品列表，确认优惠券商品、购买送优惠券、砍价、拼团、秒杀入口不显示。
- 登录后进入用户列表，确认发送优惠券按钮不显示。
- 确认商品列表、用户列表仍可正常打开和查询。

## 风险点

- 商品列表接口仍可能返回活动标记字段，本阶段只做后台前端收口，不改商品接口响应。
- 优惠券、砍价、拼团、秒杀后端接口已由 MVP 配置拦截；后续物理删除前仍需排查关联组件、导出接口、权限菜单和数据库表。
- 积分相关能力需要保留给签到链路，本次没有隐藏购买送积分。
