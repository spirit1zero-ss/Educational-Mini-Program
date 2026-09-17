# Education System · 教育训练营系统

面向教育训练营的微信小程序与管理后台项目，基于 CRMEB / ThinkPHP 和 Vue 扩展，覆盖课程内容展示、报名、会员权益、兑换码及邀请关系等业务。

This repository contains a CRMEB-based education application with a WeChat mini-program, a PHP backend and a Vue administration interface. It is a downstream application maintained independently of the upstream CRMEB project.

## 功能与边界

- 内容入口：课程与训练营介绍、学习资料、公开页面分享。
- 会员与报名：训练营订单、会员记录、权益及兑换码核销。
- 邀请与运营：推广海报、邀请关系、佣金记录和提现审核。
- 管理后台：会员、订单、内容配置与运营管理。
- 支付适配：微信小程序虚拟支付及相关服务端处理；需要单独申请和配置平台能力。

以上表示代码包含相应模块，不表示任意克隆即可完成真实支付、退款或提现。生产环境、平台资质、商户配置与真机验收需分别完成。项目仍在维护中，不宣称已经通过全面安全审计。

## 目录

| 路径 | 内容 |
| --- | --- |
| `homepage-home-v1/miniprogram/` | 微信原生小程序源码；日常发布通过微信开发者工具 |
| `src/CRMEB/CRMEB-master/crmeb/` | ThinkPHP 服务端、数据库结构和部署文件 |
| `src/CRMEB/CRMEB-master/template/admin/` | Vue 2 / Element UI 管理台源码 |
| `tests/` | 项目级静态契约、配置与小程序检查 |
| `tools/` | 维护与检查工具 |

当前持续开发分支为 `dev3`。其他历史分支不代表当前交付状态；部署分支、GitHub 默认分支和小程序上传包需要分别核对。

## 本地开发起点

1. 阅读 [贡献指南](CONTRIBUTING.md) 与 [公开范围](docs/open-source-scope.md)。
2. 后端使用 PHP、Composer 和独立 MySQL。仓库 Dockerfile 使用 PHP 8.3；依赖以 `composer.json` / `composer.lock` 为准。
3. 从后端 `deploy/cloudrun/environment-variables.example` 获取配置项说明，自行创建测试配置。示例值不是可用凭证，禁止接入生产数据库进行开发测试。
4. 管理台在其目录安装锁文件对应依赖，使用 `npm run dev` 或 `npm run build`。在启动前核对 API 目标，仅连接独立测试服务。
5. 小程序用微信开发者工具打开 `homepage-home-v1/`，使用自己的测试 AppID 和测试 API / 云环境。

在仓库根目录可运行基础静态检查：

```sh
node tests/miniprogram-smoke.mjs
```

该检查不覆盖真实支付、用户数据、云托管部署或微信真机行为。其他契约检查按修改范围运行，检查文件见 `tests/`。

## 安全与贡献

普通问题和改进建议可通过仓库 Issues 提交，请提供复现步骤、代码版本和脱敏日志。贡献前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。安全问题请按 [SECURITY.md](SECURITY.md) 私下报告，勿在公开 Issue 中粘贴密钥或真实用户信息。

不收录客户资料、生产数据、真实凭证或平台账号权限。历史分支与提交也属于公开范围，删除当前文件不能代替历史审查。

## 许可与来源

本项目是 CRMEB 的下游应用，不代表 CRMEB 官方，也不将上游项目的用户数、下载量或 Star 计入本项目。

源码树同时保留 CRMEB 的 Apache-2.0 `LICENSE`、服务端 `LICENSE.txt` 和管理台 MIT 声明。**尚未确认各许可文件的适用范围，暂不将整个仓库标注为统一的 Apache-2.0 或 MIT 项目。** 详情见 [第三方声明](THIRD_PARTY_NOTICES.md)。课程文案、商标、图片及其他业务素材的权利独立于代码许可。

当前没有经核实的外部采用量或下载量；维护进展以实际提交和发布记录为依据。
