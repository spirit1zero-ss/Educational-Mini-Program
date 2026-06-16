# 2026-06-16 测评记录 MVP 模块说明

## 本次目标

新增测评记录 MVP 模块，并优先跑通 UniApp 微信小程序前端。小程序测评页设计参考此前 H5 的成长型教育风格，后端接入 CRMEB 登录鉴权与真实接口，后台提供测评记录列表和详情查看。

## 需求对照

| 需求 | 当前状态 | 说明 |
| --- | --- | --- |
| 用户可以在小程序提交一次测评记录 | 已实现，待运行态验证 | 小程序调用 `POST /api/education/assessment_records`。 |
| 字段最小化 | 已实现 | 表字段包含 `id`、`uid`、`nickname`、`mobile`、`score`、`result_text`、`answers_json`、`created_at`、`updated_at`。 |
| 后台查看列表和详情 | 已实现，待运行态验证 | 后台新增“教育 / 测评记录”页面、列表接口和详情接口。 |
| 第一版不做复杂题库管理 | 已满足 | 小程序内置 3 个 MVP 问题，没有题库管理后台。 |
| 第一版不做 AI 分析 | 已满足 | 结果由前端分数规则生成。 |
| 第一版不导出 Excel | 已满足 | 未新增导出功能。 |
| 接口需要登录鉴权 | 已实现 | 小程序接口走 CRMEB `AuthTokenMiddleware`，后台接口走后台登录中间件。 |
| SQL 必须可回滚 | 已实现 | SQL 文件包含 `-- down`，会删除本模块菜单和测评记录表。 |

## 数据库

迁移 SQL:

- `src/CRMEB/CRMEB-master/crmeb/upgrade/versions/20260616_education_assessment_records.sql`

新增表:

- `eb_education_assessment_records`

字段:

- `id`
- `uid`
- `nickname`
- `mobile`
- `score`
- `result_text`
- `answers_json`
- `created_at`
- `updated_at`

SQL 文件包含 `-- up` 和 `-- down` 两段。后台菜单使用 `unique_auth` 做幂等插入，不依赖固定菜单 ID；新插入菜单会写入 `mark = education-assessment-mvp`。回滚时只删除同时匹配本模块 `unique_auth` 和该 `mark` 的菜单数据，避免误删目标库里原本存在的菜单；随后删除 `eb_education_assessment_records` 表。

## 后端接口

小程序提交接口:

- `POST /api/education/assessment_records`
- 需要用户登录鉴权，由 CRMEB `AuthTokenMiddleware` 保护。
- `score` 允许为空；传值时必须是数字。
- `answers_json` 允许传 JSON 对象或合法 JSON 字符串，非法 JSON 会被拒绝。

后台接口:

- `GET /adminapi/education/assessment_records`
- `GET /adminapi/education/assessment_records/:id`
- 需要后台登录鉴权。

后端文件:

