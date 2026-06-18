# CRMEB MVP 瘦身：用户侧可选入口前端收口审计

日期：2026-06-18

## 目标

在不删除代码、不重写支付、不破坏订单状态机的前提下，让 H5/小程序端用户侧入口与后端 MVP 路由拦截保持一致。

本次只做软瘦身：

- 隐藏非 MVP 用户入口
- 阻止 MVP 下访问足迹上报
- MVP 下只保留微信支付入口
- 阻止礼物订单、代付、余额、线下支付等非 MVP 支付路径从前端继续发起

## 本次调整

### MVP 链接隐藏规则

位置：

- `src/CRMEB/CRMEB-master/template/uni-app/config/mvp.js`

新增隐藏关键词：

- `user_goods_collection`
- `user_invoice`
- `user_money`
- `visit_list`
- `message_center`
- `message_system`
- `payment_on_behalf`
- `receive_gift`
- `receive_gifts_status`
- `user_cancellation`

保留入口：

- 用户中心
- 商品
- 订单
- 微信支付
- 签到
- 会员
- 分销佣金

### 用户中心访问足迹

位置：

- `src/CRMEB/CRMEB-master/template/uni-app/pages/user/index.vue`

处理：

- MVP 模式下不再调用 `setVisit`
- 避免前端继续请求已被后端 MVP 拦截的 `user/set_visit`

### 用户信息 DIY 组件

位置：

- `src/CRMEB/CRMEB-master/template/uni-app/subpackage/diyComponents/homeUserInfor.vue`

处理：

- 余额、优惠券、积分商城入口、收藏商品、浏览记录按统一 `isMvpHiddenLink` 规则过滤
- 保留推广佣金、推广人、推广订单入口

说明：

- 签到可能依赖积分底层能力，因此本次只是隐藏积分商城/积分入口，不删除积分账户和积分流水能力。

### 收银台支付方式

位置：

- `src/CRMEB/CRMEB-master/template/uni-app/pages/goods/cashier/index.vue`

处理：

- MVP 模式下只保留微信支付
- 隐藏支付宝、余额、线下支付、好友代付
- 用户通过旧状态触发非微信支付时，前端直接提示并中止

### 订单确认支付方式与礼物订单

位置：

- `src/CRMEB/CRMEB-master/template/uni-app/pages/goods/order_confirm/index.vue`

处理：

- MVP 模式下只保留微信支付
- 创建订单、订单价格计算、订单确认时不再提交礼物订单参数
- 礼物订单领取入口在 MVP 模式下直接中止

## 本地验证路径

建议验证：

```bash
cd src/CRMEB/CRMEB-master/template/uni-app
npm run build:mp-weixin
```

Docker 后端抽测：

```bash
docker ps
docker exec -w /var/www/crmeb crmeb-local php think clear
```

浏览器/H5：

- `http://127.0.0.1:8080`

微信开发者工具：

- 导入 `src/CRMEB/CRMEB-master/template/uni-app/dist/build/mp-weixin`
- 打开用户中心，确认余额、收藏、浏览记录、代付、礼物订单入口不可见
- 打开订单确认页，确认只显示微信支付
- 发起普通训练营商品下单，确认订单创建流程不受影响

## 风险点

- 部分菜单来自后台 DIY 配置，本次依赖统一链接关键词过滤；如果后台新增非标准 URL，后续还需要补充关键词。
- 积分底层能力不能直接删除，因为签到可能依赖积分账户、积分流水或积分展示。
- 会员、签到、二级分销、佣金入口必须保留，不能跟随用户侧可选功能一起删除。
- 本次只是前端软隐藏，真正物理删除仍需要后续依赖排查和回归验证。

