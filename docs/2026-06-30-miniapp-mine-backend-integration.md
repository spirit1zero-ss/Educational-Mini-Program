# 小程序「我的」页后端开发文档

更新时间：2026-06-30

## 一、页面定位

「我的」页不是传统个人中心，主要承担三个业务目标：

1. 判断用户是否是 `21天自主学习训练营` 会员。
2. 未开通会员时，引导报名/支付/兑换开通。
3. 已开通会员后，引导生成推广海报，进入分销闭环。

后端负责提供真实状态和权限，前端只负责展示切换。

核心原则：

- 会员状态以后端为准。
- 会员 UID 以后端生成为准。
- 推广权限以后端校验为准。
- 前端可以隐藏或禁用按钮，但后端必须二次校验。

## 二、当前前端页面和素材

页面位置：

```text
homepage-home-v1/miniprogram/pages/mine/mine.js
homepage-home-v1/miniprogram/pages/mine/mine.wxml
homepage-home-v1/miniprogram/pages/mine/mine.wxss
homepage-home-v1/miniprogram/pages/promo-poster/*
homepage-home-v1/miniprogram/pages/invite-records/*
homepage-home-v1/miniprogram/pages/my-income/*
homepage-home-v1/miniprogram/pages/camp-orders/*
```

设计参考：

```text
homepage-home-v1/design-reference/accepted-mine-page-mockup.png
homepage-home-v1/design-reference/accepted-mine-member-card-visual.png
```

页面素材：

```text
homepage-home-v1/miniprogram/assets/mine/mine-hero-training-camp.png
homepage-home-v1/miniprogram/assets/mine/mine-hero-member-active.png
homepage-home-v1/miniprogram/assets/mine/*.svg
```

## 三、页面需要的后端功能

第一阶段建议先打通 6 个核心功能：

1. 微信登录与用户身份
2. 会员状态查询
3. 报名支付后开通会员
4. 分销中心统计
5. 推广海报/邀请关系
6. 兑换码开通会员

当前前端已经有邀请记录、我的收益、训练营订单三个下钻页。后端可以第一阶段先返回分页列表的基础字段，复杂筛选、提现审核流、订单详情页可第二阶段加深。

## 四、功能 1：微信登录与用户身份

### 目标

用户进入小程序后，后端通过微信 `openid` 识别用户。

不建议先做传统账号注册。身份识别用微信登录，联系信息可在报名流程中收集手机号。

### 流程

1. 前端调用 `wx.login()` 获取 `code`。
2. 前端把 `code` 发给后端。
3. 后端请求微信接口换取 `openid`。
4. 后端创建或读取用户。
5. 后端返回业务 token 和用户基础信息。

### 推荐接口

```http
POST /api/miniapp/auth/login
```

请求：

```json
{
  "code": "wx.login 返回的 code",
  "referrerUid": "A10293"
}
```

字段说明：

- `code`：必填。
- `referrerUid`：可选，用户通过推广海报进入时携带。

响应：

```json
{
  "status": 200,
  "msg": "ok",
  "data": {
    "token": "Bearer token",
    "user": {
      "id": 10001,
      "uid": "U10001",
      "openidBound": true
    }
  }
}
```

### 后端要求

- 同一个 openid 只能对应一个用户。
- 如果传入 `referrerUid`，可以尝试绑定邀请关系，但必须防止自己邀请自己。
- 如果用户已有上级，不建议覆盖。

## 五、功能 2：会员状态查询

### 目标

「我的」页打开时，前端需要一次拿到会员状态、会员 UID、训练营卡片信息和分销数据。

### 推荐接口

```http
GET /api/miniapp/mine/overview
```

请求头：

```text
Authori-zation: Bearer <token>
Form-type: routine
content-type: application/json
```

### 未开通会员响应

