# Genie - AI Prompt Studio

基于 Tauri 的桌面应用，用于 AI 提示词优化和场景管理。

## 前置要求

1. 安装 **Rust** 和 **Cargo**（访问 https://www.rust-lang.org/tools/install）
2. 安装 **Node.js** (v16+) 和 npm

### Windows 快速安装

```bash
# 安装 Rust
winget install --id Rustlang.Rustup
```

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式运行（自动打开桌面窗口）
npm run tauri:dev

# 构建生产版本
npm run tauri:build
```

## 功能

- ✅ 场景列表浏览
- ✅ 按类型/分类筛选
- ✅ 搜索场景
- ✅ 场景详情和变量输入
- ✅ API Key 配置（本地存储）
- ✅ 模拟生成（示例数据）
- 🚀 原生桌面应用体验

## 项目结构

```
genie/
├── src/                 # Vue 3 前端代码
├── src-tauri/          # Tauri 原生 Rust 代码
│   ├── src/
│   ├── icons/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```
