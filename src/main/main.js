const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

const store = new Store();

function tryEnableMacZoomWindowFilteringExclusion(win) {
  if (process.platform !== 'darwin') return;
  try {
    const addonPath = app.isPackaged
      ? path.join(process.resourcesPath, 'native', 'talking_point_native.node')
      : path.join(__dirname, '../../native/build/Release/talking_point_native.node');
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const addon = require(addonPath);
    const handle = win.getNativeWindowHandle();
    const ok = addon.setWindowSharingNone(handle);
    console.log(`[TalkingPoint] setWindowSharingNone applied: ${Boolean(ok)}`);
  } catch (err) {
    console.warn('[TalkingPoint] Failed to apply macOS window sharing exclusion (addon).', err);
  }
}

function getNotesPath() {
  return path.join(app.getPath('userData'), 'notes.txt');
}

let overlayWindow = null;
let clickThrough = false;

const DEFAULT_BOUNDS = { width: 400, height: 300, x: 100, y: 100 };

function getOverlayBounds() {
  const saved = store.get('overlayBounds');
  if (saved && typeof saved.width === 'number' && typeof saved.height === 'number') {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    return {
      ...saved,
      x: Math.min(Math.max(0, saved.x), Math.max(0, width - saved.width)),
      y: Math.min(Math.max(0, saved.y), Math.max(0, height - saved.height)),
    };
  }
  return DEFAULT_BOUNDS;
}

function createOverlayWindow() {
  const bounds = getOverlayBounds();

  overlayWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  overlayWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  if (process.platform === 'darwin') {
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    overlayWindow.setHiddenInMissionControl(true);
    overlayWindow.setWindowButtonVisibility(false);
    overlayWindow.setBackgroundColor('#00000000');
    overlayWindow.setSkipTaskbar(true);
    overlayWindow.setHasShadow(false);

  }

  overlayWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  overlayWindow.once('ready-to-show', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      if (process.platform === 'win32') {
        overlayWindow.setContentProtection(true);
      }
      if (process.platform === 'darwin') {
        // Best-effort: mark window as non-shareable so Zoom can filter it out
        // when "Advanced capture with window filtering" is enabled.
        tryEnableMacZoomWindowFilteringExclusion(overlayWindow);
      }
    }
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  overlayWindow.on('resize', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      const b = overlayWindow.getBounds();
      store.set('overlayBounds', b);
    }
  });

  overlayWindow.on('move', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      const b = overlayWindow.getBounds();
      store.set('overlayBounds', b);
    }
  });
}

const MOVE_STEP = 40;

function registerShortcuts() {
  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit();
  });

  globalShortcut.register('CommandOrControl+B', () => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    if (overlayWindow.isVisible()) {
      overlayWindow.hide();
    } else {
      overlayWindow.show();
    }
  });

  globalShortcut.register('CommandOrControl+E', () => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    overlayWindow.webContents.send('toggle-edit-mode');
  });

  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    clickThrough = !clickThrough;
    overlayWindow.setIgnoreMouseEvents(clickThrough, { forward: clickThrough });
  });

  globalShortcut.register('CommandOrControl+M', () => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    const b = overlayWindow.getBounds();
    overlayWindow.setBounds({ ...b, width: Math.min(b.width + 80, 1200), height: Math.min(b.height + 60, 800) });
  });

  globalShortcut.register('CommandOrControl+N', () => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    const b = overlayWindow.getBounds();
    overlayWindow.setBounds({ ...b, width: Math.max(b.width - 80, 200), height: Math.max(b.height - 60, 120) });
  });

  globalShortcut.register('CommandOrControl+Left', () => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    const b = overlayWindow.getBounds();
    overlayWindow.setBounds({ ...b, x: Math.max(0, b.x - MOVE_STEP) });
  });
  globalShortcut.register('CommandOrControl+Right', () => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    const b = overlayWindow.getBounds();
    overlayWindow.setBounds({ ...b, x: b.x + MOVE_STEP });
  });
  globalShortcut.register('CommandOrControl+Up', () => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    const b = overlayWindow.getBounds();
    overlayWindow.setBounds({ ...b, y: Math.max(0, b.y - MOVE_STEP) });
  });
  globalShortcut.register('CommandOrControl+Down', () => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    const b = overlayWindow.getBounds();
    overlayWindow.setBounds({ ...b, y: b.y + MOVE_STEP });
  });
}

app.whenReady().then(() => {
  createOverlayWindow();
  registerShortcuts();
});

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  app.quit();
});

app.on('activate', () => {
  if (overlayWindow === null) {
    createOverlayWindow();
    registerShortcuts();
  } else if (!overlayWindow.isVisible()) {
    overlayWindow.show();
  }
});

ipcMain.handle('get-bounds', () => {
  if (!overlayWindow || overlayWindow.isDestroyed()) return null;
  return overlayWindow.getBounds();
});

ipcMain.handle('set-bounds', (_, bounds) => {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  overlayWindow.setBounds(bounds);
  store.set('overlayBounds', overlayWindow.getBounds());
});

ipcMain.handle('hide-window', () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) overlayWindow.hide();
});

ipcMain.handle('show-window', () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) overlayWindow.show();
});

function loadNotesFromDisk() {
  try {
    return fs.readFileSync(getNotesPath(), 'utf8');
  } catch {
    return '';
  }
}

function saveNotesToDisk(text) {
  try {
    fs.writeFileSync(getNotesPath(), text, 'utf8');
  } catch (_) {}
}

ipcMain.handle('notes-load', () => loadNotesFromDisk());
ipcMain.handle('notes-save', (_, text) => saveNotesToDisk(text));
