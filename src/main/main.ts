import electron, { type BrowserWindow } from 'electron';
const { app, BrowserWindow: BrowserWindowClass, ipcMain, screen } = electron;
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { TaskStorage } from './taskStorage.js';
import type { TaskPriority, CatMood } from '../types/todo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Disable hardware acceleration glitches with transparent windows if needed,
// but keep standard flags for clean transparency on Windows
app.commandLine.appendSwitch('disable-color-correct-rendering');

let catWindow: BrowserWindow | null = null;
let panelWindow: BrowserWindow | null = null;
let taskStorage: TaskStorage | null = null;
let currentMood: CatMood = 'idle';
let moodTimeout: NodeJS.Timeout | null = null;

const CAT_SIZE = 160;
const PANEL_WIDTH = 380;
const PANEL_HEIGHT = 540;

function isDev(): boolean {
  return !app.isPackaged && (process.env.NODE_ENV === 'development' || !process.env.PROD);
}

function getAppUrl(hash: string): string {
  if (process.env.VITE_DEV_SERVER_URL) {
    return `${process.env.VITE_DEV_SERVER_URL}#${hash}`;
  }
  const localFile = path.join(__dirname, '../renderer/index.html');
  const fileUrl = pathToFileURL(localFile).toString();
  return `${fileUrl}#${hash}`;
}

function broadcastTasks(): void {
  if (!taskStorage) return;
  const data = taskStorage.getData();
  catWindow?.webContents.send('tasks:updated', data);
  panelWindow?.webContents.send('tasks:updated', data);
}

function setMood(mood: CatMood, temporaryDuration = 0): void {
  currentMood = mood;
  catWindow?.webContents.send('cat:mood-changed', mood);
  panelWindow?.webContents.send('cat:mood-changed', mood);

  if (moodTimeout) {
    clearTimeout(moodTimeout);
    moodTimeout = null;
  }

  if (temporaryDuration > 0) {
    moodTimeout = setTimeout(() => {
      // Re-evaluate default mood based on task state
      recomputeDefaultMood();
    }, temporaryDuration);
  }
}

function recomputeDefaultMood(): void {
  if (!taskStorage) {
    setMood('idle');
    return;
  }
  const data = taskStorage.getData();
  const pending = data.tasks.filter((t) => !t.completed).length;

  if (data.tasks.length > 0 && pending === 0) {
    // All completed!
    setMood('sleepy');
  } else if (data.tasks.length === 0) {
    // No tasks
    setMood('sleepy');
  } else {
    setMood('idle');
  }
}

function createCatWindow(): void {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { workArea } = primaryDisplay;

  // Position near bottom-right above taskbar
  const initialX = workArea.x + workArea.width - CAT_SIZE - 40;
  const initialY = workArea.y + workArea.height - CAT_SIZE - 20;

  catWindow = new BrowserWindowClass({
    width: CAT_SIZE,
    height: CAT_SIZE,
    x: initialX,
    y: initialY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: false,
    title: 'CatTask Companion',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev()
    }
  });

  catWindow.setAlwaysOnTop(true, 'screen-saver');
  catWindow.setVisibleOnAllWorkspaces(true);

  catWindow.loadURL(getAppUrl('cat'));

  catWindow.on('closed', () => {
    catWindow = null;
    app.quit();
  });
}

function positionPanelNearCat(): void {
  if (!catWindow || !panelWindow) return;

  const catBounds = catWindow.getBounds();
  const currentDisplay = screen.getDisplayMatching(catBounds);
  const workArea = currentDisplay.workArea;

  // Place panel above cat if room, otherwise beside or below
  let panelX = catBounds.x + catBounds.width / 2 - PANEL_WIDTH / 2;
  let panelY = catBounds.y - PANEL_HEIGHT - 12;

  // If overflows top, place beside or below
  if (panelY < workArea.y + 10) {
    // Try placing below cat
    panelY = catBounds.y + catBounds.height + 12;
    if (panelY + PANEL_HEIGHT > workArea.y + workArea.height - 10) {
      // Place to the left of cat
      panelX = catBounds.x - PANEL_WIDTH - 12;
      panelY = Math.max(workArea.y + 10, catBounds.y + catBounds.height - PANEL_HEIGHT);
    }
  }

  // Clamp within work area bounds
  panelX = Math.max(workArea.x + 10, Math.min(panelX, workArea.x + workArea.width - PANEL_WIDTH - 10));
  panelY = Math.max(workArea.y + 10, Math.min(panelY, workArea.y + workArea.height - PANEL_HEIGHT - 10));

  panelWindow.setPosition(Math.round(panelX), Math.round(panelY));
}

function createPanelWindow(): void {
  panelWindow = new BrowserWindowClass({
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: true,
    show: false,
    title: 'CatTask List',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev()
    }
  });

  panelWindow.setAlwaysOnTop(true, 'screen-saver');
  panelWindow.loadURL(getAppUrl('panel'));

  panelWindow.on('blur', () => {
    // Optional: could auto-hide on blur, but user requested explicit close / toggle
  });

  panelWindow.on('closed', () => {
    panelWindow = null;
  });
}

