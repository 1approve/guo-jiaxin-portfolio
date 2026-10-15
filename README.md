# 郭佳鑫｜AIGC 视频创作作品集

一个基于原生 HTML、CSS 和 JavaScript 的单页作品集网站，可直接部署到 GitHub Pages。

## 本地预览

直接打开 `index.html`，或在项目目录运行任意静态服务器，例如：

```powershell
python -m http.server 4173
```

然后访问 `http://localhost:4173`。

## 发布到 GitHub Pages

1. 在 GitHub 新建公开仓库，例如 `guo-jiaxin-portfolio`。
2. 将本目录全部文件推送到仓库的 `main` 分支。
3. 打开仓库的 **Settings → Pages**。
4. 在 **Build and deployment** 中选择 **Deploy from a branch**。
5. 选择 `main` 和 `/(root)`，保存后等待部署完成。

站点不依赖构建工具或第三方运行时，GitHub Pages 可直接托管。

## 内容维护

- 个人与项目文案：编辑 `index.html`。
- 色彩、排版和响应式样式：编辑 `styles.css`。
- 头像：替换 `assets/guo-jiaxin.jpg`，保持同名即可。
- 后续加入成片时，可在项目卡片中添加 Bilibili、网盘或公开视频链接。

## 隐私说明

网站默认仅公开简历中的邮箱，没有公开电话、年龄，也没有把原始简历 PDF 放入仓库。
