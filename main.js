const { app, BrowserWindow, globalShortcut, ipcMain, shell, dialog, nativeImage, Tray, Menu, screen } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;
let config = null;
let configPath = null;
let pinned = false;
let lastWindowBounds = null;

const defaultSettings = {
  autoLaunch: false,
  stayVisible: false,
};

function initConfigPath() {
  configPath = path.join(app.getPath('userData'), 'config.json');
}

function loadConfig() {
  if (!configPath) initConfigPath();
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } else {
      config = {
        shortcut: 'CommandOrControl+Shift+K',
        settings: { ...defaultSettings },
        items: [
          { name: '我的文档', type: 'folder', path: app.getPath('documents') },
          { name: '下载目录', type: 'folder', path: app.getPath('downloads') },
          { name: 'GitHub', type: 'url', path: 'https://github.com' },
          { name: '百度', type: 'url', path: 'https://www.baidu.com' },
        ],
      };
      saveConfig();
    }
  } catch (e) {
    config = { items: [], settings: { ...defaultSettings } };
  }
  config.settings = { ...defaultSettings, ...(config.settings || {}) };
  pinned = config.settings.stayVisible;
  lastWindowBounds = config.windowBounds || null;
}

function saveConfig() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

function applyAutoLaunch(enabled) {
  const portablePath = process.env.PORTABLE_EXECUTABLE_FILE;
  app.setLoginItemSettings({
    openAtLogin: Boolean(enabled),
    path: portablePath || process.execPath,
  });
}

function createWindow() {
  const savedBounds = getVisibleWindowBounds(lastWindowBounds);
  mainWindow = new BrowserWindow({
    width: 520,
    height: 440,
    ...(savedBounds || {}),
    minWidth: 300,
    minHeight: 200,
    frame: false,
    transparent: true,
    resizable: true,
    skipTaskbar: false,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  if (!savedBounds) mainWindow.center();

  mainWindow.on('hide', rememberWindowBounds);

  mainWindow.on('blur', () => {
    if (!pinned) mainWindow.hide();
  });

  mainWindow.on('close', (e) => {
    if (tray) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function getVisibleWindowBounds(bounds) {
  if (!bounds || !Number.isFinite(bounds.x) || !Number.isFinite(bounds.y)) return null;
  const width = Number.isFinite(bounds.width) ? bounds.width : 520;
  const height = Number.isFinite(bounds.height) ? bounds.height : 440;
  const intersectsDisplay = screen.getAllDisplays().some(({ workArea }) =>
    bounds.x < workArea.x + workArea.width &&
    bounds.x + width > workArea.x &&
    bounds.y < workArea.y + workArea.height &&
    bounds.y + height > workArea.y
  );
  return intersectsDisplay ? { ...bounds, width, height } : null;
}

function rememberWindowBounds() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  lastWindowBounds = mainWindow.getBounds();
  config.windowBounds = lastWindowBounds;
  saveConfig();
}

function toggleWindow() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    const savedBounds = getVisibleWindowBounds(lastWindowBounds);
    if (savedBounds) mainWindow.setBounds(savedBounds);
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('window-shown');
  }
}

function registerShortcut() {
  const shortcut = config?.shortcut || 'CommandOrControl+Shift+K';
  globalShortcut.register(shortcut, () => {
    toggleWindow();
  });
}

function setupIPC() {
  ipcMain.handle('get-config', () => {
    loadConfig();
    return config;
  });

  ipcMain.handle('open-item', async (event, item) => {
    try {
      if (item.type === 'folder') {
        shell.openPath(item.path);
      } else if (item.type === 'file') {
        shell.openPath(item.path);
      } else if (item.type === 'url') {
        let url = item.path;
        if (!/^https?:\/\//i.test(url)) {
          url = 'https://' + url;
        }
        await shell.openExternal(url);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('save-config', async (event, newConfig) => {
    config = newConfig;
    saveConfig();
    return { success: true };
  });

  ipcMain.handle('save-settings', (event, settings) => {
    config.settings = { ...defaultSettings, ...(config.settings || {}), ...settings };
    pinned = config.settings.stayVisible;
    applyAutoLaunch(config.settings.autoLaunch);
    saveConfig();
    return config.settings;
  });

  ipcMain.handle('set-pinned', (event, value) => {
    pinned = value;
    return pinned;
  });

  ipcMain.handle('hide-window', () => {
    mainWindow?.hide();
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  let trayIcon;
  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath);
  } else {
    trayIcon = nativeImage.createFromBuffer(
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAARklEQVQ4T2NkYPj/n4EBBJgYiADMzMwsDx48+E+kflC9IA3M/2kA8JohZ0J8w1gDEkbBJMCAAQBTPAE3Px5nAAAAAElFTkSuQmCC',
        'base64'
      )
    );
  }
  trayIcon = trayIcon.resize({ width: 16, height: 16 });
  tray = new Tray(trayIcon);
  tray.setToolTip('FastOpen - 快捷启动器');

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示窗口', click: () => toggleWindow() },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        tray = null;
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => toggleWindow());
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) {
        const savedBounds = getVisibleWindowBounds(lastWindowBounds);
        if (savedBounds) mainWindow.setBounds(savedBounds);
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  app.whenReady().then(() => {
    loadConfig();
    applyAutoLaunch(config.settings.autoLaunch);
    createWindow();
    setupIPC();
    registerShortcut();
    createTray();
    mainWindow.show();
  });
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
