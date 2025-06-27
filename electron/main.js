import { app, BrowserWindow, Menu } from 'electron';
import { initialize } from '@electron/remote/main/index.js';
import path from 'path';

initialize();
const rootDir = app.getAppPath();
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: getPlatformIcon(),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(app.getAppPath(), 'preload.js'),
      enableRemoteModule: true,
    },
  });
  win.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [{ role: 'reload' }, { role: 'quit' }],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://electronjs.org');
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
}
function getPlatformIcon() {
  const publicDir = path.join(rootDir, 'public');
  if (process.platform === 'darwin') return path.join(publicDir, 'logo.icns');
  if (process.platform === 'win32') return path.join(publicDir, 'logo.ico');
  return path.join(publicDir, 'logo.png');
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
