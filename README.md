# 面试通 (Interview Pro) - 轻量级云端沉浸式刷题系统

基于 React 18、Vite、TypeScript、Tailwind CSS 和 Zustand 构建的轻量级面试题管理与刷题平台。它利用 **纯内存运行 + GitHub Gist 私有云同步** 作为数据存储方案，摆脱了对浏览器缓存（IndexedDB）的依赖，既保证了极快的响应速度，又解决了清缓存/换设备导致数据丢失的痛点。您可以将它一键部署到 GitHub Pages 等任意静态托管平台。

## ✨ 核心特性

- **脱离本地缓存依赖**：数据不再绑定于浏览器的 IndexedDB。运行时完全基于内存 (Zustand)，每次访问都会自动从您私有的 GitHub Gist 拉取题库。
- **云端无缝同步**：任何题库变动（新增、修改、刷题记录改变）都会实时或手动同步到您的私有 GitHub Gist 中，数据永远在您自己的掌控之下，并且跨设备完美同步。
- **现代 UI 体验**：使用 Tailwind CSS 结合 Framer Motion 打造高级的玻璃拟态（Glassmorphism）和流畅的动效，支持亮色/暗色模式无缝切换。
- **沉浸式刷题**：
  - **间隔重复算法（SM-2 简化版）**：根据您的掌握程度（未掌握、模糊、熟练）智能安排下一次复习时间。
  - 支持按“全部题目”、“智能复习”、“只看新题”分类刷题。
  - 3D 翻转卡片交互，提供纯粹的沉浸感。
- **强大的题库管理**：
  - 支持 Markdown 语法编写题目和解析，并接入了 `highlight.js` 实现代码高亮。
  - **批量操作**：支持对选中的题目进行批量修改难度、追加标签、批量删除。
  - **多样化导入导出**：支持 Excel (.xlsx, .xls)、CSV、TXT 格式批量上传；支持 JSON 格式的整库备份与恢复，并提供了导入冲突解决策略（跳过、覆盖、生成新 ID）。

## 🚀 快速开始

### 1. 环境要求

- Node.js (推荐 v18 或以上)
- pnpm (推荐，或使用 npm / yarn)

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm run dev
```

启动后，访问终端中提示的地址（通常是 `http://localhost:5173` 或 `http://localhost:5174`）。

### 4. 部署到 GitHub Pages

项目已内置了 GitHub Actions 工作流（`.github/workflows/deploy.yml`）。

1. 将本项目推送到您自己的 GitHub 仓库。
2. 在仓库的 `Settings` -> `Pages` 中，将 `Source` 设置为 `GitHub Actions`。
3. 提交代码到 `main` 分支后，GitHub 会自动为您构建并部署静态页面。

## ☁️ 如何使用 GitHub Gist 云端同步功能

为了防止换电脑或清理缓存后题库丢失，请按以下步骤配置您的私有云端同步：

1. **获取 Token**：登录您的 GitHub 账号，进入 `Settings` -> `Developer settings` -> `Personal access tokens (Tokens (classic))`，点击 `Generate new token`，**勾选 `gist` 权限**，生成一段以 `ghp_` 开头的 Token 字符串。
2. **初始化题库**：
   - 访问您部署好的网页版面试通。
   - 点击左侧边栏的 **数据设置**。
   - 在“云端同步 (GitHub Gist)”区域，填入您刚才生成的 Token。
   - `Gist ID` 留空，直接点击 **“首次创建云端备份”**。
   - 成功后，系统会自动为您生成并保存一个新的 Gist ID。此时您的应用已与云端完成绑定。
3. **跨设备使用**：在其他设备上访问网页时，只要在设置里填入相同的 Token 和 Gist ID，点击 **“从云端覆盖到本地”**，您的完整题库就会瞬间同步下来。日常修改后，系统也会自动向该 Gist 发起推送更新。

## 🛠️ 技术栈

- **框架**：React 18, Vite
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **动画**：Framer Motion
- **状态管理**：Zustand (内存状态 + GitHub Gist 数据持久化)
- **图标**：Lucide React
- **Markdown**：react-markdown, remark-gfm, highlight.js
- **Excel/CSV 解析**：xlsx

---

*Made with ❤️ by Interview Pro Team*
