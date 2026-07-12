# dev3 服务器预览部署、版本差异与后续路线

更新日期：2026-07-12

## 1. dev3 定位

dev3 是面向微信原生小程序的精简预览版本，不提供用户 Web、H5、PC 商城或 App 页面。

对外入口边界：

| 入口 | 用途 | 预期结果 |
| --- | --- | --- |
| `/` | 域名根路径 | `404 JSON`，这是无 Web 端的正常行为 |
| `/admin/` | CRMEB 管理后台 | 管理员登录页及后台 SPA |
| `/api/index` | 服务健康检查 | HTTP 200 和服务信息 |
| `/api/miniapp/*` | 微信小程序业务 API | 登录、会员、训练营、分销等接口 |
| `/api/pay/notify/*` | 支付回调 | 支付平台服务器回调 |
| `/api/transfer/notify/*` | 转账回调 | 转账结果通知 |

未知 Web 路径、旧 H5、PC 商城、客服页面和旧移动商城统一返回 404，不再回退到已删除的 `mobile.html`、`index.html` 或商城模板。

## 2. 明日预览前必须完成

### 2.1 服务器环境

建议使用原生部署，不要求 Docker：

- Ubuntu 24.04 LTS。
- Nginx。
- PHP 8.3 + PHP-FPM。
- MySQL 8.0。
- Redis 7。
- HTTPS 域名。

PHP 扩展至少包含：

```text
bcmath curl dom fileinfo gd iconv json libxml mbstring mysql
openssl redis simplexml xml xmlreader xmlwriter zip
```

服务器站点根目录必须指向：

```text
src/CRMEB/CRMEB-master/crmeb/public
```

不能指向仓库根目录，也不能指向 `crmeb` 目录本身。

### 2.2 Nginx 基础配置

以下配置仅作为路径示例，部署时替换域名、PHP-FPM socket 和实际目录：

```nginx
server {
    listen 443 ssl http2;
    server_name preview.example.com;

    root /var/www/educational-mini-program/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }

    location ~ /\. {
        deny all;
    }
}
```

部署后访问 `/` 返回 404 JSON 是正确结果；浏览器预览管理后台请使用 `/admin/`。

### 2.3 环境配置

以 `database/install/env.template` 为参考创建服务器 `.env`，至少填写：

- `APP_DEBUG=false`。
- MySQL 地址、端口、数据库名、账号、强密码和表前缀。
- Redis 地址、端口、强密码、数据库编号和缓存前缀。
- 队列名称。
- 后台域名、站点 URL、HTTPS 配置。
- 微信小程序 AppID、AppSecret、支付商户号、API 密钥、证书及回调域名。

严禁继续使用本地测试密码 `123456`，严禁把 `.env`、数据库备份、微信密钥或支付证书提交到 Git。

### 2.4 数据库

全新数据库先导入：

1. `database/install/crmeb.sql`
2. `database/install/membership_level_upgrade.sql`
3. 按日期执行 `database/patches/` 下的 SQL：
   - `2026-07-06-hide-points-menus.sql`
   - `2026-07-07-remove-education-assessment-admin.sql`
   - `2026-07-07-tighten-retired-admin-surface.sql`
   - `2026-07-08-training-camp-registration.sql`
   - `2026-07-10-training-camp-member-price.sql`

已有数据库不要重复导入基础 SQL。执行补丁前必须备份，并先确认补丁是否已经执行。

### 2.5 文件权限

PHP-FPM 用户需要写权限的目录：

```text
runtime/
public/phpExcel/
public/uploads/（使用本地上传时）
```

其余程序文件建议只读。不要给整个项目 `777` 权限。

### 2.6 小程序配置

发布前修改：

```text
homepage-home-v1/miniprogram/config/api.js
```

将 `DEFAULT_API_BASE_URL` 从 `http://127.0.0.1:8011` 改为 HTTPS 预览域名，并在微信公众平台配置：

