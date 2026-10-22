const { contextBridge, ipcRenderer } = require('electron');

const catApi = {
  getTasks: () => ipcRenderer.invoke('tasks:get'),
  addTask: (title, priority) => ipcRenderer.invoke('tasks:add', title, priority),
  toggleTask: (id) => ipcRenderer.invoke('tasks:toggle', id),
  deleteTask: (id) => ipcRenderer.invoke('tasks:delete', id),
  clearCompleted: () => ipcRenderer.invoke('tasks:clear-completed'),
  updateSettings: (settings) => ipcRenderer.invoke('settings:update', settings),
  togglePanel: () => ipcRenderer.invoke('window:toggle-panel'),
  closePanel: () => ipcRenderer.invoke('window:close-panel'),
  isPanelOpen: () => ipcRenderer.invoke('window:is-panel-open'),
  moveCatWindow: (deltaX, deltaY) => ipcRenderer.invoke('window:move-cat', deltaX, deltaY),
  walkCat: () => ipcRenderer.invoke('cat:walk'),
  rollCat: () => ipcRenderer.invoke('cat:roll'),
  quitApp: () => ipcRenderer.send('app:quit'),
  setCatMood: (mood) => ipcRenderer.invoke('cat:set-mood', mood),
  onTasksUpdated: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('tasks:updated', listener);
    return () => {
      ipcRenderer.removeListener('tasks:updated', listener);
    };
  },
  onCatMoodChanged: (callback) => {
    const listener = (_event, mood) => callback(mood);
    ipcRenderer.on('cat:mood-changed', listener);
    return () => {
      ipcRenderer.removeListener('cat:mood-changed', listener);
    };
  }
};

contextBridge.exposeInMainWorld('catApi', catApi);
