import type { CatWindowApi, TaskStorageData, Task, TaskPriority, CatMood } from '../../types/todo.js';
import { sound } from './sound.js';

const STORAGE_KEY = 'cattask_storage_data_v1';

const INITIAL_WEB_DATA: TaskStorageData = {
  tasks: [
    {
      id: 'task-1',
      title: 'Welcome to CatTask! 🐾',
      completed: false,
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'task-2',
      title: 'Click the cute black cat or [ 📋 Tasks ] to open this panel ✨',
      completed: false,
      createdAt: Date.now() - 1800000,
    },
    {
      id: 'task-3',
      title: 'Check off this task to see me celebrate! 🎉',
      completed: true,
      createdAt: Date.now() - 600000,
      completedAt: Date.now() - 300000,
    }
  ],
  settings: {
    soundEnabled: true,
    catTheme: 'black-pixel',
    alwaysOnTop: true,
  },
  stats: {
    totalCreated: 3,
    totalCompleted: 1,
  }
};

class WebCatApiAdapter implements CatWindowApi {
  public isWebFallback = true;
  private data: TaskStorageData;
  private currentMood: CatMood = 'idle';
  private panelOpen = false;

  private taskListeners: Set<(data: TaskStorageData) => void> = new Set();
  private moodListeners: Set<(mood: CatMood) => void> = new Set();
  private panelListeners: Set<(isOpen: boolean) => void> = new Set();
  private positionListeners: Set<(pos: { x: number; y: number }) => void> = new Set();

  private catPos = { x: 0, y: 0 };

  constructor() {
    this.data = this.loadData();
    // Bind methods to ensure correct `this`
    this.getTasks = this.getTasks.bind(this);
    this.addTask = this.addTask.bind(this);
    this.toggleTask = this.toggleTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.clearCompleted = this.clearCompleted.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
    this.togglePanel = this.togglePanel.bind(this);
    this.closePanel = this.closePanel.bind(this);
    this.isPanelOpen = this.isPanelOpen.bind(this);
    this.startDrag = this.startDrag.bind(this);
    this.moveCatWindow = this.moveCatWindow.bind(this);
    this.quitApp = this.quitApp.bind(this);
    this.onTasksUpdated = this.onTasksUpdated.bind(this);
    this.onCatMoodChanged = this.onCatMoodChanged.bind(this);
    this.setCatMood = this.setCatMood.bind(this);
    this.walkCat = this.walkCat.bind(this);
  }

  private loadData(): TaskStorageData {
    if (typeof window === 'undefined' || !window.localStorage) {
      return INITIAL_WEB_DATA;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors and fallback
    }
    return INITIAL_WEB_DATA;
  }

