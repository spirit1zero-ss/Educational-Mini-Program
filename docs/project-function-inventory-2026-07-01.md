# 项目功能清单审查

审查日期：2026-07-01

## 一、项目范围

本仓库当前包含两条主要产品线：

- `homepage-home-v1/miniprogram`：面向家长/学生的微信小程序，主题是“21天自主学习训练营”，包含首页转化、测评、会员、推广、收益与订单等功能。
- `src/CRMEB/CRMEB-master`：基于 CRMEB 的后端、管理后台、移动端/PC 端模板与商城基础能力，并在其上扩展了教育测评与小程序训练营相关接口。

## 二、微信小程序功能

### 1. 首页与训练营转化

- 首页展示“自主学习训练营”定位。
- 展示三大能力方向：学科开窍、学习习惯、内驱力。
- 提供三个测评/工具入口：
  - 一张图让孩子学科开窍。
  - 一张图让家长读懂孩子心。
  - 一张图养成作业好习惯。
- 提供训练营报名/查看训练营入口。
- 支持从分享参数中读取推荐人 UID，用于后续推荐绑定。

对应页面：

- `pages/home/home`
- `pages/module-5-camp/module-5-camp`

### 2. 学科开窍模块

- 提供“学科性格开窍法”相关入口。
- 支持模块 A 测评。
- 根据用户选择生成测评结果。
- 结果类型覆盖 A-F 六类，包括语数英均衡、数学突破、创造型潜质、文科学习天赋、逻辑细腻、表达力突出等方向。
- 结果页展示能力解读、学科建议与训练营引导。

对应页面与数据：

- `pages/module-a-assessment/module-a-assessment`
- `pages/module-a-result/module-a-result`
- `utils/module-a-results.js`

### 3. 学习习惯模块

- 提供“SOP 高效作业法”入口。
- 提供作业流程规范表格展示与下载。
- 支持下载/打开 `SOP高效作业流程规范表格.docx`。

对应页面与资源：

- `pages/module-b-table/module-b-table`
- `assets/module-b-table/sop-homework-table.docx`
- `assets/module-b-table/sop-homework-table.png`

### 4. 内驱力/读懂孩子心模块

- 提供“慧眼读心赋能法”相关入口。
- 支持模块 B 测评。
- 包含两种测评形态：
  - 标准选择式测评。
  - 图片/卡片式快速选择测评。
- 根据选择生成 A-F 六类结果。
- 结果页展示三层内心线索、读心解读、建议行动。

对应页面与数据：

- `pages/module-b-assessment/module-b-assessment`
- `pages/module-b-inline/module-b-inline`
- `pages/module-b-result/module-b-result`
- `utils/module-b-results.js`

### 5. 模块 2-5 内容页

- 模块 2：逻辑/学科开窍内容页。
- 模块 3：学习习惯内容页。
- 模块 4：内驱力内容页。
- 模块 5：21 天训练营详情页。

对应页面：

- `pages/module-2-logic/module-2-logic`
- `pages/module-3-habit/module-3-habit`
- `pages/module-4-drive/module-4-drive`
- `pages/module-5-camp/module-5-camp`

### 6. 我的页面与会员状态

- 展示用户训练营会员状态。
- 展示会员 UID、会员到期时间、训练营权益文案。
- 展示训练营会员计划、价格与报名 CTA。
- 展示推广数据概览：邀请数、订单数、收益金额、海报数量。
- 提供会员开通/训练营报名入口。
- 提供兑换码入口，前端有调用封装，后端当前仍提示“未配置”。
- 默认支持前端 mock 数据回退，便于无后端时演示。

对应页面与接口封装：

- `pages/mine/mine`
- `api/mine.js`
- `utils/mock-miniapp.js`
- `config/api.js`

### 7. 推广海报

- 会员可生成训练营推广海报。
- 海报包含训练营卖点、价格、推荐人 UID、报名二维码占位/后端二维码。
- 支持 Canvas 绘制海报。
- 支持保存海报到相册。
- 支持微信分享给好友和分享到朋友圈。

对应页面：

- `pages/promo-poster/promo-poster`

### 8. 邀请记录

- 展示会员推荐 UID。
- 展示累计邀请、已报名、预计奖励等汇总。
- 支持查看邀请记录列表。
- 支持按状态筛选待转化/已报名。
- 支持从后端加载邀请数据，失败时保留本地示例数据。
- 支持跳转生成推广海报。