- `src/CRMEB/CRMEB-master/crmeb/app/model/education/EducationAssessmentRecord.php`
- `src/CRMEB/CRMEB-master/crmeb/app/dao/education/EducationAssessmentRecordDao.php`
- `src/CRMEB/CRMEB-master/crmeb/app/services/education/EducationAssessmentRecordServices.php`
- `src/CRMEB/CRMEB-master/crmeb/app/api/validate/education/AssessmentRecordValidate.php`
- `src/CRMEB/CRMEB-master/crmeb/app/api/controller/v1/education/AssessmentRecordController.php`
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/controller/v1/education/AssessmentRecord.php`
- `src/CRMEB/CRMEB-master/crmeb/app/adminapi/route/education.php`
- `src/CRMEB/CRMEB-master/crmeb/app/api/route/v1.php`

## 小程序前端

测评页面:

- `src/CRMEB/CRMEB-master/template/uni-app/pages/assessment/index.vue`

接口文件:

- `src/CRMEB/CRMEB-master/template/uni-app/api/education.js`

页面入口:

- `src/CRMEB/CRMEB-master/template/uni-app/pages.json`
- `src/CRMEB/CRMEB-master/template/uni-app/config/mvp.js`
- 首页 MVP 入口中包含“入营测评”，跳转到 `/pages/assessment/index`。

当前小程序测评页能力:

- 3 个 MVP 测评问题。
- 选择答案后实时计算分数。
- 未答完时显示“完成测评后生成画像”占位状态，避免提前给出正式结论。
- 答完后显示测评进度、当前得分、能力画像、结果标签和推荐成长方案。
- 提交时调用真实 CRMEB 接口。
- 未登录时沿用 CRMEB 小程序请求封装，自动跳转登录。
- 提交成功后显示“已保存测评记录，后台可查看本次结果”。

## 后台前端

后台路由:

- `/admin/education/assessment-records`

后台权限标识:

- `admin-education`
- `education-assessment-records`
- `education-assessment-records-index`
- `education-assessment-records-read`

后台文件:

- `src/CRMEB/CRMEB-master/template/admin/src/api/education.js`
- `src/CRMEB/CRMEB-master/template/admin/src/router/modules/education.js`
- `src/CRMEB/CRMEB-master/template/admin/src/router/routers.js`
- `src/CRMEB/CRMEB-master/template/admin/src/pages/education/assessmentRecord/index.vue`

后台页面能力:

- 按 UID、昵称、手机号、提交时间筛选。
- 查看测评记录列表。
- 打开抽屉查看测评详情、结果摘要、答案明细。
- 当答案结构不符合预期时，详情页会展示 `answers_json` 原文，便于排查数据。

## 验证结果

已通过:

- `npm run build:mp-weixin`
- 构建输出目录:
  - `src/CRMEB/CRMEB-master/template/uni-app/dist/build/mp-weixin`
- 构建产物中已确认包含:
  - `pages/assessment/index.wxml`
  - `pages/assessment/index.js`
  - `project.config.json`
  - 页面文案“当前得分”、“推荐成长方案”、“测评结果”、“提交测评记录”

已做静态检查:

- `git diff --check` 通过，仅有 Windows 换行提示。
- 已按 `help/dev-docs` 复核分层规范：用户端接口采用 Controller + Validate + Service + DAO + Model；后台采用 Controller + Service + DAO + Model；小程序 API 放在 `template/uni-app/api`，页面放在 `template/uni-app/pages`；后台 API、路由和页面分别放在 `template/admin/src/api`、`template/admin/src/router/modules`、`template/admin/src/pages`。
- CRMEB 小程序请求封装会在未登录时自动跳登录，提交接口符合登录鉴权要求。
- CRMEB 后台请求封装返回结构与新增列表页 `res.data.list/count` 读取方式匹配。

已完成运行态验证:

- 已通过 Docker 启动本地 CRMEB 后端容器，访问地址为 `http://127.0.0.1:8080`。
- `GET /api/products` 返回 200，确认 CRMEB 后端可用。
- 测评接口未登录时返回 `{"status":401,"msg":"请登录"}`，确认用户端登录鉴权生效。
- 已创建一次性测试用户，通过 `POST /api/login` 获取用户 token。
- 已带用户 token 调用 `POST /api/education/assessment_records`，返回 200 且生成测评记录 `id=2`。
- 已查询 `eb_education_assessment_records`，确认测试记录真实入库。
- 后台接口未登录时返回 `{"status":401,"msg":"登录已过期,请重新登录"}`，确认后台登录鉴权生效。
- 已创建一次性测试管理员，通过 `POST /adminapi/login` 获取后台 token。
- 已带后台 token 调用 `GET /adminapi/education/assessment_records`，返回 200，列表包含 2 条测试记录。
- 已带后台 token 调用 `GET /adminapi/education/assessment_records/2`，返回 200，详情包含 `answers` 解码结构。

当前剩余说明:

- 后台前端 `template/admin` 的本地构建仍未验证；此前 `npm ci --prefer-offline --cache .npm-cache` 240 秒超时且未生成 `node_modules`，联网安装授权曾超时。
- 小程序构建通过，但 CRMEB 原项目仍输出若干既有 warning，包括部分导出缺失提示和 Sass deprecation；这些 warning 未阻断本次测评页构建。

## 手动验收步骤

1. 执行 SQL 的 `-- up` 部分。
2. 启动 CRMEB 后端服务。
3. 构建小程序:

```bash
cd src/CRMEB/CRMEB-master/template/uni-app
npm run build:mp-weixin
```

4. 微信开发者工具导入:

```text
C:\Users\lenovo\Documents\Education System\src\CRMEB\CRMEB-master\template\uni-app\dist\build\mp-weixin
```

5. 打开页面:

```text
pages/assessment/index
```

6. 登录用户后提交一次测评。
7. 打开后台:

```text
/admin/education/assessment-records
```

8. 确认列表出现记录，并能查看答案详情。

如需回滚，执行 SQL 的 `-- down` 部分。

## 接口联调示例

用户端提交测评记录:

```bash
curl -X POST "http://127.0.0.1:8080/api/education/assessment_records" \
  -H "Content-Type: application/json" \
  -H "Authori-zation: Bearer <USER_TOKEN>" \
  -d "{\"score\":80,\"result_text\":\"稳定成长型\",\"answers_json\":{\"result\":{\"title\":\"稳定成长型\",\"text\":\"孩子已有不错的自主学习基础\",\"tags\":[\"专注力稳定\"]},\"answers\":[{\"question_id\":\"focus\",\"question\":\"孩子完成学习任务时的专注状态更接近哪一种？\",\"answer\":\"能稳定完成\",\"value\":\"stable\",\"score\":30}]}}"
```

后台列表:

```bash
curl "http://127.0.0.1:8080/adminapi/education/assessment_records?page=1&limit=20" \
  -H "Authori-zation: Bearer <ADMIN_TOKEN>"
```

后台详情:

```bash
curl "http://127.0.0.1:8080/adminapi/education/assessment_records/<ID>" \
  -H "Authori-zation: Bearer <ADMIN_TOKEN>"
```
