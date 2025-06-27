// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onCardData: callback => ipcRenderer.on('card-data', (event, data) => callback(data)),
});
