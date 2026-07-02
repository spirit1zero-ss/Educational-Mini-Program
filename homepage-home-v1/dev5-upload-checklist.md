# dev5 上传内容确认与交付说明

更新时间：2026-06-28

## 一、上传项目

微信开发者工具打开目录：

```text
C:\Users\pc\Documents\ssp\Educational-Mini-Program-dev5\homepage-home-v1
```

项目配置：

```text
AppID: wx0b9ac48d7f3ee781
projectname: homepage-home-v1
miniprogramRoot: miniprogram/
```

实际上传的小程序代码以 `project.config.json` 中的 `miniprogramRoot` 为准，即：

```text
C:\Users\pc\Documents\ssp\Educational-Mini-Program-dev5\homepage-home-v1\miniprogram
```

## 二、确认上传内容

### 1. 小程序基础文件

需要上传：

```text
miniprogram/app.js
miniprogram/app.json
miniprogram/app.wxss
miniprogram/sitemap.json
miniprogram/package.json
miniprogram/package-lock.json
```

当前 `app.json` 注册页面：

```text
pages/home/home
pages/module-2-logic/module-2-logic
pages/module-3-habit/module-3-habit
pages/module-4-drive/module-4-drive
pages/module-5-camp/module-5-camp
pages/module-b-table/module-b-table
pages/module-a-assessment/module-a-assessment
pages/module-a-result/module-a-result
pages/module-b-inline/module-b-inline
pages/module-b-assessment/module-b-assessment
pages/module-b-result/module-b-result
```

### 2. 页面代码

需要上传：

```text
miniprogram/pages/home/
miniprogram/pages/module-2-logic/
miniprogram/pages/module-3-habit/
miniprogram/pages/module-4-drive/
miniprogram/pages/module-5-camp/
miniprogram/pages/module-b-table/
miniprogram/pages/module-a-assessment/
miniprogram/pages/module-a-result/
miniprogram/pages/module-b-inline/
miniprogram/pages/module-b-assessment/
miniprogram/pages/module-b-result/
```

页面入口关系：

```text
首页 - 学科开窍 -> module-2-logic
首页 - 学习习惯 -> module-3-habit
首页 - 内驱力 -> module-4-drive
首页 - 21天线上特训营 -> module-5-camp
模块2底部测评 -> module-a-assessment
模块3底部下载表格 -> module-b-table
模块4底部测评 -> module-b-inline
```

### 3. 组件代码

需要上传：

```text
miniprogram/components/custom-nav/
miniprogram/components/choice-card/
miniprogram/components/sticky-action/
```

说明：

`custom-nav` 使用 Vant Weapp 的 `van-nav-bar`，因此需要同时保留 `miniprogram/miniprogram_npm/`。

### 4. 工具数据

需要上传：

```text
miniprogram/utils/module-a-results.js
miniprogram/utils/module-b-results.js
```

说明：

这两个文件用于测评结果页的数据映射。

### 5. 素材资源

需要上传：

```text
miniprogram/assets/
```

重点资源：

```text
miniprogram/assets/home-tree-hero.png
miniprogram/assets/home-tree-rounded-sparse-roots-v3.png
miniprogram/assets/home-tree-rounded-v2.png
miniprogram/assets/images/module-a-characters.jpeg
miniprogram/assets/module-2-logic/icons/
miniprogram/assets/module-5-camp/hero-characters.png
miniprogram/assets/module-a-result/
miniprogram/assets/module-b-table/sop-homework-table.docx
miniprogram/assets/module-b-table/sop-homework-table.png
```

说明：

`sop-homework-table.docx` 是模块3“点击下载表格”使用的 Word 文件。

### 6. npm 构建产物

需要上传：

```text
miniprogram/miniprogram_npm/
```

说明：

项目依赖 `@vant/weapp`，当前自定义导航组件使用了 Vant 的导航栏。上传前如果开发者工具提示 npm 构建异常，需要先执行“工具 - 构建 npm”。

## 三、不作为上传内容

以下内容不应作为小程序线上代码上传：

```text
Educational-Mini-Program-dev5/node_modules/
Educational-Mini-Program-dev5/src/
Educational-Mini-Program-dev5/tests/
Educational-Mini-Program-dev5/index.html
Educational-Mini-Program-dev5/vite.config.js
Educational-Mini-Program-dev5/tailwind.config.js
Educational-Mini-Program-dev5/postcss.config.js
```

说明：

这些属于外层 Web/Vite 项目或本地依赖，不属于本次微信小程序 `homepage-home-v1` 的上传根目录。

## 四、建议随 dev5 归档保留

这些文件不属于线上小程序代码，但建议随 dev5 一起保留，便于后续设计和验收追溯：

```text
homepage-design-spec.md
design-reference/README.md
design-reference/accepted-visuals-overview.png
design-reference/module-2-3-4-content-visual.png
design-reference/module-5-camp-visual.png
```

## 五、当前功能确认

已实现：

```text
首页主视觉与入口
模块2：学科知识的基础逻辑内容页
模块3：学习习惯内容页
模块4：内驱力内容页
模块5：21天线上特训营内容页
模块A：学科开窍测评与结果页
模块B：读懂孩子心测评与结果页
模块B表格：SOP高效作业流程规范表格打开
```

需要特别确认：

```text
1. 模块3表格当前使用本地打包 docx 打开。
2. module-b-table.js 中 tableFileUrl 目前为空字符串。
3. 如果上线后要求真正从服务器下载 Word 文件，需要把 tableFileUrl 改为 HTTPS 文件地址，并在微信公众平台配置 downloadFile 合法域名。
4. 模块5底部“加入我们的社群”当前是提示“社群报名准备中”，还没有接支付或报名表单。
5. 首页“我的”“线下”tab 当前提示“页面建设中”。
```

## 六、包体积本地统计

本地统计，不包含 `node_modules`：

```text
miniprogram 上传相关文件约 11.18 MB
assets 约 10.64 MB
miniprogram_npm 约 0.44 MB
```

上传前以微信开发者工具的上传提示为准。若提示包体积过大，优先处理以下资源：

```text
miniprogram/assets/home-tree-hero.png
miniprogram/assets/home-tree-rounded-sparse-roots-v3.png
miniprogram/assets/home-tree-rounded-v2.png
miniprogram/assets/module-5-camp/hero-characters.png
miniprogram/assets/doc-images/
```

## 七、上传前检查清单

在微信开发者工具中依次检查：

```text
1. 打开 homepage-home-v1 项目。
2. 如依赖异常，执行“工具 - 构建 npm”。
3. 编译通过，无红色错误。
4. 首页可以正常展示。
5. 点击“学科开窍”进入模块2。
6. 点击“学习习惯”进入模块3。
7. 点击“内驱力”进入模块4。
8. 点击“21天线上特训营”进入模块5。
9. 模块2底部测评可以进入学科测评。
10. 模块3底部下载表格可以打开 Word 文档。
11. 模块4底部测评可以进入读心测评。
12. 模块5底部按钮出现当前提示。
13. iPhone 预览下底部固定按钮不遮挡正文。
14. 安卓或窄屏预览下文字没有明显溢出。
```

## 八、上传建议

建议版本号：

```text
dev5-20260628
```

建议版本描述：

```text
dev5：首页与模块2-5内容页完成，接入学科测评、读心测评与SOP表格打开功能；统一内容页视觉与21天特训营页面。
```

上传前最后确认项：

```text
是否需要把模块5“加入我们的社群”接到正式报名/支付流程。
是否需要把模块3表格从本地 docx 改成服务器 HTTPS 下载地址。
是否需要压缩图片资源以降低上传包体积。
```
