# 2026-07-07 后台教育测评模块拆除记录

本次只拆除后台教育测评管理模块，不删除小程序端静态测评页面。

## 已拆除范围

- 后台菜单路由：`template/admin/src/router/modules/education.js`
- 后台页面：`template/admin/src/pages/education/assessmentRecord/index.vue`
- 后台 API 封装：`template/admin/src/api/education.js`
- 后台管理接口：`app/adminapi/route/education.php`
- 后台测评记录控制器：`app/adminapi/controller/v1/education/AssessmentRecord.php`
- 用户端测评记录保存接口：`POST /api/education/assessment_records`
- 测评记录保存接口相关 controller / validate / service / dao / model
- 教育测评安装脚本：`upgrade/versions/20260616_education_assessment_records.sql`

## 保留范围

- 小程序测评页面仍保留：
  - `homepage-home-v1/miniprogram/pages/module-a-assessment`
  - `homepage-home-v1/miniprogram/pages/module-b-assessment`
- 小程序跳转测评页面的入口仍保留。
- 现有数据库表 `eb_education_assessment_records` 暂不删除，避免误删历史数据。

## 数据库处理

新增补丁：

- `src/CRMEB/CRMEB-master/crmeb/database/patches/2026-07-07-remove-education-assessment-admin.sql`

补丁会把后台教育测评菜单和权限行标记为 `is_del = 1`，同时隐藏 `is_show` / `is_show_path`。

## 后续慢删除

上线稳定后，如果确认不需要历史测评记录，再考虑删除：

- `eb_education_assessment_records` 表
