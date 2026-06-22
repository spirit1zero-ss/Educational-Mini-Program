# CRMEB MVP 瘦身：后台商品新增编辑页优惠券入口收口审计

日期：2026-06-18

## 目标

继续执行 MVP 软瘦身，只隐藏后台商品新增/编辑页中的优惠券玩法入口并增加前端兜底，不删除代码、不改商品保存接口、不影响商品、订单、支付、二级分销、佣金、签到和会员核心能力。

本阶段聚焦上一轮后台商品列表收口后仍存在的商品编辑页残留入口：

- 商品类型中的优惠券商品。
- 商品营销设置中的购买送优惠券。
- 单规格/多规格中的选择优惠券。
- 会员价/佣金页中随优惠券商品出现的选择优惠券分支。

## 本次调整

### 商品新增编辑页父组件

位置：

- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/index.vue`

处理：

- MVP 模式下传给基础信息组件的商品类型列表过滤 `id=2` 的优惠券商品。
- MVP 模式下不挂载通用优惠券选择弹窗和商品规格优惠券选择弹窗。
- `virtualbtn()` 增加优惠券商品兜底拦截。
- `addCoupon()`、`addGoodsCoupon()`、`see()` 增加 MVP 兜底提示，避免隐藏入口外的内部调用继续打开优惠券选择。

### 规格库存组件

位置：

- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/components/SpecStock.vue`

处理：

- 新增 `isMvpMode` 入参。
- MVP 模式下隐藏单规格/多规格的选择优惠券按钮和已选优惠券查看入口。
- 保留卡密/网盘商品的添加卡密入口。

### 会员价/佣金组件

位置：

- `src/CRMEB/CRMEB-master/template/admin/src/pages/product/productAdd/components/PriceCommission.vue`

处理：

- MVP 模式下隐藏优惠券商品相关的选择优惠券分支。
- 保留佣金设置，继续支持基础二级分销金额配置。

## 保留能力

本次不影响：

- 普通商品新增和编辑。
- 卡密/网盘商品入口。
- 虚拟商品入口。
- 商品规格、库存、价格、商品详情、物流设置。
- 商品佣金设置。
- 后台商品列表查看。
- 微信支付、支付回调、订单状态机。
- 二级分销和佣金查看。
- 签到和会员核心入口。

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
- 登录后进入商品新增页，确认商品类型中不显示优惠券商品。
- 进入普通商品编辑/新增的营销设置，确认购买送优惠券不显示。
- 进入规格库存，确认优惠券商品相关的选择优惠券入口不显示。
- 确认普通商品、卡密/网盘商品、虚拟商品仍可进入编辑流程。

## 风险点

- 本阶段只隐藏后台前端入口；商品接口如果返回历史优惠券商品数据，当前不做物理清理。
- 真正删除优惠券商品能力前，还需要排查商品规格、优惠券选择组件、营销 API、历史商品数据和数据库字段。
- 积分底层能力需要保留给签到链路，本阶段不删除积分相关字段或接口。
