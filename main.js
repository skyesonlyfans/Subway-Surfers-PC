const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    fullscreen: true,       // Start directly in fullscreen mode
    frame: false,            // Frameless window for borderless display
    autoHideMenuBar: true,   // Hide default menu bar for clean arcade UI
    icon: path.join(__dirname, 'icon.ico'), // Desktop/EXE Icon
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,    // Allows local file iframe loading without cross-origin/ASAR blocks
      allowRunningInsecureContent: true
    }
  });

  // Load main arcade hub index file
  mainWindow.loadFile('index.html');

  // Remove menu bar completely
  mainWindow.setMenu(null);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle hooks
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Inter-Process Communication (IPC) handlers
ipcMain.on('app-close', () => {
  app.quit();
});

ipcMain.on('app-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('app-fullscreen-toggle', () => {
  if (mainWindow) {
    const isFS = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFS);
  }
});