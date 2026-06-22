# 2026-06-15 修改说明

## 本次目标

打通自主学习训练营 H5 与本地 CRMEB 后端的基础数据链路，并按保守策略清理临时 mock、旧构建和预览配置。

## 前端 H5 修改

- 保留当前 H5 全部页面：首页、训练营、测评、成长档案、我的训练营、邀请好友、团队中心、佣金中心。
- 新增 CRMEB API 访问层：
  - `src/api/crmebClient.js`
  - `src/api/training.js`
  - `src/hooks/useCrmebData.js`
- H5 请求统一走 `/api`，开发环境由 Vite 代理到本地 CRMEB 后端 `http://127.0.0.1:8080`。
- 训练营页已读取 CRMEB 商品列表接口，并展示后台商品名称、价格、销量、开营时间等信息。
- 我的、邀请、团队、佣金页面已优先读取 CRMEB 用户/分销/佣金接口。
- 接口失败、未登录或无数据时，页面会回退到演示数据，并明确显示“演示数据”，不会误标为 CRMEB 数据。
- CRMEB 返回的相对图片路径会自动补成本地后端域名，避免 H5 图片地址失效。

## CRMEB / 构建配置修改

- `vite.config.js` 改为使用 `loadEnv` 读取环境变量。
- H5 构建输出统一到 CRMEB 后端静态目录：
  - `src/CRMEB/CRMEB-master/crmeb/public/h5`
- `.env.example` 保留本地联调配置示例：
  - `VITE_CRMEB_API_BASE=/api`
  - `VITE_CRMEB_API_ORIGIN=http://127.0.0.1:8080`
  - `VITE_CRMEB_TOKEN_KEY=Authori-zation`
- 本地 `.env` 已配置同样的开发后端地址，但不会提交到 Git。

## 后台与小程序相关调整

- CRMEB 后台商品编辑页保留 MVP 训练营方向的简化逻辑。
- UniApp / 小程序商品详情保留 MVP 训练营商品过滤逻辑。
- 保留 CRMEB 后端、后台、UniApp、小程序模板源码，未做破坏性精简。

## 清理内容

- 删除根目录临时微信预览配置：
  - `project.config.json`
  - `project.private.config.json`
- 清空旧 `dist/` 构建文件。
- 清空 `.wechat-local-data/` mock 服务文件。
- 未删除 CRMEB 官方目录：
  - `src/CRMEB/CRMEB-master/crmeb`
  - `src/CRMEB/CRMEB-master/template/admin`
  - `src/CRMEB/CRMEB-master/template/uni-app`
  - `src/CRMEB/CRMEB-master/crmeb/public/statics/mp_view`

## 测试结果

- `npm run build` 通过。
- H5 开发服务可访问：
  - `http://127.0.0.1:5173/`
- H5 构建产物已生成：
  - `src/CRMEB/CRMEB-master/crmeb/public/h5/index.html`
  - `src/CRMEB/CRMEB-master/crmeb/public/h5/assets/*`
- 当前环境中 `http://127.0.0.1:8080` 未检测到真实 CRMEB PHP/Docker 后端服务，因此真实后端接口联调未完成。
- 前端代理 `/api` 在后端未启动时会失败，但页面具备演示数据回退能力。

## 后续建议

- 启动真实 CRMEB 后端后，重新测试：
  - `http://127.0.0.1:8080/admin`
  - `http://127.0.0.1:8080/api/products`
  - `http://127.0.0.1:5173/#/camp`
- 若要完全后端化教育数据，下一阶段新增 `education_*` 表和 `/api/education/*` 接口，用于测评结果、成长档案、训练营进度持久化。
