import electron from 'electron';
const { contextBridge, ipcRenderer } = electron;
import type { TaskPriority, TaskStorageData, CatMood } from '../types/todo.js';

const catApi = {
  getTasks: (): Promise<TaskStorageData> => ipcRenderer.invoke('tasks:get'),
  addTask: (title: string, priority?: TaskPriority) => ipcRenderer.invoke('tasks:add', title, priority),
  toggleTask: (id: string) => ipcRenderer.invoke('tasks:toggle', id),
  deleteTask: (id: string) => ipcRenderer.invoke('tasks:delete', id),
  clearCompleted: () => ipcRenderer.invoke('tasks:clear-completed'),
  updateSettings: (settings: Partial<TaskStorageData['settings']>) => ipcRenderer.invoke('settings:update', settings),

  togglePanel: (): Promise<boolean> => ipcRenderer.invoke('window:toggle-panel'),
  closePanel: (): Promise<void> => ipcRenderer.invoke('window:close-panel'),
  isPanelOpen: (): Promise<boolean> => ipcRenderer.invoke('window:is-panel-open'),
  moveCatWindow: (deltaX: number, deltaY: number): Promise<void> => ipcRenderer.invoke('window:move-cat', deltaX, deltaY),
  quitApp: () => ipcRenderer.send('app:quit'),

  setCatMood: (mood: CatMood): Promise<void> => ipcRenderer.invoke('cat:set-mood', mood),

  onTasksUpdated: (callback: (data: TaskStorageData) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: TaskStorageData) => callback(data);
    ipcRenderer.on('tasks:updated', listener);
    return () => {
      ipcRenderer.removeListener('tasks:updated', listener);
    };
  },

  onCatMoodChanged: (callback: (mood: CatMood) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, mood: CatMood) => callback(mood);
    ipcRenderer.on('cat:mood-changed', listener);
    return () => {
      ipcRenderer.removeListener('cat:mood-changed', listener);
    };
  }
};

contextBridge.exposeInMainWorld('catApi', catApi);