```json
{
  "status": 200,
  "msg": "ok",
  "data": {
    "member": {
      "isMember": false,
      "uid": "",
      "statusText": "当前未开通会员",
      "benefitText": "报名后开通会员权益",
      "canPromote": false
    },
    "trainingCamp": {
      "productId": 1001,
      "title": "21天自主学习训练营",
      "subtitle": "直播课 + 打卡陪跑 + 答疑服务",
      "priceText": "399元",
      "ctaText": "立即报名"
    },
    "referral": {
      "invitedCount": 0,
      "estimatedRewardText": "0元",
      "withdrawableAmountText": "0元",
      "posterCtaText": "开通后生成推广海报"
    }
  }
}
```

### 已开通会员响应

```json
{
  "status": 200,
  "msg": "ok",
  "data": {
    "member": {
      "isMember": true,
      "uid": "A10293",
      "statusText": "训练营会员",
      "benefitText": "会员权益已生效",
      "canPromote": true
    },
    "trainingCamp": {
      "productId": 1001,
      "title": "21天自主学习训练营",
      "subtitle": "直播课 + 打卡陪跑 + 答疑服务",
      "priceText": "已开通",
      "ctaText": "生成推广海报"
    },
    "referral": {
      "invitedCount": 3,
      "estimatedRewardText": "120元",
      "withdrawableAmountText": "80元",
      "posterCtaText": "生成推广海报"
    }
  }
}
```

### 前端展示规则

未开通会员：

```text
徽章：当前未开通会员
不显示会员 UID
状态：399元
说明：报名后开通会员权益
主按钮：立即报名
分销按钮：开通后生成推广海报
```

已开通会员：

```text
徽章：训练营会员
显示：会员编号 UID：A10293
状态：已开通
说明：会员权益已生效
主按钮：生成推广海报
分销按钮：生成推广海报
```

## 六、功能 3：报名支付后开通会员

### 目标

用户报名 `21天自主学习训练营` 并支付成功后，后端开通会员。

### 业务流程

1. 用户点击 `立即报名`。
2. 前端进入训练营详情页或下单页。
3. 后端创建训练营订单。
4. 用户发起微信支付。
5. 微信支付回调成功。
6. 后端把订单置为已支付。
7. 后端为当前用户开通训练营会员。
8. 如存在上级邀请关系，记录有效邀请和奖励。

### 后端要求

- 会员开通必须以支付回调成功为准。
- 支付回调必须幂等，重复回调不能重复开通或重复结算。
- 会员 UID 由后端生成，不能由前端传入。
- 开通后 `/api/miniapp/mine/overview` 必须返回 `isMember=true`。

### 建议订单字段

```text
order_id
user_id
product_id
product_type = training_camp
pay_status
pay_time
pay_trade_no
referrer_user_id
referrer_uid
member_opened
```

### 建议会员字段

```text
user_id
member_uid
member_type = training_camp
is_active
started_at
expired_at
source_type = payment
source_id = order_id
can_promote
```

## 七、功能 4：分销中心统计

### 目标

「我的」页分销中心显示：

```text
已邀请
预计奖励
可提现
```

第一阶段只需要给概览数据，不需要先做完整列表页。

### 数据来源建议

- `已邀请`：通过当前会员 UID 邀请并完成有效报名的人数。
- `预计奖励`：已产生但可能未结算/未提现的奖励总额。
- `可提现`：已满足提现条件的奖励金额。

### 推荐接口

可以先合并在：

```http
GET /api/miniapp/mine/overview
```

第二阶段再拆出：

```http
GET /api/miniapp/referral/summary
```

响应：

```json
{
  "status": 200,
  "msg": "ok",
  "data": {
    "invitedCount": 3,
    "estimatedRewardText": "120元",
    "withdrawableAmountText": "80元",
    "canWithdraw": true
  }
}
```

## 八、功能 5：推广海报和邀请关系

### 目标

已开通会员可以生成推广海报。新用户通过海报进入小程序后，后端记录邀请关系。

### 生成推广海报接口

```http
POST /api/miniapp/referral/poster
```

请求：

```json
{
  "page": "pages/home/home"
}
```

响应：

```json
{
  "status": 200,
  "msg": "ok",
  "data": {
    "posterUrl": "https://example.com/posters/A10293.png",
    "sharePath": "pages/home/home?ref=A10293",
    "scene": "ref=A10293"
  }
}
```

