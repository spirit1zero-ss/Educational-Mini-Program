# 上线前安全提醒

本文件记录当前项目上线或上传前必须复核的安全事项。目标是先做一个能上线的精简版本，后续再慢慢删除 CRMEB 原系统中不用的模块代码。

## 1. CORS 和 Cookie 必须收紧

当前本地配置适合开发，不适合直接上线：

- `config/cookie.php` 里 `Access-Control-Allow-Origin` 过宽。
- `Access-Control-Allow-Credentials` 开启时，不能允许任意来源访问。
- `secure`、`httponly` 在本地可保持关闭，但线上 HTTPS 环境应开启。

上线处理建议：

- 只允许正式后台域名和正式小程序接口域名访问 API。
- 后台登录态 Cookie 应开启 `HttpOnly`。
- 线上 HTTPS 环境应开启 `Secure`。
- 不要把 `Access-Control-Allow-Origin` 设置成 `*` 后再允许 credentials。

## 2. Docker 端口只暴露 Nginx

上线时公网只应暴露 `80/443`。

以下服务不能直接暴露到公网：

- PHP-FPM `9000`
- MySQL `3306`
- Redis `6379`
- Workerman 内部端口，除非明确需要公网 websocket 并经过 Nginx 反代

上线处理建议：

- Nginx 作为唯一公网入口。
- PHP、MySQL、Redis 只放在 Docker 内部网络。
- 数据库和 Redis 使用强密码，不使用本地默认 `123456`。

## 3. 安全响应头

安全头可以在 Nginx 或线上网关/CDN 处理。本地开发不强制，但上线必须配置。

当前 Nginx 模板已加入低风险基础头：

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN` 或 CSP `frame-ancestors 'self'`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` 限制不需要的浏览器能力

上线前仍需处理：

- `Content-Security-Policy` 先用保守策略逐步收紧。

注意：CSP 可能影响现有后台脚本加载，必须在线上预发环境验证后再强收紧。

## 4. 前端依赖漏洞处理策略

后台前端仍包含 CRMEB 原系统老依赖，例如：

- `wangeditor`
- `xlsx`
- `vxe-table`
- `echarts`
- `vue-awesome-swiper` / `swiper`
- `quill`
- `js-cookie`
- `vuex-persist`

当前不能全部直接删除，因为其中一些仍被后台登录、系统管理、统计、商品/旧商城页面或状态管理引用。

处理顺序建议：

1. 先继续隐藏和禁用不用的后台菜单与接口。
2. 再按模块物理删除旧商城、营销、PC、老 H5、文章资讯、外部开放接口等代码。
3. 每删除一组页面后，重新运行后台构建。
4. 构建通过后，再删除不再被引用的依赖。
5. 对仍必须保留的依赖，单独评估升级或替换。

## 5. 已处理事项

- 已删除无需登录的 `/adminapi/upgrade` 和 `/adminapi/upgrade/run` 升级入口路由。
- 教育测评后台模块已移除。
- 不用模块采用“菜单隐藏 + retired denylist + 分阶段慢删除”的策略。

## 6. 上线前复核清单

- 确认 `.env` 使用正式强密码和正式小程序配置。
- 确认 `APP_DEBUG=false`。
- 确认小程序 `routine_appId` 和 `routine_appsecret` 已配置。
- 确认 PHP `vendor` 依赖完整，不靠手动复制容器文件。
- 确认 Nginx 只暴露业务入口。
- 确认后台域名、API 域名、CORS 白名单一致。
- 确认安全头在预发环境验证通过。
