# CRMEB MVP 瘦身：订单确认可选能力前端收口审计

日期：2026-06-18

## 目标

继续执行 MVP 软瘦身，不删除代码、不改订单状态机、不重写支付。

本阶段聚焦订单确认页仍可能出现的非 MVP 能力：

- 发票
- 门店自提
- 线下支付相关入口
- 礼物订单历史参数
- 用户资料页里的发票管理和账号注销入口

## 本次调整

### 订单确认页

位置：

- `src/CRMEB/CRMEB-master/template/uni-app/pages/goods/order_confirm/index.vue`

处理：

- MVP 模式下不显示门店自提切换。
- MVP 模式下不显示开具发票入口。
- MVP 模式下 `checkShipping` 直接走普通配送。
- MVP 模式下 `getList`、`showStoreList`、`goInvoice`、`getInvoiceList` 直接返回。
- MVP 模式下旧 URL 参数里的 `invoice_id`、`is_gift` 会被清空。
- MVP 模式下提交订单强制：
  - `payType = weixin`
  - `shipping_type = 1`
  - `store_id = 0`
  - `invoice_id = ""`
  - `is_gift = 0`

### 用户资料页

位置：

- `src/CRMEB/CRMEB-master/template/uni-app/pages/users/user_info/index.vue`

处理：

- MVP 模式下隐藏发票管理。
- MVP 模式下隐藏账号注销。
- 地址管理保留，因为普通下单仍然依赖收货地址。

## 保留能力

本次不影响：

- 用户登录
- 用户资料编辑
- 地址管理
- 商品详情
- 创建订单
- 微信支付
- 支付回调
- 二级分销
- 佣金记录
- 签到
- 会员

## 本地验证路径

前端构建：

```bash
cd src/CRMEB/CRMEB-master/template/uni-app
npm run build:mp-weixin
```

Docker 后端抽测：

```bash
docker exec -w /var/www/crmeb crmeb-local php think clear
curl.exe -i --max-time 20 http://127.0.0.1:8080/api/product/detail/1
curl.exe -i --max-time 20 -X POST http://127.0.0.1:8080/api/user/set_visit
```

微信开发者工具路径：

- 导入 `src/CRMEB/CRMEB-master/template/uni-app/dist/build/mp-weixin`
- 打开商品详情
- 进入订单确认
- 确认只显示普通配送，不出现门店自提切换
- 确认不出现开具发票入口
- 确认支付方式只保留微信支付
- 打开用户资料页，确认发票管理、账号注销不显示

## 风险点

- 订单确认页历史逻辑较重，后续真正删除门店/发票代码前，需要再次回归订单创建、支付、回调、确认收货和佣金生成。
- 后台仍可能通过配置返回发票、自提字段，本次前端已做 MVP 兜底，但后续物理删除前还要核对接口响应。
- 地址管理不能删除，它属于普通订单核心链路。
- 签到和会员仍属于保留功能，不能跟积分商城、营销模块一起删。

