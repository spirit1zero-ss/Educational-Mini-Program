# CRMEB MVP 瘦身 dev3 交接文档

## 交接目的

用户需要切换到另一台电脑继续开发。本分支用于把当前本地项目状态交接给另一台电脑上的 Codex。

新分支：

- `dev3`

当前工作重点：

- 只做 CRMEB MVP 软瘦身。
- 每跑一轮必须停下来让用户确认，再进行下一轮。
- 当前阶段不物理删除代码、不改支付、不破坏订单状态机。

## 另一台电脑接手方式

```powershell
git fetch origin
git checkout dev3
```

如果本地没有 `dev3`：

```powershell
git fetch origin
git checkout -b dev3 origin/dev3
```

## 当前上下文

最新交接提交：

- `13a3a55a fix: hide MVP diy coupon config entries`

该提交之前，项目已多轮完成 MVP 软瘦身，主要方向是隐藏或拦截非 MVP 入口，而不是删除文件。

重要规则：

- 保留签到功能。
- 保留会员功能。
- 保留用户、商品、订单、微信支付、支付回调、二级分销、佣金、测评、后台核心查看。
- 不重写支付。
- 不破坏订单状态机。
- 不做批量物理删除。
- 每一轮只处理一个明确范围，提交并推送后等待用户确认。

## 已完成的瘦身方向

已完成多轮软瘦身，覆盖范围包括：

- 用户侧可选入口隐藏。
- 旧版用户 DIY 可选入口隐藏。
- 结算页可选能力入口隐藏。
- 后端可选用户路由拦截。
- 线下门店/核销/线下支付相关路由拦截。
- 高级分销/代理商/事业部相关路由拦截。
- 移动端商家管理路由拦截。
- 移动端 DIY 公共接口拦截，同时保留签到相关接口。
- 客服、kefuapi 相关路由拦截。
- 后台首页高级入口隐藏。
- 后台商品、用户营销入口隐藏。
- 后台商品新增编辑页优惠券入口隐藏。
- 后台用户详情优惠券页签隐藏。
- 后台 DIY/装修优惠券配置入口隐藏。

相关审计文档都在 `docs/2026-06-18-mvp-slimming-*.md`。

## 最近一轮具体改动

最近一轮是后台 DIY/装修优惠券配置收口：

- `src/CRMEB/CRMEB-master/template/admin/src/components/mobileConfig/c_custom_component.vue`
  - MVP 模式下过滤自定义组件 `selectType` 里的 `coupon`。
  - 历史数据如果选中 `coupon`，降级为 `user`。
  - 不再展示优惠券数据源、优惠券选择器和优惠券筛选条件。
- `src/CRMEB/CRMEB-master/template/admin/src/components/mobilePage/home_custom_component.vue`
  - MVP 模式下历史 `coupon` 自定义组件降级预览。
  - `fetchCouponList()` 增加兜底，不再请求优惠券列表。
- `src/CRMEB/CRMEB-master/template/admin/src/pages/setting/devise/diyIndex.vue`
  - MVP 模式下左侧组件面板过滤独立优惠券组件。

审计文档：

- `docs/2026-06-18-mvp-slimming-admin-diy-coupon-config-audit.md`

## 下一轮建议

下一轮建议不要扩大范围，优先处理一个明确的小点：

### 建议下一轮：商品详情响应里的优惠券字段

在 Docker 验证时发现：

- `GET http://127.0.0.1:8080/api/product/detail/1`
- 返回 `status:200`
- 但响应数据中仍包含历史 `coupons` 字段。

建议下一轮先定位商品详情接口生成 `coupons` 的位置，在 MVP 模式下最小改动处理：

- 不影响商品详情打开。
- 不影响创建订单。
- 不影响会员价、商品规格、库存。
- 不影响订单、支付、支付回调、佣金。
- 只在 `enable_coupon=false` 时隐藏或置空商品详情响应中的优惠券数据。

注意：这可能涉及后端商品详情服务，不要顺手删除优惠券服务或数据库字段。

## 本地验证命令

后台前端构建：

```powershell
cd src/CRMEB/CRMEB-master/template/admin
npm run build
```

Docker 后端清缓存：

```powershell
docker exec -w /var/www/crmeb crmeb-local php think clear
```

核心接口回归：

```powershell
curl.exe -i --max-time 20 http://127.0.0.1:8080/api/product/detail/1
curl.exe -i --max-time 20 http://127.0.0.1:8080/adminapi/marketing/coupon/released
```

期望：

- 商品详情接口返回 `HTTP/1.1 200 OK`，JSON `status:200`。
- 后台优惠券接口返回 `{"status":400,"msg":"MVP module disabled"}`。

代码检查：

```powershell
git diff --check
git status --short --branch
```

## 已知非阻塞提示

后台 `npm run build` 当前会出现既有警告：

- `mini-css-extract-plugin` CSS 顺序警告。
- 资源体积超过推荐限制。
- `Browserslist` 数据较旧。

这些警告在当前多轮瘦身前后都存在，只要构建退出码为 0，不视为本轮失败。

Git 可能提示：

- `LF will be replaced by CRLF`
- `There are too many unreachable loose objects`

前者是 Windows 换行提示；后者是仓库维护提示。除非用户明确要求，不要在瘦身轮次里做仓库清理。

## 交接给下一位 Codex 的工作方式

1. 先读本文件和最近一轮对应审计文档。
2. 每轮只选一个小范围。
3. 改动前先定位文件和现有逻辑。
4. 优先使用已有 `mvp` 配置开关。
5. 做软隐藏或软拦截，不做物理删除。
6. 必须跑本地验证命令。
7. 新增或更新对应 docs 审计文档。
8. 提交并推送后停下，等用户确认下一轮。

## 不要误删的功能

这些是 MVP 保留能力：

- 微信小程序登录。
- 后台用户列表。
- MVP 首页入口。
- 训练营商品与商品详情。
- 创建订单。
- 微信支付。
- 支付回调。
- 订单变为已支付。
- 二级分销关系绑定。
- 二级佣金记录生成。
- 后台用户、订单、商品、测评、分销、佣金查看。
- 签到。
- 会员。

## 关键风险

- CRMEB 原始模块耦合较深，很多优惠券、余额、积分、门店、分销高级能力会通过商品、用户、订单服务间接出现。
- 物理删除前必须做依赖排查，不要直接删目录。
- 商品详情接口仍可能带出历史营销字段，这是下一轮候选，但要小心不要影响普通商品购买链路。
- 分销模块不能整体删除，只能区分基础二级分销/佣金和高级代理商/事业部。
- 签到可能依赖积分底层流水，不能直接删除积分底层能力。
