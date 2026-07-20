# 小程序虚拟支付接入与上线配置

当前训练营按“一次性会员权益购买”接入微信小程序虚拟支付：小程序调用 `wx.requestVirtualPayment`，服务端负责签名、查询订单、开通会员权益并通知微信权益已交付。代码不会降级到普通 `wx.requestPayment`。

微信接口把这种一次性购买技术模式命名为 `short_series_goods`，管理后台入口仍可能显示“道具管理”。这只是微信的协议和后台分类；本项目的业务对象、页面文案和本地数据始终使用“21天线上训练营会员权益”，不建设金币、背包或用户可见的道具体系。

官方文档：

- [虚拟支付能力与开通流程](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/virtual-payment.html)
- [wx.requestVirtualPayment](https://developers.weixin.qq.com/miniprogram/dev/api/payment/wx.requestVirtualPayment.html)
- [查询虚拟支付订单](https://developers.weixin.qq.com/miniprogram/dev/server/API/VirtualPayment/api_query_order)
- [通知已发货完成](https://developers.weixin.qq.com/miniprogram/dev/server/API/VirtualPayment/api_notify_provide_goods)

## 微信后台准备

1. 小程序完成认证并在管理后台开通“虚拟支付”。
2. 在“虚拟支付 -> 基本配置”取得 `OfferId`、沙箱 `AppKey` 和现网 `AppKey`。
3. 在微信后台对应的商品管理入口创建“21天线上训练营会员权益”。微信后台生成的商品 ID 必须与服务端 `TRAINING_CAMP_PRODUCT_ID` 一致，价格必须与会员订单一致；目前页面为 399 元，即 `39900` 分。
4. 开发阶段先把会员权益商品发布到开发版本并使用沙箱环境；沙箱链路验证完毕后，再发布现网版本并切换现网环境。

## 数据库升级

执行：

`src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-16-miniapp-virtual-payment.sql`

该表用于保存每次支付尝试。微信要求每次 `wx.requestVirtualPayment` 使用新的 `outTradeNo`，因此不能直接反复使用本地会员订单号。

## 服务端环境变量

先使用沙箱：

```ini
[XPAY]
ENABLED = true
ENV = 1
OFFER_ID = 微信后台的OfferId
SANDBOX_APP_KEY = 微信后台的沙箱AppKey
PRODUCTION_APP_KEY =
TRAINING_CAMP_PRODUCT_ID = 微信后台已发布到开发版本的会员权益商品ID
```

现网验证前改为：

```ini
ENABLED = true
ENV = 0
OFFER_ID = 微信后台的OfferId
PRODUCTION_APP_KEY = 微信后台的现网AppKey
TRAINING_CAMP_PRODUCT_ID = 微信后台已发布到现网版本的会员权益商品ID
```

`AppKey` 只能保存在服务端环境变量或密钥服务中，禁止写入小程序代码、Git 仓库或接口响应。

微云服务平台使用对应的环境变量名：`PHP_XPAY_ENABLED`、`PHP_XPAY_ENV`、`PHP_XPAY_OFFER_ID`、`PHP_XPAY_PRODUCTION_APP_KEY` 和 `PHP_XPAY_TRAINING_CAMP_PRODUCT_ID`。应先填写其余四项并重新部署，最后才把 `PHP_XPAY_ENABLED` 改为 `true`；正式服务必须使用 `PHP_XPAY_ENV=0`，不能配置沙箱商品 ID 或沙箱 AppKey。

## 验证顺序

1. 执行数据库补丁并重启 PHP 服务。
2. 开启沙箱配置，确认小程序基础库不低于 2.19.2。
3. 创建训练营订单，在真机中拉起虚拟支付。
4. 支付后确认本地订单变为已支付、会员权益生效，`eb_miniapp_virtual_payment_attempt.wx_status` 最终为 `4`。
5. 验证用户取消支付后可以重新发起，新一次支付必须产生新的 `out_trade_no`。
6. 验证小程序异常退出后，再进入订单页仍能由服务端轮询补发权益。
7. 沙箱全部通过后，发布现网会员权益商品、配置现网 AppKey，将 `ENV` 改为 `0`，再做小额现网验证。

## 当前实现边界

当前实现了官方要求的“支付轮询分支”：支付完成后立即确认，订单页也会对未完成订单进行补偿查询。确认微信订单已经支付后，服务端复用 CRMEB 原有 `OtherOrderServices::paySuccess()` 开通会员，再调用 `/xpay/notify_provide_goods` 告知微信权益已经交付。

官方说明发货推送和轮询至少实现一个；当前轮询链路已经满足基础要求。正式放量前仍建议在微信后台配置 `xpay_goods_deliver_notify` 推送，形成“推送 + 轮询”双保险。推送必须接入微信原有消息服务器的验签/解密链路，不能新增一个不验签的公开 HTTP 接口。

## PHP 8.3 与 EasyWeChat 兼容

项目当前锁定 EasyWeChat `3.3.33`，原包中的 `EasyWeChat\Support\Collection::__set_state()` 不符合 PHP 8 强制的方法原型。项目已经在已提交的 vendor 代码中修正为静态单参数方法，否则支付阶段调用小程序登录接口时会直接触发 fatal error。

当前 Docker 镜像直接复制仓库内 vendor，因此补丁会随部署生效。若以后重新执行 `composer install` 覆盖 vendor，必须重新确认该兼容补丁仍然存在，或将 EasyWeChat 升级到与 CRMEB 兼容且原生支持 PHP 8 的版本。部署补丁后需要重启 PHP/容器，使 OPcache 不再使用旧类定义。

## 支付并发与补偿说明

- SQL 补丁可重复执行，也能升级此前只有支付尝试表的版本。
- `eb_miniapp_training_camp_order` 只是内部业务范围与订单快照，不会增加用户可见的订单类型。
- Redis 用于快速拦截重复请求；数据库行锁和 `uniq_active_order_key` 唯一索引继续作为正确性兜底。
- 已启用的 `virtualPaymentReconcile` 定时任务每分钟查询 XPay，并重试“已支付但发货确认失败”的订单。
- 用户取消和系统超时关单前都查询微信。查询失败时延后关单，避免误关已支付订单。
- 资金退款全部由工作人员在微信虚拟支付管理后台人工发起，项目不调用 `/xpay/refund_order`，小程序也不提供自助退款按钮。
- 识别到微信退款完成后会记录 `refund_state=refunded`；已经发放的权益进入 `review`，等待管理员选择撤销或保留会员，不会自动撤销。

## 管理后台

执行同一个 SQL 补丁并重新构建管理后台后，“用户 → 付费会员”下会出现：

- “训练营订单”：查看本地订单、微信支付、会员权益、发货确认、退款复核和失败原因。
- “报名登记表”：查看孩子信息、联系电话及关联订单。

“核对支付”只查询微信并按真实状态补偿本地订单；“重试权益确认”只重试微信会员权益交付确认。后台没有提供手工把订单改成已支付的入口。

退款处理流程：用户联系客服 → 工作人员在微信虚拟支付管理后台完成退款 → 定时任务或“核对支付”同步为已退款 → 订单进入“退款待复核” → 管理员填写备注并选择“撤销会员”或“保留会员”。撤销操作只清除付费永久会员标记，不修改普通用户等级、积分、余额和推广关系；全部操作写入订单状态记录，并且不可重复反向处理。
