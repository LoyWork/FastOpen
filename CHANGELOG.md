# FastOpen 版本记录

## v1.0.0 (2026-05-10)

### 核心功能
- 网格布局快捷启动器，自适应列数
- 支持三种入口类型：文件夹、文件、网址
- 毛玻璃半透明无边框窗口（暗色主题）
- 全局快捷键 `Ctrl+Shift+K` 切换窗口显隐
- 点击窗口外部自动隐藏（可通过 📌 固定取消）
- 系统托盘常驻，右键菜单退出
- 搜索过滤入口
- 右键编辑/删除入口
- `+` 按钮添加新入口
- Emoji 图标选择面板（80 个常用 icon）
- 配置文件自动初始化，保存在 `%APPDATA%/FastOpen/config.json`
- 窗口尺寸可拖拽调整

### 技术栈
- Electron 28
- 原生 HTML/CSS/JS（无前端框架）
- electron-builder 打包

### 构建产物
- `dist/win-unpacked/FastOpen.exe` — 便携版，双击即用