function togglePanel(): boolean {
  if (!panelWindow || panelWindow.isDestroyed()) {
    createPanelWindow();
  }
  if (!panelWindow) return false;

  if (panelWindow.isVisible()) {
    panelWindow.hide();
    return false;
  } else {
    positionPanelNearCat();
    panelWindow.show();
    panelWindow.focus();
    panelWindow.moveTop();
    return true;
  }
}

// IPC Handlers
function setupIpc(): void {
  if (!taskStorage) return;

  ipcMain.handle('tasks:get', () => {
    return taskStorage!.getData();
  });

  ipcMain.handle('tasks:add', (_event, title: string, priority?: TaskPriority) => {
    const newTask = taskStorage!.addTask(title, priority);
    broadcastTasks();
    setMood('curious', 2000);
    return newTask;
  });

  ipcMain.handle('tasks:toggle', (_event, id: string) => {
    const tasks = taskStorage!.toggleTask(id);
    const updated = tasks.find((t) => t.id === id);
    broadcastTasks();

    if (updated?.completed) {
      const pendingCount = tasks.filter((t) => !t.completed).length;
      if (pendingCount === 0 && tasks.length > 0) {
        // Celebrating!
        setMood('celebrating', 5000);
      } else {
        // Happy!
        setMood('happy', 3000);
      }
    } else {
      recomputeDefaultMood();
    }
    return tasks;
  });

  ipcMain.handle('tasks:delete', (_event, id: string) => {
    const tasks = taskStorage!.deleteTask(id);
    broadcastTasks();
    recomputeDefaultMood();
    return tasks;
  });

  ipcMain.handle('tasks:clear-completed', () => {
    const tasks = taskStorage!.clearCompleted();
    broadcastTasks();
    recomputeDefaultMood();
    return tasks;
  });

  ipcMain.handle('settings:update', (_event, newSettings) => {
    const settings = taskStorage!.updateSettings(newSettings);
    broadcastTasks();
    return settings;
  });

  ipcMain.handle('window:toggle-panel', () => {
    return togglePanel();
  });

  ipcMain.handle('window:close-panel', () => {
    if (panelWindow && panelWindow.isVisible()) {
      panelWindow.hide();
    }
  });

  ipcMain.handle('window:is-panel-open', () => {
    return Boolean(panelWindow && panelWindow.isVisible());
  });

  ipcMain.handle('window:move-cat', (_event, deltaX: number, deltaY: number) => {
    if (!catWindow) return;
    const [cx, cy] = catWindow.getPosition();
    const newX = cx + deltaX;
    const newY = cy + deltaY;
    catWindow.setPosition(newX, newY);

    if (panelWindow && panelWindow.isVisible()) {
      const [px, py] = panelWindow.getPosition();
      panelWindow.setPosition(px + deltaX, py + deltaY);
    }
  });

  let isWalking = false;

  ipcMain.handle('cat:walk', async () => {
    if (isWalking || !catWindow || catWindow.isDestroyed()) return;
    isWalking = true;
    setMood('walking');

    const currentDisplay = screen.getDisplayMatching(catWindow.getBounds());
    const workArea = currentDisplay.workArea;

    const [startX, currentY] = catWindow.getPosition();
    // If closer to right border, walk left (-1), otherwise walk right (+1)
    const walkRight = startX < workArea.x + workArea.width - 280;
    const stepDistance = walkRight ? 4 : -4;
    const totalSteps = 26;

    for (let i = 0; i < totalSteps; i++) {
      if (!catWindow || catWindow.isDestroyed()) break;
      const [cx, cy] = catWindow.getPosition();
      const nextX = cx + stepDistance;
      if (nextX >= workArea.x && nextX <= workArea.x + workArea.width - CAT_SIZE) {
        catWindow.setPosition(nextX, cy);
        if (panelWindow && panelWindow.isVisible() && !panelWindow.isDestroyed()) {
          const [px, py] = panelWindow.getPosition();
          panelWindow.setPosition(px + stepDistance, py);
        }
      }
      await new Promise((r) => setTimeout(r, 65));
    }

    isWalking = false;
    recomputeDefaultMood();
  });

  ipcMain.handle('cat:roll', () => {
    setMood('rolling', 2500);
  });

  ipcMain.handle('cat:set-mood', (_event, mood: CatMood) => {
    setMood(mood, 3000);
  });

  ipcMain.on('app:quit', () => {
    app.quit();
  });
}

// App lifecycle
app.whenReady().then(() => {
  taskStorage = new TaskStorage();
  setupIpc();
  createCatWindow();
  createPanelWindow();
  recomputeDefaultMood();

  app.on('activate', () => {
    if (BrowserWindowClass.getAllWindows().length === 0) {
      createCatWindow();
      createPanelWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
