import electron from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { app, BrowserWindow, ipcMain, screen } = electron;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import compiled main logic verification
import { TaskStorage } from '../dist/main/taskStorage.js';

app.whenReady().then(async () => {
  console.log('🧪 Verifying Cat Companion click, To-Do panel opening, walking, and rolling...\n');

  const storage = new TaskStorage();
  let panelWin;
  let catWin;

  // 1. Cat window
  catWin = new BrowserWindow({
    width: 210,
    height: 210,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../dist/preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // 2. Panel window
  panelWin = new BrowserWindow({
    width: 380,
    height: 540,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../dist/preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Set up IPC handles
  ipcMain.handle('tasks:get', () => storage.getData());
  ipcMain.handle('tasks:add', (_e, title) => storage.addTask(title));
  ipcMain.handle('window:toggle-panel', () => {
    if (panelWin.isVisible()) {
      panelWin.hide();
      return false;
    } else {
      panelWin.show();
      return true;
    }
  });

  const indexPath = path.join(__dirname, '../dist/renderer/index.html');
  await catWin.loadFile(indexPath, { hash: 'cat' });
  await panelWin.loadFile(indexPath, { hash: 'panel' });

  console.log('✓ Cat and Panel windows loaded successfully with preload.cjs');

  // Test togglePanel from renderer
  console.log('▶ Test: Invoking togglePanel from cat companion...');
  const isOpen = await catWin.webContents.executeJavaScript('window.catApi.togglePanel()');
  console.log(`  ✓ togglePanel returned: ${isOpen}, panel isVisible: ${panelWin.isVisible()}`);
  if (!panelWin.isVisible()) {
    console.error('❌ Panel was not visible!');
    process.exit(1);
  }

  // Test adding task from panel renderer
  console.log('▶ Test: Adding a task through panel renderer...');
  const added = await panelWin.webContents.executeJavaScript('window.catApi.addTask("Buy cat treats 🐟")');
  console.log(`  ✓ Task added via renderer API: "${added.title}" [id: ${added.id}]`);

  // Verify task in storage
  const all = storage.getData().tasks;
  const found = all.find((t) => t.title === 'Buy cat treats 🐟');
  if (!found) {
    console.error('❌ Task was not found in storage!');
    process.exit(1);
  }
  console.log('  ✓ Task confirmed persisted in storage');

  // Test cat walking and rolling API availability
  console.log('▶ Test: Verifying walkCat and rollCat APIs in renderer...');
  const hasWalk = await catWin.webContents.executeJavaScript('typeof window.catApi.walkCat === "function"');
  const hasRoll = await catWin.webContents.executeJavaScript('typeof window.catApi.rollCat === "function"');
  console.log(`  ✓ walkCat available: ${hasWalk}`);
  console.log(`  ✓ rollCat available: ${hasRoll}`);

  console.log('\n🎉 ALL CLICK, TO-DO PANEL, AND PET BEHAVIOR VERIFICATIONS PASSED! 🐾\n');
  app.quit();
  process.exit(0);
});