- request 合法域名。
- uploadFile/downloadFile 合法域名（实际使用时）。
- 业务域名（实际需要 WebView 时；当前版本无用户 WebView）。

小程序上传和体验版发布通过微信开发者工具完成，不由服务器自动完成。

### 2.7 依赖与进程

当前仓库包含已使用的 `vendor`。全新执行 Composer 安装前需注意：

- `xin/helper`、`xin/container` 等旧依赖来自 Gitee，网络异常时会阻断干净安装。
- 旧 Symfony/微信 SDK 链仍包含 PHP 7 时代的元数据约束。
- 最近一次依赖解析报告 12 个包涉及 28 条安全公告，必须在正式上线前逐项升级或移除。

预览环境可使用 dev3 已包含并验证过的依赖目录；正式生产上线前必须修复“可重复 Composer 安装”和依赖安全审计。

需要常驻任务时，再根据业务启用：

```bash
php think queue:work
php think timer start
```

使用 systemd 或 Supervisor 托管，不要依赖 SSH 会话常驻。

## 3. 部署后验收清单

### 3.1 服务端

- [ ] `php -v` 为计划使用的 PHP 8.3。
- [ ] 必需 PHP 扩展均已加载。
- [ ] `php think list` 能正常启动。
- [ ] `/` 返回 404 JSON，不再出现 `mobile.html` 模板错误。
- [ ] `/api/index` 返回 HTTP 200。
- [ ] `/admin/` 能打开登录页。
- [ ] 管理员默认密码已更换。
- [ ] Redis、MySQL 不向公网开放。
- [ ] HTTPS 证书和自动续期正常。
- [ ] `runtime` 日志无持续异常。

### 3.2 核心业务

- [ ] 微信登录成功并取得 token。
- [ ] 会员计划和价格正确。
- [ ] 训练营报名信息可以保存、查询。
- [ ] 训练营订单可以创建、取消、查询。
- [ ] 支付下单、支付回调、会员生效形成闭环。
- [ ] 推广海报和推荐人 UID 正确。
- [ ] 邀请记录、一级/二级分销关系正确。
- [ ] 佣金记录和财务流水正确。
- [ ] 用户、会员卡、分销、财务 XLSX 导出正常。

明日如果只做界面预览，不要现场使用真实支付；支付闭环应在专用测试商户和测试订单中验证。

## 4. dev2 与 dev3 的主要差异

对比基准是 2026-07-10 下载的远程 dev2 快照。远程 GitHub 在编写本文时连接被重置，未确认分支是否在此后产生新提交。

规模变化：

| 指标 | dev2 快照 | dev3 当前版 | 变化 |
| --- | ---: | ---: | ---: |
| 总文件数 | 11,622 | 10,529 | -1,093 |
| 总体积 | 约 235 MB | 约 181 MB | -54 MB |
| 排除 vendor/node_modules/runtime 后文件 | 2,834 | 1,959 | -875 |
| 排除环境后体积 | 约 127 MB | 约 76 MB | -51 MB |

### 4.1 保留功能

- 微信小程序登录和 token。
- 21 天自主学习训练营首页及内容模块。
- 学科、习惯、内驱力测评页面和结果展示。
- 会员计划、会员卡、报名登记、会员订单、支付/取消入口。
- 推广海报、邀请记录、一级/二级分销关系、佣金记录。
- 用户管理、会员管理、分销管理、财务流水和基础系统设置。
- 支付回调、转账回调、Redis、队列、Workerman 等服务能力。
- 用户、会员卡、分销员、资金、佣金五类导出。

### 4.2 删除或关闭功能

- 用户 Web/H5、PC 商城和 App 页面入口。
- 旧移动商城 `mobile.html`、`index.html` 和历史页面包。
- 商城商品管理、分类、规格、评价等后台路由和页面。
- 商城订单、售后、物流、核销、门店等后台路由和页面。
- 优惠券、秒杀、拼团、砍价、预售、积分商城、签到、抽奖、直播等营销入口。
- CRUD 生成器、Widget、旧图表页面、在线升级、跨版本升级和高风险开发工具。
- 外部开放 API/outapi、旧 v2 API、PC API 和旧商城 API。
- 教育测评记录后台模块；小程序端测评内容页面仍保留。
- 无调用链的控制器、服务、DAO、模型、监听器和静态资源。

