# 构建说明 - Genie 桌面应用

## 前置要求

- Node.js >= 18
- npm 或 pnpm
- Windows 系统 (用于构建 Windows exe)

## 安装依赖

```bash
cd desktop

# 使用 npm
npm install

# 或者使用 pnpm (推荐)
pnpm install
```

## 开发模式

```bash
# 启动开发服务器
npm run dev
```

## 构建应用

### 1. 先构建代码

```bash
npm run build
```

这会在 `dist/` 目录下生成编译后的代码。

### 2. 打包可执行文件

#### 方式一：构建完整安装包 (NSIS)

```bash
npm run dist:win
```

输出文件位置：
- `release/Genie Setup 1.0.0.exe` - NSIS 安装程序

#### 方式二：构建便携版 (Portable)

```bash
npm run pack
```

便携版不需要安装，直接运行 exe 即可。

## 打包命令说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式，热重载 |
| `npm run build` | 编译代码 |
| `npm run pack` | 打包未打包版本 |
| `npm run dist` | 构建所有平台的安装包 |
| `npm run dist:win` | 仅构建 Windows 版本 |

## 构建产物

构建完成后，在 `release/` 目录下会生成：

```
release/
├── Genie-1.0.0-win.zip          # 压缩包
├── Genie-1.0.0-portable.exe     # 便携版
└── Genie Setup 1.0.0.exe        # NSIS 安装程序
```

## 图标替换

如需更换图标，将你的 ico 图标文件放在：

```
desktop/build/icon.ico
```

图标尺寸推荐：256x256

## 常见问题

### 1. 构建失败
确保安装了所有依赖：
```bash
rm -rf node_modules
npm install
```

### 2. electron-builder 下载慢
配置国内镜像：
```bash
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
```

### 3. 开发模式启动报错
确保端口 5173 没有被占用：
```bash
netstat -ano | findstr :5173
```

## 下一步

- 完善 LLM 集成
- 添加更多场景
- 实现真正的提示词优化
