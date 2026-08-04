# 小程序高清素材上传包

本目录不在 `miniprogramRoot` 内，不会计入小程序主包或分包体积。

请把 `miniapp-assets/v1` 目录上传到当前 CloudBase 环境的云存储根目录，并保留目录结构。目录中还包含 `module-5`（21天线上特训营）素材。上传后应形成：

`miniapp-assets/v1/module-2/hero-tree-v3.png`

对应的完整 File ID 为：

`cloud://prod-d0ge2jwpgc0db67eb.7072-prod-d0ge2jwpgc0db67eb-1453312076/miniapp-assets/v1/module-2/hero-tree-v3.png`

静态页面插画可以设置为“所有用户可读，仅创建者/管理员可写”。不要修改 `member-avatars` 的权限，也不要把本目录上传到 `member-avatars`。

前端已经按这些固定 File ID 接入。上传前或云端加载失败时使用本地压缩图兜底；上传完成后重新编译，即会优先显示云端高清图。
