# 郭佳鑫｜AIGC 视频创作作品集

面向 AIGC 视频创作实习岗位的 React + Vite 单页作品集。视觉方向为暗色、克制、高科技感，并使用本地生成的动态光场视频作为首屏背景。

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
- 首屏视频：替换 `public/assets/hero-loop.mp4`，保持同名即可。
- 项目封面：替换 `public/assets/project-*.svg`；当前为概念视觉，不冒充真实项目截图。
- 后续加入成片时，可在项目卡片中添加 Bilibili 或公开视频链接。

## 隐私说明

网站默认仅公开简历中的邮箱，没有公开电话、年龄，也没有把原始简历 PDF 放入仓库。
