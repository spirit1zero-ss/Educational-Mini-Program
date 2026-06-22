# 2026-06-17 CRMEB MVP 瘦身候选清单

## 本次目标

本文档用于记录 CRMEB MVP 后续瘦身的删除候选清单和分级标注。当前阶段只做文档盘点，不删除代码、不修改路由、不调整后台菜单、不改数据库。

本次瘦身边界以 H5 当前界面功能和 CRMEB MVP 核心闭环为准：

- H5 首页、训练营、测评、个人中心、邀请、团队、佣金中心。
- 小程序登录、商品、商品详情、订单、微信支付、支付回调。
- 二级分销关系、佣金记录、后台查看。
- 测评记录、签到、会员功能保留。

## 分级规则

| 等级 | 含义 | 推荐动作 |
| --- | --- | --- |
| P0 必须保留 | MVP 核心链路或用户明确要求保留 | 先保留 |
| P1 优先删除候选 | 当前 MVP 不需要，入口已隐藏或独立度较高 | 先删 |
| P2 谨慎删除候选 | 可能与订单、用户、分销、积分、后台配置耦合 | 需二次依赖排查 |
| P3 后置处理 | 数据库、深层服务、官方框架、构建产物等 | 先隐藏或后置处理 |

## H5 当前功能边界

| 功能名称 | 分级 | 当前 MVP 是否需要 | 候选路径 | 删除风险 | 推荐动作 |
| --- | --- | --- | --- | --- | --- |
| H5 首页 | P0 | 是 | `src/pages/Home.jsx` | 删除会破坏首屏入口 | 先保留 |
| 训练营列表/详情入口 | P0 | 是 | `src/pages/Camp.jsx`、`src/api/training.js` | 删除会破坏商品和支付前置链路 | 先保留 |
| 测评入口与结果页 | P0 | 是 | `src/pages/HeartAssessment.jsx`、`src/pages/SubjectAssessment.jsx`、结果页 | 删除会破坏测评 MVP | 先保留 |
| 个人中心 | P0 | 是 | `src/pages/Profile.jsx` | 删除会破坏用户、订单、佣金入口 | 先保留 |
| 我的训练营 | P0 | 是 | `src/pages/MyCamp.jsx` | 删除会影响报名/订单状态查看 | 先保留 |
| 邀请好友、团队、佣金 | P0 | 是 | `src/pages/Invite.jsx`、`Team.jsx`、`Commission.jsx` | 删除会破坏分销验收 | 先保留 |
| H5 演示 mock 数据 | P2 | 部分需要 | `src/data/mockData.js` | 后端未登录/无数据时仍用于兜底展示 | 需二次依赖排查 |

## 小程序端候选

| 功能名称 | 分级 | 当前 MVP 是否需要 | 候选路径 | 删除风险 | 推荐动作 |
| --- | --- | --- | --- | --- | --- |
| 微信登录 | P0 | 是 | `template/uni-app/pages/users/wechat_login` | 删除会破坏小程序登录 | 先保留 |
| 商品列表、商品详情、下单 | P0 | 是 | `template/uni-app/pages/goods*`、`order_addcart` | 删除会破坏训练营商品购买 | 先保留 |
| 测评页面 | P0 | 是 | `template/uni-app/pages/assessment`、`api/education.js` | 删除会破坏测评记录提交 | 先保留 |
| 分销/佣金页面 | P0 | 是 | `pages/users/user_spread_user`、`user_spread_money`、`user_spread_code` | 删除会破坏分销验收 | 先保留 |
| 签到 | P0 | 是 | `pages/users/user_sgin`、`user_sgin_list` | 用户明确要求保留，可能依赖积分流水 | 先保留 |
| 会员中心 | P0 | 是 | `pages/users/user_vip`、`user_vip_areer`、`pages/annex/vip_*` | 用户明确要求保留，可能依赖会员权益/状态 | 先保留 |
| 秒杀 | P1 | 否 | `pages/activity/goods_seckill*` | 已被 MVP 配置隐藏，独立活动链路 | 先删 |
| 拼团 | P1 | 否 | `pages/activity/goods_combination*` | 活动订单逻辑可能引用，删除前先移除入口 | 先删 |
| 砍价 | P1 | 否 | `pages/activity/bargain`、`goods_bargain*` | 活动订单逻辑可能引用，删除前先移除入口 | 先删 |
| 预售 | P1 | 否 | `pages/activity/presell*` | 与商品详情活动态耦合 | 先删 |
| 抽奖/活动营销 | P1 | 否 | `pages/activity/poster-poster`、营销相关页面 | 非 MVP 链路 | 先删 |
| 优惠券营销页面 | P1 | 否 | `pages/users/user_coupon`、`user_get_coupon` | 订单优惠字段已在 MVP 下清理，但后端优惠券可能仍存在 | 先删 |
| 积分商城玩法 | P1 | 否 | `pages/points_mall` | 不能删除签到依赖的积分账户和积分流水 | 先删 |
| CMS/资讯/专题 | P1 | 否 | `pages/extension`、`pages/columnGoods` | 非训练营购买链路 | 先删 |
| DIY 子包 | P1 | 否 | `subpackage/diyComponents` | 首页已固定 MVP 入口，需确认没有被当前首页引用 | 先删 |
| 地址、发票、余额、收藏、浏览记录、代付 | P2 | 暂不需要 | `pages/users/user_address*`、`user_invoice*`、`user_money`、`user_payment`、`user_goods_collection`、`visit_list`、`payment_on_behalf` | 可能被订单、支付、用户中心复用 | 需二次依赖排查 |
| 门店/核销/商家入驻/线下支付 | P2 | 暂不需要 | `pages/admin`、`pages/annex/offline_*`、`pages/annex/settled` | 可能影响后台门店和订单核销配置 | 需二次依赖排查 |

