# 面试通 (Interview Pro) - 本地沉浸式刷题系统

基于 React 18、Vite、TypeScript、Tailwind CSS 和 Dexie.js 构建的完全本地化的面试题管理与刷题平台。所有数据均存储在您的浏览器 IndexedDB 中，无需后端服务器，保证您的数据隐私与离线可用性。

## ✨ 核心特性

- **完全本地化**：基于 Dexie.js (IndexedDB) 存储，数据不出浏览器，无需注册登录。
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

### 4. 构建生产版本

```bash
pnpm run build
```

构建完成后，产物将生成在 `dist` 目录中。您可以使用任何静态服务器（如 `serve`、`nginx`、`caddy`）来托管这些静态文件。

```bash
npx serve -s dist
```

## 🛠️ 技术栈

- **框架**：React 18, Vite
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **动画**：Framer Motion
- **数据库**：Dexie.js (IndexedDB)
- **状态管理**：Zustand
- **图标**：Lucide React
- **Markdown**：react-markdown, remark-gfm, highlight.js
- **Excel/CSV 解析**：xlsx

## 💡 使用小贴士

1. **数据备份**：由于数据存储在浏览器的 IndexedDB 中，如果您清除了浏览器缓存或使用了无痕模式，数据将会丢失。**请务必养成定期前往“数据设置”页面导出 JSON 备份的习惯。**
2. **批量导入**：在“题库管理”页面点击“批量上传”可以选择 Excel 或 CSV 文件导入。请确保您的表格包含 `题目名称` 和 `答案与解析` 这两列，`难度` 和 `标签` 为选填。
3. **标签分隔**：导入或批量追加标签时，多个标签请使用逗号（中英文皆可）进行分隔。

---

*Made with ❤️ by Interview Pro Team*