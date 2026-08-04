# 自主学习训练营品牌规范

## 品牌方向

- 名称：自主学习训练营
- 图形：打开的书本、向上的学习路径、新芽和暖金色成长弧
- 深绿：`#183327`
- 成长绿：`#21A75A`
- 暖金：`#D6A64A`
- 米白：`#F8FAF4`

图形由项目专用的原创概念生成，再统一裁切、去底和输出多种规格。原始透明概念稿为
`growth-learning-concept-mark.png`，生产资源由 `tools/generate_brand_assets.py`
生成。不要手工分别覆盖各尺寸，否则容易导致后台和头像版本不一致。
运行脚本后还必须在 `src/CRMEB/CRMEB-master/template/admin` 执行生产构建，并用
完整 `dist` 替换 `crmeb/public/admin`；云托管不会代替本地完成 Vue 构建。

## 修改边界

本次只替换后台对运营人员可见的业务品牌：站点名称、登录宣传图、Logo、默认头像、
浏览器图标和 PWA 信息。小程序已提交并通过审核，明确排除在本次品牌修改范围之外。

以下内容必须保留：CRMEB 的 LICENSE 和源码版权头、后台底部官方版权链接、授权接口、
PHP 命名空间、目录、数据库表名及前缀、Composer/NPM 内部包名，以及微信云托管服务名
`crmeb-api`。后者直接参与小程序接口路由，只有先迁移云服务后才能改名。

## 概念生成提示词

> Original minimalist education brand mark for a Chinese self-directed learning camp: an open book forming a forward path, a centered sprout growing upward, and a restrained warm-gold arc suggesting progress and companionship. Deep forest green, fresh growth green, warm gold; geometric, balanced, friendly but professional, no letters, no text, no gradients, no shadows, solid chroma background for clean removal, legible at 32 px.