## 后台前端候选

| 功能名称 | 分级 | 当前 MVP 是否需要 | 候选路径 | 删除风险 | 推荐动作 |
| --- | --- | --- | --- | --- | --- |
| 用户、商品、订单 | P0 | 是 | `template/admin/src/pages/user`、`product`、`order` | 后台验收核心 | 先保留 |
| 财务佣金 | P0 | 是 | `template/admin/src/pages/finance` | 佣金记录查看核心 | 先保留 |
| 测评记录 | P0 | 是 | `template/admin/src/pages/education` | 测评记录查看核心 | 先保留 |
| 签到后台配置/记录 | P0 | 是 | 后台用户/积分/签到相关页面 | 用户明确要求保留，路径需二次精确定位 | 先保留 |
| 会员后台配置/查看 | P0 | 是 | `template/admin/src/pages/user/level`、会员配置相关页面 | 用户明确要求保留，可能与用户等级、权益配置耦合 | 先保留 |
| 营销模块 | P1 | 否 | `template/admin/src/pages/marketing`、`router/modules/marketing.js` | 删除前需确认菜单权限同步 | 先删 |
| CMS | P1 | 否 | `template/admin/src/pages/cms`、`router/modules/cms.js` | 非 MVP 后台能力 | 先删 |
| 应用装修/Diy | P1 | 否 | `template/admin/src/pages/app`、`router/modules/app.js` | 首页装修可能仍被后台菜单引用 | 先删 |
| 客服 | P1 | 否 | `template/admin/src/pages/kefu` | 独立后台模块 | 先删 |
| 统计大屏/图表演示 | P1 | 否 | `template/admin/src/pages/statistic`、`router/modules/echarts.js` | 非核心验收 | 先删 |
| 代理商/事业部高级管理 | P2 | 部分不需要 | `template/admin/src/pages/agent`、`division` | 基础二级分销必须保留，不能整体删除 | 需二次依赖排查 |
| 设置/系统/权限 | P3 | 是 | `template/admin/src/pages/system`、`setting` | 后台运行基础能力，不能先删 | 先保留 |

## 后端 API、服务与模型候选

