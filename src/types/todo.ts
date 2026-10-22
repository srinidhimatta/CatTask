export type TaskPriority = 'low' | 'medium' | 'high';
export type FilterType = 'all' | 'active' | 'completed';
export type CatMood = 'idle' | 'happy' | 'celebrating' | 'sleepy' | 'curious' | 'walking' | 'rolling';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  priority?: TaskPriority;
}

export interface TaskStorageData {
  tasks: Task[];
  settings: {
    soundEnabled: boolean;
    catTheme: string;
    alwaysOnTop: boolean;
  };
  stats: {
    totalCreated: number;
    totalCompleted: number;
  };
}

export interface CatWindowApi {
  // Task operations
  getTasks: () => Promise<TaskStorageData>;
  addTask: (title: string, priority?: TaskPriority) => Promise<Task>;
  toggleTask: (id: string) => Promise<Task[]>;
  deleteTask: (id: string) => Promise<Task[]>;
  clearCompleted: () => Promise<Task[]>;
  updateSettings: (settings: Partial<TaskStorageData['settings']>) => Promise<TaskStorageData['settings']>;
  
  // Window management
  togglePanel: () => Promise<boolean>;
  closePanel: () => Promise<void>;
  isPanelOpen: () => Promise<boolean>;
  startDrag: () => void;
  moveCatWindow: (deltaX: number, deltaY: number) => Promise<void>;
  quitApp: () => void;
  
  // Events
  onTasksUpdated: (callback: (data: TaskStorageData) => void) => () => void;
  onCatMoodChanged: (callback: (mood: CatMood) => void) => () => void;
  setCatMood: (mood: CatMood) => Promise<void>;
}

declare global {
  interface Window {
    catApi?: CatWindowApi;
  }
}