### 权限要求

后端必须校验：

- 当前用户已登录。
- 当前用户是训练营会员。
- 当前用户 `canPromote=true`。

未开通会员时返回：

```json
{
  "status": 403,
  "msg": "开通训练营会员后可生成推广海报"
}
```

### 邀请关系绑定

推荐在登录接口内处理 `referrerUid`，也可以单独提供：

```http
POST /api/miniapp/referral/bind
```

请求：

```json
{
  "referrerUid": "A10293"
}
```

响应：

```json
{
  "status": 200,
  "msg": "ok"
}
```

绑定规则：

- 首次绑定有效。
- 用户已有上级时不覆盖。
- 不能绑定自己为上级。
- 上级必须是有效训练营会员。
- 支付成功后才计为有效邀请。

## 九、功能 6：兑换码开通会员

### 目标

兑换码用于线下、活动、人工发放等场景，用户输入后可开通训练营会员。

### 推荐接口

```http
POST /api/miniapp/redeem-code/use
```

请求：

```json
{
  "code": "ABCD-2026-0001"
}
```

成功响应：

```json
{
  "status": 200,
  "msg": "兑换成功",
  "data": {
    "member": {
      "isMember": true,
      "uid": "A10293",
      "statusText": "训练营会员",
      "benefitText": "会员权益已生效",
      "canPromote": true
    }
  }
}
```

失败响应：

```json
{
  "status": 400,
  "msg": "兑换码无效或已使用"
}
```

### 后端要求

- 兑换码只能使用一次，或按后台配置限制次数。
- 兑换码必须绑定使用人。
- 兑换成功后开通会员。
- 兑换成功后 `/api/miniapp/mine/overview` 返回会员态。

### 建议兑换码字段

```text
code
status
max_use_count
used_count
used_user_id
used_at
member_type
created_by
expired_at
```

## 十、列表页接口

这些入口前端已经做成页面。第一阶段建议返回可展示的分页列表；没有数据时返回空数组，由前端显示空状态。

### 邀请记录

```http
GET /api/miniapp/referral/invites?page=1&limit=10
```

### 我的收益

```http
GET /api/miniapp/referral/income?page=1&limit=10
```

### 训练营订单

```http
GET /api/miniapp/training-camp/orders?page=1&limit=10
```

### 会员权益

```http
GET /api/miniapp/member/benefits
```

### 分销规则

```http
GET /api/miniapp/referral/rules
```

## 十一、最小开发任务清单

后端第一阶段建议按这个顺序开发：

1. 微信登录：`POST /api/miniapp/auth/login`
2. 我的页概览：`GET /api/miniapp/mine/overview`
3. 训练营支付成功后开通会员
4. 推广海报：`POST /api/miniapp/referral/poster`
5. 邀请关系绑定：登录时处理 `referrerUid`
6. 兑换码开通：`POST /api/miniapp/redeem-code/use`

## 十二、验收标准

### 未开通会员

后端返回：

```text
isMember=false
uid=""
canPromote=false
```

前端应显示：

```text
当前未开通会员
399元
报名后开通会员权益
立即报名
开通后生成推广海报
```

点击生成推广海报，后端应拒绝或前端提示先报名。

### 已开通会员

后端返回：

```text
isMember=true
uid=A10293
canPromote=true
```

前端应显示：

```text
训练营会员
会员编号 UID：A10293
已开通
会员权益已生效
生成推广海报
```

点击生成推广海报，后端返回海报或分享路径。

### 支付开通

支付成功后：

- 订单状态为已支付。
- 用户变成训练营会员。
- 会员 UID 可查询。
- 我的页刷新后显示会员态。

### 兑换码开通

兑换成功后：

- 兑换码状态变为已使用。
- 用户变成训练营会员。
- 我的页刷新后显示会员态。

### 邀请关系

通过推广链接进入并报名成功后：

- 新用户绑定到推广人。
- 推广人的已邀请人数增加。
- 推广人的预计奖励增加。
