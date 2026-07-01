# DBClient - 网页版数据库管理工具

> 一款轻量级、现代化的全栈网页数据库管理客户端。
> A lightweight, modern full-stack web-based database management client.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Tech Stack](https://img.shields.io/badge/React-19-blue?logo=react)
![Tech Stack](https://img.shields.io/badge/Vite-6-purple?logo=vite)
![Tech Stack](https://img.shields.io/badge/Express-4-gray?logo=express)

---

## 📖 简介 / Introduction

**DBClient** 是一个运行在浏览器中的数据库管理工具，无需安装桌面应用即可管理 MySQL、PostgreSQL 和 Redis。支持数据库连接管理、SQL 查询、表结构浏览与 WebDAV 云端备份。

**DBClient** is a browser-based database management tool that lets you manage MySQL, PostgreSQL, and Redis without installing any desktop application. It supports connection management, SQL queries, table structure browsing, and WebDAV cloud backup.

---

## ✨ 功能特性 / Features

### 🔒 隐私保护 / Privacy First

- 首次使用需设置 **4 位 PIN 码**，保护本地数据库连接配置
- 连接信息以明文存储在浏览器 `localStorage` 中，受 PIN 码访问控制
- A 4-digit PIN protects your locally stored database configurations from unauthorized access.

### 🗄️ 多数据库支持 / Multi-Database Support

| 类型 / Type    | 功能 / Features                                              |
| -------------- | ------------------------------------------------------------ |
| **MySQL**      | 连接测试 / Ping、SQL 查询 / Query、表结构浏览 / Table Structure |
| **PostgreSQL** | 连接测试 / Ping、SQL 查询 / Query、表结构浏览 / Table Structure |
| **Redis**      | 连接测试 / Ping、命令执行 / Command Execution、KEY 查看      |

### 📌 连接管理 / Connection Management

- **搜索过滤** — 按名称搜索连接，按类型（全部/MySQL/PostgreSQL/Redis）过滤
- **收藏置顶** — 星标收藏常用数据库连接，自动排序置顶
- **拖拽排序** — 通过拖拽自由组织连接顺序（基于 `@dnd-kit`）
- **连通性检测** — 一键 Ping 测试数据库可达性，显示响应耗时
- **快捷操作** — Ctrl+N 新建连接，Ctrl+F 搜索连接
- Search, favorite, drag-and-drop reorder, and one-click ping for all your connections.

### 📝 在线查询 / Online Query

- **SQL 查询** — 支持 MySQL / PostgreSQL 的 SELECT、SHOW、DESCRIBE、EXPLAIN 语句
- **安全限制** — 仅允许只读查询，自动追加 LIMIT 1000 防止误操作
- **Redis 命令** — 支持执行常用 Redis 命令（FLUSHDB/FLUSHALL/CONFIG 被拦截）
- **查询历史** — 自动记录当前连接的查询历史（最多 200 条），点击即可回填
- **CSV 导出** — 查询结果一键导出为 UTF-8 CSV 文件
- **快捷键** — Ctrl+Enter 快速执行查询
- Execute safe read-only SQL queries and Redis commands with auto-applied LIMIT, history tracking, and CSV export.

### 🏗️ 表结构浏览 / Table Structure

- 自动获取数据库表结构（表名 → 字段名、类型、是否可空、是否主键）
- 点击表名快速生成 `SELECT * FROM table LIMIT 100` 查询
- 点击字段名将其追加到当前 SQL 编辑器中
- 树形侧边栏 + 搜索过滤，快速定位表
- Automatically fetch and browse database schemas with an interactive sidebar tree.

### ☁️ WebDAV 云端备份 / WebDAV Cloud Backup

- 支持通过 **WebDAV 协议** 备份/恢复连接配置
- 一键备份所有连接到 WebDAV 服务器
- 从 WebDAV 恢复连接配置，支持冲突确认
- 配置信息保存在浏览器本地，无需重复输入
- Backup and restore all your connection configurations via any WebDAV-compatible server.

### 🎨 界面体验 / UI/UX

- **🌓 明暗主题** — Light / Dark 模式无缝切换，状态持久化
- **🌐 中英文双语** — 内置英文和简体中文，浏览器自动检测 + 手动切换
- **📱 响应式设计** — 完美适配桌面与移动端设备
- **可拖拽分栏** — 工作区侧边栏支持拖拽调整宽度
- **可调整列宽** — 查询结果表头支持鼠标拖拽调整列宽
- Light/Dark theme, bilingual UI (EN/ZH), responsive design, and resizable layout.

---

## 🚀 快速开始 / Quick Start

### 环境要求 / Prerequisites

- **Node.js** 18+
- **npm** 或 **pnpm** / or pnpm

### 本地开发 / Local Development

```bash
# 1. 安装依赖 / Install dependencies
npm install

# 2. 启动开发服务器 / Start dev server
npm run dev
```

默认运行在 `http://localhost:3000`

### 构建部署 / Production Build

> **⚠️ 重要 / Important:** 
> 由于后端提供 WebDAV 代理和数据库直连服务，**不能** 作为纯静态站点（如 Vercel Static、GitHub Pages）部署。必须使用支持 Node.js 运行时的环境。
> This app requires a Node.js backend for WebDAV proxying and database connectivity — it **CANNOT** be deployed as a static site. Use Node.js-compatible platforms (Cloud Run, VPS, Render, Railway, etc.).

```bash
# 1. 构建 / Build
npm run build

# 2. 启动生产服务 / Start production server
npm start
```

### 环境变量 / Environment Variables

| 变量 / Variable  | 作用 / Purpose                                               |
| ---------------- | ------------------------------------------------------------ |
| `GEMINI_API_KEY` | Gemini AI API 密钥 / Gemini AI API key (for AI Studio integration) |
| `APP_URL`        | 部署后的服务 URL / Deployed app URL (for callbacks)          |

---

## ❓ 常见问题 / FAQ

<details>
<summary><strong>忘记 PIN 码怎么办？/ Forgot your PIN?</strong></summary>


在解锁界面点击「忘记 PIN 码？」→「重置应用」。**注意：** 重置会清除 PIN 码并**永久删除所有本地连接配置**。如果有 WebDAV 备份，重置后可以恢复。

Click "Forgot PIN?" → "Reset App" on the lock screen. **Note:** This permanently deletes all local connections. Restore from WebDAV backup afterward if available.
</details>

<details>
<summary><strong>连接信息存储在哪里？/ Where are connections stored?</strong></summary>


连接配置以 JSON 格式保存在浏览器 `localStorage` 中（键名：`dbclient_connections`），受 PIN 码访问保护。建议通过 WebDAV 定期备份。

Connections are stored in browser localStorage (key: `dbclient_connections`), protected by your PIN. Regular WebDAV backup is recommended.
</details>

<details>
<summary><strong>支持哪些查询操作？/ What queries are supported?</strong></summary>


MySQL/PostgreSQL 仅允许 `SELECT`、`SHOW`、`DESCRIBE`、`EXPLAIN` 等只读查询，系统自动追加 `LIMIT 1000`。Redis 支持大部分命令，但 `FLUSHDB`、`FLUSHALL`、`CONFIG` 被安全拦截。

Only read-only queries (SELECT, SHOW, DESCRIBE, EXPLAIN) are allowed for SQL databases, with auto-applied LIMIT 1000. Redis blocks FLUSHDB, FLUSHALL, and CONFIG for safety.
</details>

---

## 🛠️ 技术栈 / Tech Stack

### 前端 / Frontend

| 技术                                                | 用途            |
| --------------------------------------------------- | --------------- |
| [React 19](https://react.dev/)                      | UI 框架         |
| [Vite 6](https://vite.dev/)                         | 构建工具        |
| [Tailwind CSS 4](https://tailwindcss.com/)          | 样式框架        |
| [@dnd-kit](https://dndkit.com/)                     | 拖拽排序        |
| [i18next](https://www.i18next.com/) + react-i18next | 国际化（中/英） |
| [Lucide React](https://lucide.dev/)                 | 图标库          |
| [motion](https://motion.dev/)                       | 动画库          |

### 后端 / Backend

| 技术                                                         | 用途                  |
| ------------------------------------------------------------ | --------------------- |
| [Express](https://expressjs.com/)                            | HTTP 服务框架         |
| [mysql2](https://github.com/sidorares/node-mysql2)           | MySQL 连接            |
| [pg](https://node-postgres.com/)                             | PostgreSQL 连接       |
| [ioredis](https://github.com/redis/ioredis)                  | Redis 连接            |
| [webdav](https://github.com/perry-mitchell/webdav-client)    | WebDAV 客户端         |
| [tsx](https://tsx.is/) + [esbuild](https://esbuild.github.io/) | TypeScript 执行与打包 |

---

## 📄 开源协议 / License

[MIT](LICENSE)

---

<p align="center">
  <a href="https://github.com/xiangshenchi/DBClient">
    <img src="https://img.shields.io/badge/GitHub-xiangshenchi%2FDBClient-181717?logo=github" alt="GitHub" />
  </a>
</p>

