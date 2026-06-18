# CRMEB MVP 瘦身：后台用户详情优惠券入口收口审计

日期：2026-06-18

## 目标

继续执行 MVP 软瘦身，只隐藏后台用户详情中的优惠券查看入口并增加前端兜底，不删除代码、不改用户详情接口、不影响用户、订单、商品、支付、二级分销、佣金、签到和会员核心能力。

本阶段聚焦后台用户详情抽屉中的残留入口：

- 用户详情页签中的持有优惠券。
- 从内部状态切换到 `coupon` 时触发的优惠券明细查询。

## 本次调整

位置：

- `src/CRMEB/CRMEB-master/template/admin/src/pages/user/list/handle/userDetails.vue`

处理：

- 引入 `isMvpCouponEnabled()`。
- 新增 `mvpList` 计算属性，MVP 模式下过滤 `coupon` 页签。
- `changeTab()` 增加优惠券页签兜底拦截。
- `changeType()` 增加 `coupon` 类型兜底拦截，避免从内部状态或分页触发优惠券明细接口。

## 保留能力

本次不影响：

- 后台用户详情查看。
- 后台用户编辑。
- 消费记录。
- 积分明细。
- 签到记录。
- 好友关系。
- 会员状态查看。
- 二级分销和佣金核心链路。

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
```

浏览器后台路径：

- `http://127.0.0.1:8080/admin`
- 登录后进入用户列表。
- 打开任意用户详情，确认不显示持有优惠券页签。
- 确认用户信息、消费记录、积分明细、签到记录、好友关系仍可查看。

## 风险点

- 本阶段只隐藏后台前端入口；如果后端用户详情接口仍支持优惠券明细，当前不做物理删除。
- 余额变动页签仍保留在用户详情中，属于 P2 谨慎候选；后续是否隐藏需要单独确认，避免误伤资金/售后关联查看。
- 后续物理删除优惠券能力前，还需排查用户详情接口、优惠券发放组件、营销路由、权限菜单和历史优惠券数据。
