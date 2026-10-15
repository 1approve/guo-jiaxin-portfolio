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

## 发布到 GitHub Pages

1. 在 GitHub 新建公开仓库，例如 `guo-jiaxin-portfolio`。
2. 将本目录推送到 `main` 分支。
3. 在仓库 **Settings → Pages** 中将 Source 设为 **GitHub Actions**。
4. `.github/workflows/deploy.yml` 会自动安装依赖、构建并发布 `dist`。

## 内容维护

- 个人与项目文案：编辑 `src/App.jsx`。
- 色彩、排版和响应式样式：编辑 `src/styles.css`。
- 头像：替换 `public/assets/guo-jiaxin.jpg`，保持同名即可。
- 真实项目素材：位于 `public/assets/portfolio/`，包括 WebP 图片和网页预览版 MP4。
- 项目顺序、说明、数据和画廊：编辑 `src/App.jsx` 顶部的 `projects` 数组。
- 网站内视频已经压缩为网页预览版；原始高码率成片不纳入 GitHub 仓库。

## 隐私说明

网站默认仅公开简历中的邮箱，没有公开电话、年龄、聊天截图、报名表，也没有把原始简历 PDF 或高码率成片放入仓库。