| 功能名称 | 分级 | 当前 MVP 是否需要 | 候选路径 | 删除风险 | 推荐动作 |
| --- | --- | --- | --- | --- | --- |
| 用户、商品、订单、支付、微信 | P0 | 是 | `app/api/controller/v1/user`、`store`、`order`、`wechat`、`services/pay`、`services/order` | MVP 主链路 | 先保留 |
| 支付回调、订单支付成功、佣金生成 | P0 | 是 | `PayController`、`NotifyListener`、`PayNotifyServices`、`StoreOrderSuccessServices`、`StoreOrderTakeServices` | 删除会破坏支付闭环 | 先保留 |
| 测评记录 | P0 | 是 | `app/api/controller/v1/education`、`app/adminapi/controller/v1/education`、`services/education` | 测评 MVP 核心 | 先保留 |
| 签到基础链路 | P0 | 是 | 签到、积分流水、用户积分相关服务 | 用户明确要求保留，且可能支撑成长激励 | 先保留 |
| 会员基础链路 | P0 | 是 | 会员、用户等级、会员权益相关服务 | 用户明确要求保留 | 先保留 |
| 活动营销 | P1 | 否 | `app/api/controller/v1/activity`、活动相关 services/model/dao | 可能被商品详情活动态引用 | 先删 |
| 后台营销路由 | P1 | 否 | `app/adminapi/route/marketing.php`、`live.php` | 删除前需同步菜单权限 | 先删 |
| CMS/Diy | P1 | 否 | `app/adminapi/route/cms.php`、`diy.php`、相关 services/model/dao | 后台装修和内容模块 | 先删 |
| 客服 API | P1 | 否 | `app/kefuapi`、`app/adminapi/controller/v1/kefu` | 独立模块，但可能有后台菜单引用 | 先删 |
| 外部开放 API | P1 | 否 | `app/outapi` | 与 MVP 主链路无关 | 先删 |
| 优惠券营销 | P1 | 否 | coupon 相关 services/model/route | 订单可能仍有 coupon 字段，后端物理删除需谨慎 | 先删 |
| 积分商城玩法 | P1 | 否 | points mall 相关 services/model/route | 只删商城玩法，不删积分账户和积分流水 | 先删 |
| 代理商/事业部/员工分佣 | P2 | 部分不需要 | `app/adminapi/route/agent.php`、agent/division 相关 controller/services/model | 基础 spread/brokerage 必须保留 | 需二次依赖排查 |
| 门店、商家、核销、物流扩展 | P2 | 暂不需要 | merchant、freight、store staff、offline/writeoff 相关模块 | 商品订单可能引用配送和门店配置 | 需二次依赖排查 |
| 数据库表与迁移 | P3 | 后置 | `upgrade/versions`、install SQL、已有业务表 | 直接删表风险最高 | 后置处理 |
| vendor、核心框架、官方安装升级 | P3 | 是 | `vendor`、`install`、`upgrade`、ThinkPHP 核心配置 | 删除会破坏运行或升级 | 先保留 |

## 静态构建产物与本地运行产物

| 功能名称 | 分级 | 当前 MVP 是否需要 | 候选路径 | 删除风险 | 推荐动作 |
| --- | --- | --- | --- | --- | --- |
| H5 构建产物 | P3 | 可再生成 | `dist`、`crmeb/public/h5` | 若用于部署，需要先确认交付方式 | 后置处理 |
| 小程序预览构建产物 | P3 | 需确认 | `crmeb/public/statics/mp_view`、`template/uni-app/dist` | 可能用于后台预览或交付导入 | 后置处理 |
| CRMEB runtime/log/install.lock | P3 | 否 | `crmeb/runtime`、`public/install.lock`、日志文件 | 本地运行产物，不应提交 | 后置处理 |
| Docker MySQL 数据 | P3 | 否 | `help/docker/mysql` | 本地数据库，不应提交 | 后置处理 |

## 推荐执行顺序

1. 先冻结 P0 清单，确认支付、订单、分销、佣金、测评、签到、会员全部在保留名单。
2. 第一轮只处理 P1 的前端入口和页面：活动营销、CMS、DIY、客服、outapi 对应前端页面。
3. 第二轮处理 P1 后端路由和服务，但每删一个模块都要先跑构建和核心接口冒烟。
4. 第三轮处理 P2：代理商/事业部、门店核销、地址发票余额等，需要逐项做依赖搜索。
5. 最后处理 P3：数据库表、构建产物、安装升级脚本和深层框架文件。

## 验收与回归要求

文档生成后先做静态检查：

```bash
git diff --check
```

后续真正执行瘦身前，至少回归：

```bash
npm run build
```

小程序端：

```bash
cd src/CRMEB/CRMEB-master/template/uni-app
npm run build:mp-weixin
```

Docker 后台验证：

```bash
docker start crmeb-local
docker exec -w /var/www/crmeb crmeb-local php think clear
curl -i http://127.0.0.1:8080/adminapi/auth
```

业务回归清单：

- 微信小程序登录可用。
- 训练营商品可见，商品详情可打开。
- 能创建订单并发起微信支付。
- 支付回调后订单可变为已支付。
- 确认收货后一级、二级佣金记录可生成。
- 后台可查看用户、订单、商品、测评、分销、佣金。
- 签到入口、签到成功、签到记录可用。
- 会员中心、会员状态、会员权益展示可用。

## 明确保留原则

- 签到和会员是 MVP 保留功能，后续瘦身不得删除相关入口、接口、后台页面和基础数据链路。
- 积分商城可以作为删除候选，但签到依赖的积分账户、积分流水、积分展示必须先保留。
- 分销模块不能整体删除，只能拆分基础二级分销/佣金与高级代理商/事业部。
- 支付、订单状态机、佣金生成规则不在瘦身第一阶段修改。
- 当前阶段只产出候选清单，不执行代码删除。

