# PHP 8.3.36 安全修复（待构建验证，未发布）

## 范围与来源

- 修复 CVE-2026-109618 / CVE-2026-109619，仍使用 PHP 8.3、Debian Bookworm、Apache mod_php、80 端口。
- PHP 官方公告：https://www.php.net/archive/2026.php#2026-10-21-5
- 基线：Educational-Mini-Program 的 dev3，`911074fce6ceb6e421f7c75ff1eac48be959070d`。
- 2026-10-21 16:17 UTC 实查 `php:8.3.36-apache-bookworm` OCI index 的 `manifests` 为空，因此不能依赖此标签直接构建。index digest：`sha256:eb37f58646a901dc7727cf448cae36daaefaba79de33b5058dab79aa4c04aefb`。
- 后备方案直接在当前 Dockerfile 内构建官方 PHP 源码，不依赖预先构建/上传自定义基础镜像，也不以旧版 PHP runtime 假冒修复。
- 上游： https://github.com/docker-library/php/tree/e3eaff845f7a9f7259c31da54dce0320b47a3bbd/8.3/bookworm/apache
- 保留的上游构建文件：`php-8.3.36/Dockerfile.upstream`，辅助脚本及 MIT LICENSE 同目录。
- Dockerfile 的第一阶段仅对上游的 stage 名与三处 COPY 源路径作适配。保留上游 SHA-256 与 GPG 签名验证，未关闭任何校验。
- PHP 源码：https://www.php.net/distributions/php-8.3.36.tar.xz
- SHA-256：`dd54693aa334c5c4d72e9aee96b082c2473750a18a6c1d105789c93a3b1692fd`。已经下载官方归档并核对摘要一致。

应用阶段保持现有扩展配置与 redis-6.0.2，不更改 Composer 依赖、业务逻辑、数据库、凭据、前端产物、端口、Apache 虚拟主机或 php.ini。额外加入 PHP 精确版本和扩展存在性检查，不符合则构建失败。

## 构建和验证

微信云托管保持原配置：GitHub 源、dev3 分支、构建目录 `src/CRMEB/CRMEB-master/crmeb`、Dockerfile、端口 80。该目录已包含所有需要的构建辅助文件。

在隔离的、具有 Docker 的环境内，从上述构建目录运行：

```sh
sh deploy/cloudrun/test-php-security.sh education-php-security:local
```

脚本执行本地构建、PHP CLI/扩展检查、Apache 配置检查以及无外网的 mod_php HTTP 测试。HTTP 测试挂载独立临时 PHP 文件，不启动 CRMEB 业务、不连接数据库/Redis、不访问线上域名、不执行漏洞利用。它只验证 runtime，不代替业务验收。

构建需要访问 Debian 包仓库、php.net、Ubuntu GPG keyserver 和 PECL。源码编译比现有基础镜像构建耗时更长；上游默认并行编译，云托管资源较少时可能需要另行评估构建资源。网络、GPG 或编译失败应停止，不得跳过校验或退回旧 runtime。

当前执行环境没有 Docker、Podman、Buildah、BuildKit 或 PHP。已做文件完整性、脚本语法、Dockerfile 与官方源逐项对照及应用段保留检查；实际镜像构建、CLI 执行、Apache HTTP 测试和业务兼容性测试均未执行。不能据此宣称线上已安全。

## 发布前后检查（需要另行授权）

1. 确认上述本地/隔离构建测试通过。为避免生产自动触发，先安排独立测试环境与测试数据。不能直接把生产 dev3 push 当作测试。
2. 保存当前可回滚的云托管版本/镜像标识与配置，不复制或改动凭据。
3. 微信云托管已开启 dev3 push 自动构建发布，因此推送 dev3 属于发布动作。用户仅授权 security/php-8.3.36-build-test 独立测试分支提交/推送与标准 Ubuntu Actions 隔离测试；不包含 dev3/master、PR、部署、镜像或 artifact/cache 上传。
4. 在测试环境验证登录、后台页面、必要 API、上传、数据库/Redis 和健康检查。测试支付等有副作用业务必须使用获批测试数据/沙箱。
5. 授权发布后，在新容器内运行 `php /usr/local/bin/verify-php-runtime.php`，检查构建日志和 `/api/index` 健康状态；确认旧容器/旧 Apache worker 全部退出，并进行获批线上冒烟验证。
6. 只有版本、扩展、Apache、健康检查和必要业务验收全部通过，才能报告发布完成。回滚到旧镜像会重新暴露本次漏洞；若回滚必要，应同步限制访问并尽快恢复修复版本。

## 后续简化

待官方 `php:8.3.36-apache-bookworm`（或另行验证的更高安全补丁版）真实包含目标平台 manifest 后，可核查其 config `PHP_VERSION`，再将源码阶段替换为经验证的标签加 digest。仅标签存在或 HTTP 200 不算镜像可用。保持精确版本检查同步，重新完成构建和兼容性验证；不要自动放宽成浮动 `php:8.3`。

## 独立 Actions 测试

`.github/workflows/php-security-build-test.yml` 只响应 `security/php-8.3.36-build-test` 的 push，使用标准 ubuntu-24.04、contents: read、固定 checkout SHA、45 分钟超时和同分支取消旧运行。不使用生产凭据，不上传镜像、artifact 或 cache。后台文件只校验镜像中的已有打包产物，不重建前端。工作流通过仅代表列出的 runtime 检查，不是完整业务验收或生产发布。
