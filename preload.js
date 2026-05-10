const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  openItem: (item) => ipcRenderer.invoke('open-item', item),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  setPinned: (value) => ipcRenderer.invoke('set-pinned', value),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  onWindowShown: (callback) => ipcRenderer.on('window-shown', callback),
});
