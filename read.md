# Electron 快捷启动器（Quick Launch Grid）

## 📌 项目概述

开发一个基于 Electron 的桌面小工具，提供一个简约的网格状启动界面，用户可以通过界面添加快速入口，支持打开本地文件、本地文件夹和网页链接。

---

## 🎯 核心功能需求

### 1. 配置管理

用户可以通过界面直接增删改快捷入口，也支持手动编辑配置文件（`config.json`）。

配置路径：`%APPDATA%/FastOpen/config.json`（首次运行自动生成默认配置）

**每个入口包含以下字段：**
- `name`：显示名称
- `type`：类型（`file` / `folder` / `url`）
- `path`：本地路径或网址
- `icon`（可选）：自定义图标路径或 emoji

**配置示例：**

```json
{
  "shortcut": "CommandOrControl+Shift+K",
  "items": [
    { "name": "项目文档", "type": "folder", "path": "D:/Projects/MyApp/docs" },
    { "name": "记事本", "type": "file", "path": "C:/Windows/notepad.exe" },
    { "name": "GitHub", "type": "url", "path": "https://github.com" },
    { "name": "Figma", "type": "url", "path": "https://figma.com", "icon": "🎨" }
  ]
}
```

### 2. 界面要求

- **简约小方格子布局**：类似 macOS Launchpad 或 Windows 开始菜单的简化版
- 网格布局：自适应列数，根据窗口宽度自动调整
- 每个方格子显示：
  - 图标（支持 emoji 或图片 URL，无图标时按类型显示默认图标）
  - 名称（支持换行或截断）
- 窗口样式：无边框、可拖动、半透明毛玻璃效果（暗色主题）
- 尺寸：默认 520×440 像素，可拖拽调整大小，最小 300×200
- 内置 Emoji 图标选择面板（80 个常用 icon），点击即选

### 3. 交互行为

- **点击方格子**：
  - `folder` → 在系统文件管理器中打开该文件夹
  - `file` → 使用默认关联程序打开该文件（支持 .exe 等可执行文件）
  - `url` → 在默认浏览器中打开链接
- **`+` 按钮**：弹出编辑框，填写名称、类型、路径、图标来添加入口
- **右键方格子**：弹出编辑/删除菜单
- **搜索框**：输入关键词实时过滤入口
- **全局快捷键**：按 `Ctrl+Shift+K`（可配置）唤起/隐藏窗口
- **Esc**：隐藏窗口
- **点击窗口外部**：自动隐藏窗口（可通过 📌 固定取消）
- **📌 固定按钮**：激活后窗口不自动隐藏
- **系统托盘图标**：常驻 Windows 右下角通知区域，右键可显示窗口或退出
- **双击 exe 再次启动**：若窗口已隐藏，自动显示已运行的窗口

### 4. 已实现特性

- [x] 搜索过滤（输入关键词实时过滤）
- [x] 内置 Emoji 图标选择面板（80 个常用 icon）
- [x] 界面内增删改入口（无需手动编辑配置文件）
- [x] 📌 固定窗口开关
- [x] 系统托盘常驻
- [x] 配置自动初始化（首次运行生成默认配置）
- [ ] 拖拽重新排序
- [ ] 深色/浅色主题切换

---

## 🛠️ 技术约束

- **框架**：Electron 28
- **前端**：HTML/CSS/JS（原生，无框架依赖）
- **构建目标**：Windows 10/11
- **打包工具**：electron-builder
- **进程安全**：contextIsolation + preload 桥接

---

## 📁 项目结构

```
FastOpen/
├── package.json          # 项目配置 + 打包脚本
├── main.js               # Electron 主进程（窗口管理、快捷键、托盘、IPC）
├── preload.js            # 预加载脚本（安全桥接层）
├── config.json           # 用户配置文件
├── renderer/
│   ├── index.html        # 主界面
│   ├── style.css         # 网格样式（毛玻璃暗色主题）
│   └── renderer.js       # 渲染进程逻辑（搜索、编辑、emoji选择）
├── assets/
│   └── icon.png          # 应用图标 + 托盘图标
├── .gitignore
├── README.md             # 使用说明
└── CHANGELOG.md          # 版本记录
```

---

## 🧪 验收标准

1. 双击 `FastOpen.exe`，显示一个简约的网格窗口
2. 网格内展示配置文件中定义的所有入口
3. 点击文件夹入口 → 打开资源管理器并定位到该文件夹
4. 点击文件入口（含 .exe） → 用默认程序打开文件
5. 点击网页入口 → 浏览器打开链接
6. 按全局快捷键 → 窗口显示/隐藏
7. 点击窗口外任意位置 → 窗口自动隐藏（📌 固定后不隐藏）
8. 点击 `+` 添加新入口 → 选择 emoji → 保存 → 文件持久化
9. 右键入口 → 编辑/删除
10. 系统托盘图标可见，右键可退出

---

## 📝 注意事项（给开发者的提示）

- 使用 Electron 的 `shell` 模块打开外部资源（`shell.openPath`、`shell.openExternal`），不要用 `child_process`
- 窗口设置 `focusable: true` 并监听 `blur` 事件实现点击外部隐藏，固定模式下跳过隐藏
- 全局快捷键使用 `globalShortcut` 模块，应用退出时注销
- 配置文件放在 `app.getPath('userData')` 目录下，便于读写
- 打包时需包含 `package.json` 到 asar 内，否则 Electron 找不到入口文件
- 使用 `app.requestSingleInstanceLock()` 防止多实例，二次启动时显示已有窗口
