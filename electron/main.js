import { app, BrowserWindow, Menu } from 'electron';
import { initialize } from '@electron/remote/main/index.js';
import path from 'path';
import { spawn } from 'child_process';
import fs from 'fs';
import { shell } from 'electron';

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
      preload: path.join(app.getAppPath(), 'electron/preload.js'),
      enableRemoteModule: true,
    },
  });
  win.loadURL('http://localhost:3000');
  win.webContents.openDevTools();
  //   win.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
  // 🟢 Spawn Python executable
  let pythonPath;
  if (process.platform === 'win32') {
    pythonPath = path.join(rootDir, 'electron/card_reader.exe');
  } else if (process.platform === 'darwin') {
    if (app.isPackaged) {
      pythonPath = path.join(process.resourcesPath, 'electron/card_reader');
    } else {
      pythonPath = path.join(rootDir, 'electron/card_reader');
    }
  } else {
    pythonPath = path.join(rootDir, 'electron/card_reader_linux');
  }
  console.log(pythonPath);
  if (fs.existsSync(pythonPath)) {
    const python = spawn(pythonPath);
    python.stdout.on('data', data => {
      const raw = data.toString().trim();
      console.log(`📥 Python stdout raw:`, raw);

      try {
        const result = JSON.parse(raw);
        console.log('✅ Parsed JSON from Python:', result);
        win.webContents.send('card-data', result);
      } catch (err) {
        console.error('❌ JSON parsing failed:', err.message);
        console.error('🔎 Offending data:', raw);
      }
    });

    python.stderr.on('data', data => {
      console.error(`Python Error: ${data}`);
    });
    python.on('close', code => {
      console.log(`Python process exited with code ${code}`);
    });
  } else {
    console.error('Card reader executable not found:', pythonPath);
  }
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
      label: 'Developer',
      submenu: [
        {
          label: 'Toggle DevTools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools();
            }
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
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

app.whenReady().then(() => {
  createWindow();
  // startSmartcardWorker();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
