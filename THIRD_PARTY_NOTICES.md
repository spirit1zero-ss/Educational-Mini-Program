# 第三方来源与许可记录

核对日期：2026-09-17。本文件记录仓库现状，不替代原许可证，不授予第三方代码或素材的新权利。

| 组件 | 本地声明 | 审查结论 |
| --- | --- | --- |
| CRMEB 主源码 | `src/CRMEB/CRMEB-master/LICENSE` | Apache License 2.0；保留原文 |
| CRMEB 服务端 | `src/CRMEB/CRMEB-master/crmeb/LICENSE.txt` | 独立的软件使用许可文本，包含保留标识等条款；与上层 Apache 文件的适用边界待核实 |
| 管理台基础 | `src/CRMEB/CRMEB-master/template/admin/LICENSE` | MIT，原版权标注 iView；保留原文 |
| PHP / npm 依赖 | 各锁文件及依赖自己的许可证 | 未逐包完成再分发许可审核；不将 vendor/node_modules 整体打包为项目自有代码 |
| 字体、课程、图片、商标 | 各素材来源与授权 | 不因代码公开而自动授权；无法确认权利的素材排除在新公开包之外 |

CRMEB 上游：https://github.com/crmeb/CRMEB

公开发布前需要核实所用 CRMEB 版本及服务端附加许可适用范围，并确认自有增量代码和业务素材的权属。禁止通过删除许可文件、版权标识或更换统一 LICENSE 来掩盖未确认的许可范围。