对应页面：

- `pages/invite-records/invite-records`

### 9. 我的收益

- 展示推广奖励汇总：可提现、待结算、已到账。
- 展示收益明细、提现记录、到账记录。
- 支持按收益状态筛选。
- 支持从后端加载会员佣金数据。
- 提现按钮当前为“接口待接入”提示。

对应页面：

- `pages/my-income/my-income`

### 10. 训练营订单

- 展示训练营订单汇总：累计订单、已支付、实付金额。
- 展示订单列表、订单号、报名人、手机号、下单时间、实付金额。
- 支持按订单状态筛选。
- 支持跳转训练营详情。
- 后端训练营订单接口当前返回空列表，前端保留本地示例数据。

对应页面：

- `pages/camp-orders/camp-orders`

### 11. 公共组件与体验能力

- 自定义导航栏。
- 自定义底部 tab。
- 选择卡片组件。
- 粘性底部操作栏。
- Vant Weapp 组件依赖。
- 小程序请求封装、登录态 token 存储、401 自动重登。
- 前端 mock 开关与 API base URL 本地配置。

对应目录：

- `components/custom-nav`
- `components/choice-card`
- `components/sticky-action`
- `utils/request.js`
- `config/api.js`

## 三、小程序后端接口功能

### 1. 登录与推荐人绑定

- 小程序登录：`POST /api/miniapp/auth/login`
- 使用微信 `wx.login` code 换取后端 token。
- 支持传入推荐人 UID。
- 若推荐人是有效训练营会员，则记录待绑定推荐关系。

对应代码：

- `app/api/controller/v1/miniapp/AuthController.php`
- `app/services/miniapp/MiniappServices.php`

### 2. 我的页面汇总

- 我的页汇总：`GET /api/miniapp/mine/overview`
- 返回会员状态、训练营计划、价格、报名按钮文案、推广汇总。
- 根据用户是否为训练营会员返回不同权益与推广状态。

对应代码：

- `app/api/controller/v1/miniapp/MineController.php`
- `app/services/miniapp/MiniappServices.php`

### 3. 训练营会员计划与下单

- 会员计划列表：`GET /api/miniapp/training-camp/member-plans`
- 训练营会员订单创建：`POST /api/miniapp/training-camp/member-order`
- 会员计划复用 CRMEB 付费会员类型。
- 订单创建复用 CRMEB 其他订单/付费会员订单能力。
- 当前返回“订单已创建，支付将在下一步接入”，支付闭环仍需继续完善。

### 4. 推广海报与二维码

- 生成推广海报数据：`POST /api/miniapp/referral/poster`
- 仅训练营会员可调用。
- 返回会员 UID、二维码地址、分享路径、scene 参数。
- 二维码能力复用 CRMEB 二维码服务。

### 5. 邀请记录

- 邀请记录：`GET /api/miniapp/referral/invites`
- 仅训练营会员可调用。
- 支持一级/二级推荐关系。
- 包含已报名用户和待转化推荐锁定记录。
- 返回邀请汇总、分销层级、列表和总数。

### 6. 收益记录

- 收益记录：`GET /api/miniapp/referral/income`
- 仅训练营会员可调用。
- 查询会员佣金类型：
  - 一级会员佣金。
  - 二级会员佣金。
- 返回总收益、可用收益、收益明细、结算状态。

### 7. 兑换码

- 兑换码使用：`POST /api/miniapp/redeem-code/use`
- 接口入口已存在。
- 服务层当前明确返回“兑换码后端未配置”，属于待完善功能。

### 8. 训练营订单列表

- 训练营订单列表：`GET /api/miniapp/training-camp/orders`
- 接口入口已存在。
- 服务层当前返回空列表，属于待完善功能。

## 四、教育测评后端与管理功能

### 1. 测评记录提交

- 用户端提交测评记录：`POST /api/education/assessment_records`
- 支持提交分数、结果文本、答案 JSON。
- 后端进行参数校验后保存用户测评数据。

对应代码：

- `app/api/controller/v1/education/AssessmentRecordController.php`
- `app/services/education/EducationAssessmentRecordServices.php`

### 2. 管理后台测评记录

- 后台菜单：教育 > 测评记录。
- 支持按 UID、昵称、手机号、提交时间筛选。
- 支持分页查看测评记录。
- 支持查看测评详情。
- 详情页展示用户、手机号、分数、结果、提交时间、结果摘要、标签、答案明细。

