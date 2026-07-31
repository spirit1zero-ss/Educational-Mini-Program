# 数据库补丁说明

本目录保留历史补丁用于审计和旧环境升级，不代表需要把所有 SQL 文件逐个导入。

## 必需基线

截图中的以下十份 SQL 全部属于项目必需基线，不能按“旧补丁”废弃：

1. `database/install/membership_level_upgrade.sql`
2. `2026-07-06-hide-points-menus.sql`
3. `2026-07-07-remove-education-assessment-admin.sql`
4. `2026-07-07-tighten-retired-admin-surface.sql`
5. `2026-07-08-training-camp-registration.sql`
6. `2026-07-10-training-camp-member-price.sql`
7. `upgrade/versions/20260701_miniapp_member_referrer_locks.sql`
8. `2026-07-16-miniapp-virtual-payment.sql`
9. `2026-07-22-training-camp-admin-cleanup.sql`
10. `2026-07-24-release.sql`

2026-07-24 已逐项核验本地数据库：上述十份补丁产生的表、配置、价格、菜单和权限均已存在。
其中本次补入了第 8、9、10 项，其余项目在本地持久化数据库中此前已经执行。

完成上述基线后，再执行：

11. `2026-07-24-admin-distribution-ui-merged.sql`
12. `2026-07-26-training-camp-distribution-refund.sql`

第 11 项是 2026-07-24 后台界面增量文件，合并了：

- 精简后台菜单：隐藏旧会员配置、无对应页面的旧协议设置和未使用的接口配置；
- 在“付费会员”下提供“分销政策”和“小程序协议”入口；
- 三份小程序协议的数据库文案和读写权限；
- 用户管理中的“分销详情”及一级、二级有效团队接口权限；
- 财务佣金页面中的训练营佣金列表和人工结算审核权限。

三份协议的初始数据库内容与小程序前端兜底文案一致。该文件不删除接口、订单、
会员、佣金或提现数据，新增菜单和权限均通过 `unique_auth` 防止重复创建。

“全部必需”不等于每次启动都重新执行。已经执行过的数据库不能强行重复运行，
尤其 `membership_level_upgrade.sql` 会新增会员等级记录，重复执行会产生重复等级。

## 合并关系

`2026-07-24-release.sql` 已合并以下五份基础补丁：

- `2026-07-23-disable-virtual-payment-reconcile-timer.sql`
- `2026-07-23-miniapp-offline-locations.sql`
- `2026-07-23-miniapp-agreements.sql`
- `2026-07-23-miniapp-withdrawal-window.sql`
- `2026-07-24-distribution-fixed-commission.sql`

同一数据库只能选择导入 `2026-07-24-release.sql`，或者分别导入上述五份原子补丁，不能两种方式都执行。
当前必需基线采用 `2026-07-24-release.sql`，不再单独导入上述五份原子补丁。

`2026-07-24-admin-distribution-ui-merged.sql` 则合并本轮后台界面所需的菜单、
协议和接口权限增量。它不是 `2026-07-24-release.sql` 的替代品；生产环境应先
导入这一项，再按顺序执行第 12 项。

`2026-07-26-training-camp-distribution-refund.sql` 必须在第 11 项之后执行，新增训练营
独立分销开关、佣金审核时间和退款账号冻结标记，以及开关接口权限；同时隐藏不再
被训练营使用的旧商城“分销启用”开关。该补丁可重复检查，不会重复增加字段、配置
或权限。

## 2026-07-26 后续增量

已完成上述基线的数据库，按需继续执行：

13. `2026-07-26-training-camp-settings.sql`
14. `2026-07-26-training-camp-quota-effective-time.sql`
15. `2026-07-26-training-camp-refund-ledger.sql`
16. `2026-07-26-training-camp-offline-refund.sql`

第 13 项补充分销固定返佣、名额、提现开关等训练营配置；第 14 项记录 M / D / H
身份生效时间，使身份名额只从生效后的新一级会员开始计算。第 15 项只迁移旧代码
已生成的训练营退款佣金流水类型，供小程序和后台显示“退款扣回”；新退款会直接
写入新类型。若线上从未产生过旧的退款扣佣流水，第 15 项不会修改任何业务记录。
第 16 项新增可审计的线下全额退款登记字段和接口权限。线下登记只记录已经实际
支付给用户的退款并冻结账号，不会代替付款，也不会在登记阶段直接撤销会员或扣佣金。

## 注意

- `membership_level_upgrade.sql` 是现有升级数据库的必需补丁；全新安装库若已由
  `crmeb.sql` 内置相同等级结构则不重复执行。
- 历史补丁文件不要删除，它们用于识别旧环境处于哪个升级阶段。
- 导入前先检查目标数据库的表、配置项和菜单权限，再确定缺失项。
- 生产环境已经执行过的补丁不要因文件内容相似而再次导入。

## 2026-07-31 银行卡人工提现

在完成上述必需基线和后续增量后，执行：

17. `2026-07-31-withdrawal-and-payment-settings.sql`

该补丁新增银行卡收款资料密文、授权、审核及付款凭证字段，增加“查看银行卡提现
资料”和“确认银行卡提现到账”权限，并同步隐私政策文案。补丁可重复检查，不会
重复添加字段或权限。部署代码前必须先导入该补丁，并在云托管以密钥方式配置
`PHP_SECURITY_BANK_DATA_KEY`（至少 32 个随机字符）；未配置时小程序会自动关闭
银行卡提现入口，防止敏感资料以明文保存。新增的
`training_camp_bank_withdraw_enabled` 开关默认关闭；只有后台主动开启且安全密钥
配置完成时，小程序才会显示银行卡选项。
