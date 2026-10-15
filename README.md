# 郭佳鑫｜AIGC 视频创作作品集

面向 AIGC 视频创作实习岗位的 React + Vite 响应式作品集。网站采用“两段式体验”：先以《一灯渡众生》视频作为沉浸式入口，进入后切换到白底编辑出版物风格，以细线网格、大留白、黑白影像和荧光绿索引呈现真实项目。

## 本地预览

安装依赖并启动 Vite：

```powershell
npm install
npm run dev
```

构建生产版本：

```powershell
npm run build
```

## 在线地址与发布

- 公开网站：<https://guo-jiaxin-portfolio.netlify.app/>
- 作品管理后台：<https://guo-jiaxin-portfolio.netlify.app/admin/>
- GitHub 仓库：<https://github.com/1approve/guo-jiaxin-portfolio>

后台通过 Netlify Identity 登录，并使用 Git Gateway 把修改写入 GitHub `main` 分支。每次保存或发布后，Netlify 会自动构建网站。

## 定制作品后台

- 新增、删除、排序项目，设置草稿或发布状态。
- 修改标题、年份、分类、职责、介绍、侧栏说明和项目解析。
- 管理封面、海报、完整视频、片花、视频 Poster 与可选背景音乐。
- 管理个人能力、完整流程、阶段交付、流程证据、画廊、工作留痕和下载文档。
- 右侧实时预览；网络读取失败时使用构建内置数据兜底。
- 上传文件暂限 25 MB，大体积正片继续使用已有仓库路径或后续接入对象存储。

## 隐私说明

后台采用仅邀请登录；公开网站与管理权限彼此分离。