### 4.3 调整内容

- 后台首页移除商品/商城订单导向的统计卡片和排行榜。
- 后台管理路由由 dev2 的商品、订单、营销、CRUD 等宽入口收缩为用户、会员、分销、财务、设置和基础系统能力。
- 小程序图片资源由部分 PNG/JPEG 转为体积更小的 JPG，并删除未引用预览图和说明文件。
- Excel 引擎由 `PhpSpreadsheet 1.13` 替换为 `OpenSpout 4.32`。
- 修复 Excel 首次导出时目录创建位置错误，统一保存到 `public/phpExcel/年月/日`。
- 根路径不再尝试加载已删除的 Web 模板，未知 Web 请求明确返回 404 JSON。
- 增加 Ubuntu 24.04 / PHP 8.3 兼容检查脚本和 OpenSpout XLSX 生成测试。

## 5. 已知未完成项

以下功能不能因为“页面存在”就视为已经完成：

- 兑换码接口仍提示后端未配置。
- 小程序部分订单页面仍保留“支付接口待接入”提示，需要统一真实支付状态。
- 提现按钮仍是待接入提示。
- 线下地址和导航仍需后台真实配置。
- 真实微信登录、支付证书和回调只有部署到 HTTPS 域名后才能完成验收。
- 尚未在真实服务器数据库上做全流程回归。
- Composer 干净安装、旧 SDK 升级和 28 条依赖安全公告尚未解决。

## 6. 后续修改方向

### P0：预览前

1. 完成服务器 `.env`、MySQL、Redis、HTTPS 和 Nginx。
2. 修改小程序 API 域名并发布体验版。
3. 验证登录、会员价格、报名、订单、后台登录和导出。
4. 创建专用预览数据库、管理员账号和回滚备份。

### P1：业务闭环

1. 完成微信支付下单、回调幂等、订单状态和会员生效闭环。
2. 完成兑换码生成、核销、使用记录和防重复使用。
3. 完成佣金结算规则、提现申请、审核、转账和到账记录。
4. 清除小程序中剩余 mock、空列表回退和“待接入”提示。
5. 为报名、会员订单、分销和财务增加端到端测试。

### P2：安全与依赖

1. 处理 Composer 审计中的安全公告。
2. 替换废弃的微信 SDK、旧 Symfony 组件和 Gitee 单点依赖。
3. 让 `composer install --no-dev` 在全新 Ubuntu/PHP 8.3 环境可重复成功。
4. 增加登录限流、后台访问限制、上传校验、密钥轮换和审计日志检查。

### P3：继续精简

1. 根据真实调用链继续删除残留的商品、订单、营销控制器目录。
2. 清理未启用的短信、云存储、物流、门店和多端 SDK。
3. 清理数据库中已退休菜单、配置和无业务引用的数据表。
4. 将小程序、后台和后端分别建立明确构建/发布产物，避免整仓上传。

### P4：可维护性

1. 建立 dev3 之后的正式分支与版本发布规则。
2. 增加 CI：PHP lint、路由契约、小程序 smoke、Composer audit。
3. 建立数据库迁移记录、部署记录、回滚脚本和备份恢复演练。
4. 将生产配置、密钥和证书迁移到服务器密钥管理，不进入仓库。

## 7. 回滚原则

- 预览服务器使用独立目录和独立数据库，不覆盖现有站点。
- 每次部署保留上一版完整代码目录和数据库备份。
- Nginx 使用软链接或版本目录切换发布版本。
- 数据库补丁执行前记录版本，结构变更必须提供逆向脚本或恢复方案。
- 出现登录、支付、订单或分销异常时，先停止支付入口，再回滚代码和数据库。
