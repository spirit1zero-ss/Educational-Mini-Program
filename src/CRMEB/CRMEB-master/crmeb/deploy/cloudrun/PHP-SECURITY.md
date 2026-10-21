# PHP 8.3.36 安全修复

## 当前方案

保持 PHP 8.3、Debian Bookworm、Apache mod_php、80 端口；使用已可用的官方修复镜像并固定 digest：

```
php:8.3.36-apache-bookworm@sha256:3bf3200166b7c3236ee7b33243c794f72c650980161bfb3c9ede9d94e2b04615
```

2026-10-21 17:22 UTC 直接核查 Docker Hub registry：

- linux/amd64 manifest：sha256:6c7f5be7c3ca808b110da2175165f3c230c7c48d757494d03cb2cc057572d13f
- linux/arm64/v8 manifest：sha256:04959633f910b273cdc2c93e9b374acc425aeba991513c128be98e313fd13582
- 两个平台 config 均为 PHP_VERSION=8.3.36，PHP_SHA256=dd54693aa334c5c4d72e9aee96b082c2473750a18a6c1d105789c93a3b1692fd。

PHP 官方公告：https://www.php.net/archive/2026.php#2026-10-21-5

8.3.36 修复 CVE-2026-109618 / CVE-2026-109619。早先官方 tag 的 manifest 列表为空，因此使用官方源码构建后备流程；如今镜像真实可用，已移除现场 PHP 源码编译及公钥服务器依赖。这不是跳过源码校验，而是改用固定内容摘要的官方预构建 runtime，并继续在最终镜像中检查精确版本和所需扩展。

保留 Redis 6.0.2 官方源码归档及 SHA256 验证，本地编译该扩展，避免此前 PECL 下载 HTTP 500。来源与摘要见 redis-6.0.2/README.md。原始 Dockerfile 就安装/加载此 PHP 客户端扩展；本修复不安装或启动 Redis 服务，不改变业务缓存、会话、队列、环境变量、凭据、数据库或前端产物。

## 构建与隔离验证

微信云托管保持原配置：GitHub 源、dev3 分支、构建目录 src/CRMEB/CRMEB-master/crmeb、Dockerfile、端口 80。

在具有 Docker 的隔离环境运行：

```sh
sh deploy/cloudrun/test-php-security.sh education-php-security:local
```

脚本执行完整构建、PHP 8.3.36/扩展/Redis 6.0.2 检查、Apache 配置和模块检查、无网络的 HTTP mod_php 测试。HTTP 测试使用临时文件，不启动 CRMEB 业务、不连接 DB/Redis、不访问线上域名、不执行漏洞利用。

.github/workflows/php-security-build-test.yml 仅响应 security/php-8.3.36-build-test 分支 push，使用标准 ubuntu-24.04、contents: read、固定 checkout SHA、45 分钟超时及同分支取消旧运行。额外逐文件校验全部 public/admin 静态产物，不重建前端。不使用生产凭据，不上传镜像、artifact 或 cache。

官方镜像方案仍需要镜像仓库和 Debian 包源可访问；最终镜像上传腾讯仓库也仍依赖网络。不能承诺它解决所有网络故障。校验失败必须停止，不得回退旧 PHP 或关闭校验。

## 发布与验收边界

用户已授权本次 PHP 安全修复发布及可恢复构建故障修复。每次代码修复先在独立测试分支验证；成功后确认 dev3 没有其他新改动，再非强制推进到同一已测试提交。不要更改 master、凭据、权限、数据库或网络安全设置。

推送 dev3 会触发现有云托管流水线。GitHub 推送和 Actions 成功不等于腾讯云构建、镜像上传、发布和服务健康成功。应在云托管确认最新提交、版本构建/发布状态、实际 PHP 8.3.36 及健康检查，再进行获批的登录、必要 API、上传等业务冒烟；支付等有副作用测试需使用沙箱。无 DB/Redis 测试不能称为完整业务验收。

如构建失败，检查最新任务对应的提交及真正的前置错误，不要用旧失败版本重复部署旧代码。旧镜像可能包含本次漏洞，回滚须同时评估安全风险。