  private saveData(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (err) {
        console.warn('Failed to save to localStorage:', err);
      }
    }
    this.notifyTasksUpdated();
  }

  private notifyTasksUpdated(): void {
    const clone = JSON.parse(JSON.stringify(this.data));
    this.taskListeners.forEach((cb) => {
      try {
        cb(clone);
      } catch (err) {
        console.error(err);
      }
    });
  }

  private notifyMoodChanged(mood: CatMood): void {
    this.currentMood = mood;
    this.moodListeners.forEach((cb) => {
      try {
        cb(mood);
      } catch (err) {
        console.error(err);
      }
    });
  }

  private notifyPanelChanged(isOpen: boolean): void {
    this.panelOpen = isOpen;
    this.panelListeners.forEach((cb) => {
      try {
        cb(isOpen);
      } catch (err) {
        console.error(err);
      }
    });
  }

  public async getTasks(): Promise<TaskStorageData> {
    return JSON.parse(JSON.stringify(this.data));
  }

  public async addTask(title: string, priority?: TaskPriority): Promise<Task> {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      completed: false,
      createdAt: Date.now(),
      priority,
    };

    this.data.tasks.unshift(newTask);
    this.data.stats.totalCreated += 1;
    this.saveData();

    sound.playPop();
    this.notifyMoodChanged('happy');
    setTimeout(() => {
      if (this.currentMood === 'happy') {
        this.notifyMoodChanged('idle');
      }
    }, 2500);

    return newTask;
  }

  public async toggleTask(id: string): Promise<Task[]> {
    let nowCompleted = false;
    this.data.tasks = this.data.tasks.map((task) => {
      if (task.id === id) {
        const nextState = !task.completed;
        nowCompleted = nextState;
        return {
          ...task,
          completed: nextState,
          completedAt: nextState ? Date.now() : undefined,
        };
      }
      return task;
    });

    if (nowCompleted) {
      this.data.stats.totalCompleted += 1;
      const allDone = this.data.tasks.length > 0 && this.data.tasks.every((t) => t.completed);

      if (allDone) {
        sound.playCelebrate();
        this.notifyMoodChanged('celebrating');
        setTimeout(() => {
          if (this.currentMood === 'celebrating') {
            this.notifyMoodChanged('idle');
          }
        }, 4000);
      } else {
        sound.playSuccess();
        this.notifyMoodChanged('happy');
        setTimeout(() => {
          if (this.currentMood === 'happy') {
            this.notifyMoodChanged('idle');
          }
        }, 2500);
      }
    } else {
      sound.playPop();
    }

    this.saveData();
    return JSON.parse(JSON.stringify(this.data.tasks));
  }

  public async deleteTask(id: string): Promise<Task[]> {
    this.data.tasks = this.data.tasks.filter((t) => t.id !== id);
    this.saveData();
    sound.playPop();
    return JSON.parse(JSON.stringify(this.data.tasks));
  }

  public async clearCompleted(): Promise<Task[]> {
    this.data.tasks = this.data.tasks.filter((t) => !t.completed);
    this.saveData();
    sound.playPop();
    return JSON.parse(JSON.stringify(this.data.tasks));
  }

  public async updateSettings(settings: Partial<TaskStorageData['settings']>): Promise<TaskStorageData['settings']> {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveData();
    return { ...this.data.settings };
  }

  public async togglePanel(): Promise<boolean> {
    const nextState = !this.panelOpen;
    this.notifyPanelChanged(nextState);
    return nextState;
  }

  public async closePanel(): Promise<void> {
    this.notifyPanelChanged(false);
  }

  public async isPanelOpen(): Promise<boolean> {
    return this.panelOpen;
  }

  public startDrag(): void {
    // no-op in browser
  }

  public async moveCatWindow(deltaX: number, deltaY: number): Promise<void> {
    this.catPos = {
      x: this.catPos.x + deltaX,
      y: this.catPos.y + deltaY,
    };
    this.positionListeners.forEach((cb) => cb(this.catPos));
  }

  public quitApp(): void {
    // In web, reset demo data or friendly note
    console.log('CatTask quit requested');
  }

  public onTasksUpdated(callback: (data: TaskStorageData) => void): () => void {
    this.taskListeners.add(callback);
    return () => this.taskListeners.delete(callback);
  }

  public onCatMoodChanged(callback: (mood: CatMood) => void): () => void {
    this.moodListeners.add(callback);
    return () => this.moodListeners.delete(callback);
  }

  public onPanelVisibilityChanged(callback: (isOpen: boolean) => void): () => void {
    this.panelListeners.add(callback);
    return () => this.panelListeners.delete(callback);
  }

  public onCatPositionChanged(callback: (pos: { x: number; y: number }) => void): () => void {
    this.positionListeners.add(callback);
    return () => this.positionListeners.delete(callback);
  }

  public async setCatMood(mood: CatMood): Promise<void> {
    this.notifyMoodChanged(mood);
  }

  public walkCat(): void {
    this.notifyMoodChanged('walking');
    sound.playMeow();
    // Walk for 6 seconds, then roll playfully for 4 seconds, then idle
    setTimeout(() => {
      this.notifyMoodChanged('rolling');
      sound.playPurr();
      setTimeout(() => {
        this.notifyMoodChanged('idle');
      }, 4000);
    }, 6000);
  }
}

export function initWebAdapter(): void {
  if (typeof window !== 'undefined' && !window.catApi) {
    (window as any).catApi = new WebCatApiAdapter();
    console.log('🐾 CatTask Web Adapter initialized with localStorage persistence.');
  }
}
