import fs from 'node:fs';
import path from 'node:path';
import electron from 'electron';
import type { Task, TaskPriority, TaskStorageData } from '../types/todo.js';

const app = electron?.app || electron;

const DEFAULT_DATA: TaskStorageData = {
  tasks: [
    {
      id: 'task-welcome-1',
      title: 'Welcome to CatTask! Click the cat to open/hide me 🐾',
      completed: true,
      createdAt: Date.now() - 3600000,
      completedAt: Date.now() - 1800000,
      priority: 'low'
    },
    {
      id: 'task-welcome-2',
      title: 'Check off a task to make your cat happy! ✨',
      completed: false,
      createdAt: Date.now() - 1800000,
      priority: 'medium'
    },
    {
      id: 'task-welcome-3',
      title: 'Try dragging your cat anywhere on screen 🖱️',
      completed: false,
      createdAt: Date.now() - 900000,
      priority: 'high'
    }
  ],
  settings: {
    soundEnabled: true,
    catTheme: 'orange-tabby',
    alwaysOnTop: true
  },
  stats: {
    totalCreated: 3,
    totalCompleted: 1
  }
};

export class TaskStorage {
  private filePath: string;
  private data: TaskStorageData;

  constructor(customPath?: string) {
    // Store in user app data directory (e.g. %APPDATA%/cattask/tasks.json)
    const userDataPath = customPath || (app?.getPath ? app.getPath('userData') : (process.env.APPDATA ? path.join(process.env.APPDATA, 'cattask') : path.join(process.cwd(), 'userData')));
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    this.filePath = path.join(userDataPath, 'cattask-storage.json');
    this.data = this.load();
  }

  private load(): TaskStorageData {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.tasks)) {
          return {
            tasks: parsed.tasks,
            settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) },
            stats: { ...DEFAULT_DATA.stats, ...(parsed.stats || {}) }
          };
        }
      }
    } catch (err) {
      console.error('[TaskStorage] Error loading storage, falling back to defaults:', err);
    }

    // Initialize with default data
    this.saveDirect(DEFAULT_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  private saveDirect(data: TaskStorageData): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[TaskStorage] Failed to save storage:', err);
    }
  }

  public getData(): TaskStorageData {
    return this.data;
  }

  public addTask(title: string, priority: TaskPriority = 'medium'): Task {
    const trimmed = title.trim();
    if (!trimmed) {
      throw new Error('Task title cannot be empty');
    }

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
      priority
    };

    this.data.tasks.unshift(newTask);
    this.data.stats.totalCreated += 1;
    this.saveDirect(this.data);
    return newTask;
  }

  public toggleTask(id: string): Task[] {
    const task = this.data.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      if (task.completed) {
        task.completedAt = Date.now();
        this.data.stats.totalCompleted += 1;
      } else {
        delete task.completedAt;
        if (this.data.stats.totalCompleted > 0) {
          this.data.stats.totalCompleted -= 1;
        }
      }
      this.saveDirect(this.data);
    }
    return this.data.tasks;
  }

  public deleteTask(id: string): Task[] {
    const index = this.data.tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.data.tasks.splice(index, 1);
      this.saveDirect(this.data);
    }
    return this.data.tasks;
  }

  public clearCompleted(): Task[] {
    this.data.tasks = this.data.tasks.filter((t) => !t.completed);
    this.saveDirect(this.data);
    return this.data.tasks;
  }

  public updateSettings(newSettings: Partial<TaskStorageData['settings']>): TaskStorageData['settings'] {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveDirect(this.data);
    return this.data.settings;
  }
}
