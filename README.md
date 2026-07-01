# DBClient (网页版数据库管理工具)

A lightweight, modern web-based database management client. Support visual management of your database connections, local secure lock, and cloud backup features.
这是一款轻量级、现代化的网页版数据库管理客户端。支持直观地管理您的数据库连接，并提供本地安全锁与云端备份功能。

## ✨ Features (主要功能)

- 🔒 **Privacy First (隐私保护)**: Initial use requires setting a 4-digit PIN to protect local database connection configurations. / 初次使用需设置 4 位 PIN 码，保护本地数据库连接配置。
- 💾 **Local Storage & Cloud Backup (本地存储 & 云端备份)**: Connections are saved securely in browser LocalStorage by default. Supports **WebDAV** for cloud backup and restore. / 连接信息默认安全地保存在浏览器本地，支持通过 WebDAV 进行云端备份与恢复。
- 🌍 **Internationalization (多语言支持)**: Built-in support for English and Simplified Chinese (i18n). / 内置中英文双语支持。
- 📱 **Mobile Responsive (响应式设计)**: Fully optimized for mobile devices with a clean and accessible user interface. / 完美适配移动端设备，提供干净直观的用户界面。
- 🎨 **Theme Switching (主题切换)**: Seamless switching between Light and Dark modes. / 支持浅色 (Light) 和深色 (Dark) 模式的无缝切换。
- 📌 **Quick Management (快捷管理)**:
  - Drag and drop sorting. / 拖拽排序，自由组织连接。
  - "Favorites" support to pin frequently used databases. / 支持“星标”设置置顶常用连接。
  - One-click ping to test database connectivity. / 一键快速测试数据库连通性（Ping）。
- 🗄️ **Multi-Database Support (多数据库支持)**: Manage connections for MySQL, PostgreSQL, and Redis. / 支持管理 MySQL, PostgreSQL 和 Redis。
- ⚡ **Online Queries (在线查询)**: Execute safe SQL queries (MySQL/PostgreSQL) and common Redis commands. / 支持执行 SQL 查询语句及 Redis 命令。

## 🚀 Deployment (部署与运行)

This is a full-stack application built with React (Vite) on the frontend, and Express (Node.js) on the backend for WebDAV proxying and database connectivity.
本项目是一个全栈应用，前端采用 React (Vite) 构建，后端采用 Express 提供 WebDAV 请求代理和连通性测试服务。

### Prerequisites (环境要求)
- Node.js 18+
- npm or pnpm

### Local Development (本地开发)

1. Install dependencies / 安装项目依赖：
   ```bash
   npm install
   ```
2. Start the development server / 启动开发服务器：
   ```bash
   npm run dev
   ```
   *Runs by default on `http://localhost:3000`.*

### Production Build & Deployment (生产环境构建部署)

> **⚠️ Important / 重要提醒:** 
> Due to the Node.js backend required for WebDAV proxying and database probing, this app **CANNOT** be deployed as a pure static site (e.g., Vercel Static, GitHub Pages). It must be deployed to an environment that supports Node.js runtimes (e.g., Cloud Run, VPS, Render, Railway).
> 由于包含处理 WebDAV 和数据库底层探测的 Node.js 后端服务，本项目**不能**仅作为静态网页部署。必须使用支持 Node.js 运行时的环境。

1. Build for production / 执行生产环境构建：
   ```bash
   npm run build
   ```
2. Start the production server / 启动正式服务：
   ```bash
   npm start
   ```

## ❓ FAQ (常见问题)

- **Forgot your PIN? (忘记 PIN 码？)**
  You can reset the app from the lock screen. **Note:** Resetting will permanently delete all local connection configurations. You can restore them if you have a WebDAV backup. / 可以在解锁界面点击重置。注意：重置会清除所有本地连接记录。

## 🛠️ Tech Stack (技术栈)

- **Frontend**: React, Vite, Tailwind CSS, Lucide React, dnd-kit, i18next
- **Backend**: Express.js, Node TypeScript

## 📄 License (开源协议)
MIT License