对应代码：

- `template/admin/src/router/modules/education.js`
- `template/admin/src/pages/education/assessmentRecord/index.vue`

## 五、CRMEB 管理后台功能

当前管理后台保留并可见的功能模块包括：

- 主页。
- 教育：测评记录。
- 用户：用户管理、用户等级、用户分组、用户标签、会员类型、卡密会员、会员记录、会员权益、会员卡列表、会员协议。
- 商品：商品管理、商品分类、商品添加、商品评论、商品规格、商品参数、商品标签、商品保障。
- 订单：订单管理、售后订单、配货单打印。
- 营销：积分记录、积分统计、签到配置、签到奖励、会员配置。
- 分销：分销员管理、分销员申请。
- 财务：账单记录、资金流水、提现申请、充值记录、资金记录、佣金记录、余额记录。
- 统计：商品统计、用户统计、交易统计、积分统计、订单统计、余额统计。
- 设置：身份管理、管理员列表、权限规则、系统设置、基础分销配置、会员等级、消息开关、消息管理。
- 系统：代码生成、数据字典、接口管理、附件管理、刷新缓存、系统日志、文件校验、清除数据、数据备份、文件管理、配置分类、组合数据、商业授权、在线升级、跨版本升级、定时任务、自定义事件、权限规则。
- CRUD：通用增删改查页面。

## 六、CRMEB 原生商城能力

根据 CRMEB 项目说明和保留代码结构，本项目仍包含以下原生商城能力：

- 多端商城：公众号、小程序、H5、APP、PC。
- 商品体系：商品、分类、规格、参数、标签、保障、评论。
- 购物与订单：购物车、下单、支付、售后、退款、配送/打印。
- 用户体系：登录注册、个人中心、用户资料、地址、等级、标签、分组。
- 会员体系：付费会员、等级会员、会员权益、会员协议、会员卡密、会员订单。
- 营销体系：拼团、砍价、秒杀、优惠券、积分、签到、新人礼、充值、直播带货、分销裂变、渠道码等 CRMEB 原生模块。
- 财务体系：余额、账单、资金流水、佣金、提现、充值。
- 统计体系：商品、用户、交易、积分、订单、余额等统计。
- 系统运维：权限、管理员、配置、接口管理、代码生成、数据字典、文件管理、日志、缓存、备份、定时任务、事件扩展、在线升级。
- 基础设施：ThinkPHP 后端、Vue2/ElementUI 管理端、UniApp 移动端模板、PC 端模板、Redis/队列/Workerman/云存储/短信/物流等扩展能力。

## 七、当前明显待完善项

- 小程序兑换码：前端和接口入口已存在，后端业务未配置。
- 小程序训练营订单列表：接口入口已存在，后端当前返回空列表。
- 训练营会员订单支付闭环：当前能创建会员订单，但支付下一步仍标记为待接入。
- 推广海报二维码：后端可返回小程序码，前端仍保留占位图和本地绘制逻辑。
- 邀请奖励提现：前端有提现入口，当前提示“提现接口待接入”。
- 小程序部分页面仍有静态示例数据和 mock 回退，需要根据真实后端数据继续收口。
- `docs` 目录当前在工作区中显示大量历史文档删除记录，本次审查仅新增本清单，没有恢复或覆盖历史文档。

## 八、主要审查依据

- 小程序页面清单：`homepage-home-v1/miniprogram/app.json`
- 小程序接口封装：`homepage-home-v1/miniprogram/api/mine.js`
- 小程序请求与 mock：`homepage-home-v1/miniprogram/utils/request.js`、`homepage-home-v1/miniprogram/utils/mock-miniapp.js`
- 小程序测评结果：`homepage-home-v1/miniprogram/utils/module-a-results.js`、`homepage-home-v1/miniprogram/utils/module-b-results.js`
- 小程序 API 路由：`src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php`
- 小程序后端服务：`src/CRMEB/CRMEB-master/crmeb/app/services/miniapp/MiniappServices.php`
- 教育测评后端：`src/CRMEB/CRMEB-master/crmeb/app/api/controller/v1/education/AssessmentRecordController.php`
- 管理后台路由：`src/CRMEB/CRMEB-master/template/admin/src/router/modules`
- CRMEB 项目说明：`src/CRMEB/CRMEB-master/README.md`
