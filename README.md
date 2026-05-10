# FastOpen - Windows 快捷启动器

一个简约的 Electron 桌面小工具，提供网格状启动界面，支持快速打开本地文件、文件夹和网页链接。

## 界面预览

- 网格布局，自适应列数
- 毛玻璃半透明暗色窗口
- 搜索过滤 + Emoji 图标

## 快速开始

### 直接使用（便携版）

下载 `dist/win-unpacked/` 目录，双击 `FastOpen.exe` 即可启动。

首次运行会在 `%APPDATA%/FastOpen/config.json` 自动生成配置文件。

### 开发运行

```bash
npm install
npm start
```

### 构建打包

```bash
# 设置镜像加速（国内）
export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/

# 打包
npm run build
```

## 使用方式

| 操作 | 说明 |
|---|---|
| `Ctrl+Shift+K` | 全局切换窗口显隐 |
| 左键点击方块 | 打开对应文件/文件夹/网址 |
| 右键方块 | 编辑或删除入口 |
| 点击 `+` 按钮 | 添加快捷入口 |
| 搜索框 | 输入关键词过滤入口 |
| 📌 按钮 | 固定窗口（不自动隐藏） |
| `Esc` | 隐藏窗口 |
| 系统托盘图标 | 右键显示菜单 |

## 配置文件

位置：`%APPDATA%/FastOpen/config.json`

```json
{
  "shortcut": "CommandOrControl+Shift+K",
  "items": [
    { "name": "项目文档", "type": "folder", "path": "D:/Projects/docs" },
    { "name": "GitHub", "type": "url", "path": "https://github.com" },
    { "name": "记事本", "type": "file", "path": "C:/Windows/notepad.exe" }
  ]
}
```

每个入口字段：
- `name` — 显示名称
- `type` — `file` / `folder` / `url`
- `path` — 路径或网址
- `icon`（可选）— Emoji 或图标 URL

## 技术栈

- **框架**：Electron 28
- **前端**：原生 HTML/CSS/JS
- **打包**：electron-builder
- **平台**：Windows 10/11
