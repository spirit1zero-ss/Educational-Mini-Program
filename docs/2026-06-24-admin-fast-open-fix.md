# 后台快捷打开修复记录

日期：2026-06-24

## 目标

让本地预览入口 `http://127.0.0.1:8011/admin/` 快速打开，并保证登录后能进入后台首页验证核心业务菜单。

## 本次清理与修复范围

- 登录初始化接口不再同步触发队列检测和全量文件 MD5 写入。
- 登录提交不再等待队列/定时器健康检测，返回结构保持 `queue`、`timer` 字段。
- 补齐 `/adminapi/get_workerman_url` 未授权路由，接口快速返回长连接地址，避免 404 慢失败。
- 管理端首屏移除外部统计脚本，`custom_admin_js` 改为浏览器空闲时延后加载，空内容直接跳过。
- 登录页移除未使用的长连接探测方法，避免后续重新接回首屏阻塞路径。
- Docker Nginx 开启 gzip；`/admin/system_static/*` 设置长缓存，`/admin/` 和 `index.html` 保持短缓存。
- 本地 Docker 预览改为使用 `crmeb_fast_code` Docker 原生卷运行 PHP 代码，避开 Windows 挂载层导致 PHP-FPM 请求卡住的问题。
- 本地 Docker PHP 容器只运行 PHP-FPM，不再随后台预览自动启动队列、定时器、长连接进程。

## 验证结果

- 管理端构建：`npm.cmd run build` 通过；保留原项目已有的 CSS 顺序和大包体积警告。
- `/adminapi/get_workerman_url`：HTTP 200，约 0.07s。
- `/adminapi/login/info`：HTTP 200，约 0.11s；真实登录链路复测中约 0.25s。
- `/adminapi/login`：HTTP 200，约 0.19s，返回 token 和 11 个菜单分组。
- `/admin/`：HTTP 200，约 0.006s。
- 浏览器验证：可从登录页进入 `/admin/index`，首页可见用户、商品、订单等核心菜单。
- 浏览器控制台：未发现 `get_workerman_url` 404、外链统计脚本错误或自定义脚本加载错误。
- 静态资源头：JS 返回 `Content-Encoding: gzip`、`Cache-Control: public, immutable`；HTML 返回 `no-cache, no-store, must-revalidate`。
- `git diff --check`：无空白错误，仅有 Windows 换行提示。

## 本地预览注意事项

当前 Docker PHP 代码运行在 `crmeb_fast_code` 卷中。若后续修改后端 PHP 或 `public/admin` 静态产物，需要重新把 `src/CRMEB/CRMEB-master/crmeb` 同步进该卷，再重启 `phpfpm` 和 `nginx`。

## 残留风险

- 管理端主包仍较大，首屏已通过 gzip、缓存和去阻塞提速，但长期还需要做路由级拆包和 Monaco/编辑器类资源延后加载。
- 队列、定时器、长连接在本地预览中默认不启动；后台日常验收不受影响，但要验证客服通知、异步任务、定时任务时需要单独启动对应服务。
- Docker 原生卷提升了预览速度，但牺牲了 PHP 文件的实时挂载更新，需要额外同步步骤。

## 下一步建议

1. 增加一个本地同步脚本，把源码同步到 `crmeb_fast_code` 卷并重启 Web/PHP 服务，避免手动操作。
2. 继续拆分管理端首屏包，把 Monaco、表单构建器、富文本、Excel 等非首页资源改为真正按路由加载。
3. 把队列/定时器/长连接健康检查迁移到后台诊断页，不再出现在登录和首页关键路径。
4. 单独做一次核心菜单冒烟：用户、商品、订单、支付配置、系统设置，确认收口后仍满足日常验收。
