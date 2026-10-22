import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Task, FilterType, TaskStorageData, CatMood } from '../../types/todo.js';
import { TaskProgress } from './TaskProgress.js';
import { TaskFilters } from './TaskFilters.js';
import { TaskInput } from './TaskInput.js';
import { TaskItem } from './TaskItem.js';
import { sound } from '../utils/sound.js';
import '../styles/taskPanel.css';

export const TaskPanel: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentMood, setCurrentMood] = useState<CatMood>('idle');

  // Load tasks on mount and register listeners
  useEffect(() => {
    if (window.catApi) {
      window.catApi.getTasks().then((data: TaskStorageData) => {
        setTasks(data.tasks);
        setSoundEnabled(data.settings.soundEnabled);
        sound.setEnabled(data.settings.soundEnabled);
      });

      const unsubTasks = window.catApi.onTasksUpdated((data: TaskStorageData) => {
        setTasks(data.tasks);
        setSoundEnabled(data.settings.soundEnabled);
        sound.setEnabled(data.settings.soundEnabled);
      });

      const unsubMood = window.catApi.onCatMoodChanged((mood: CatMood) => {
        setCurrentMood(mood);
      });

      return () => {
        unsubTasks();
        unsubMood();
      };
    }
  }, []);

  // Escape key closes panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.catApi?.closePanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddTask = async (title: string) => {
    if (window.catApi) {
      await window.catApi.addTask(title);
    } else {
      // Local development fallback
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title,
        completed: false,
        createdAt: Date.now()
      };
      setTasks([newTask, ...tasks]);
    }
  };

  const handleToggleTask = async (id: string) => {
    if (window.catApi) {
      const updated = await window.catApi.toggleTask(id);
      setTasks(updated);
    } else {
      setTasks(
        tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.catApi) {
      const updated = await window.catApi.deleteTask(id);
      setTasks(updated);
    } else {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  const handleClearCompleted = async () => {
    if (window.catApi) {
      const updated = await window.catApi.clearCompleted();
      setTasks(updated);
    } else {
      setTasks(tasks.filter((t) => !t.completed));
    }
  };

  const handleToggleSound = async () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    sound.setEnabled(nextVal);
    if (nextVal) {
      sound.playPop();
    }
    if (window.catApi) {
      await window.catApi.updateSettings({ soundEnabled: nextVal });
    }
  };

  const handleClose = () => {
    window.catApi?.closePanel();
  };

  // Calculations
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  // Dynamic greeting
  const getGreeting = () => {
    if (totalCount === 0) return 'Ready for a fresh start! 🐾';
    if (activeCount === 0) return 'Purr-fect! All tasks completed! ✨';
    if (activeCount === 1) return 'Only 1 task remaining! Almost there!';
    return "Let's get things done!";
  };

  // Cat mini avatar emoji depending on mood
  const getMoodEmoji = () => {
    if (currentMood === 'celebrating') return '🎉';
    if (currentMood === 'happy') return '😺';
    if (currentMood === 'sleepy') return '😴';
    if (currentMood === 'curious') return '😸';
    return '🐱';
  };

  return (
    <div className="panel-window-wrapper">
      <div className="task-panel">
        {/* Header */}
        <header className="panel-header">
          <div className="header-brand">
            <div className="header-avatar" title={`Cat is currently ${currentMood}`}>
              {getMoodEmoji()}
            </div>
            <div className="header-title-box">
              <span className="header-app-name">CatTask</span>
              <span className="header-greeting">{getGreeting()}</span>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={handleToggleSound}
              title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              type="button"
              className="icon-btn close-btn"
              onClick={handleClose}
              title="Close panel"
              aria-label="Close panel"
            >
              <X size={17} />
            </button>
          </div>
        </header>

        {/* Progress Bar & Stats */}
        <TaskProgress
          total={totalCount}
          completed={completedCount}
          remaining={activeCount}
        />

        {/* Filter Tabs */}
        <TaskFilters
          currentFilter={filter}
          onFilterChange={setFilter}
          counts={{
            all: totalCount,
            active: activeCount,
            completed: completedCount
          }}
        />

        {/* Task Input Field */}
        <TaskInput onAddTask={handleAddTask} />

        {/* Task List */}
        <div className="task-list-container">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            ))
          ) : (
            /* Empty States */
            <div className="empty-state-box">
              {totalCount === 0 ? (
                <>
                  <div className="empty-icon">🐱💤</div>
                  <div className="empty-title">Nothing to do right now.</div>
                  <div className="empty-subtitle">Time to relax! Add a task above whenever you're ready.</div>
                </>
              ) : filter === 'completed' ? (
                <>
                  <div className="empty-icon">🌱</div>
                  <div className="empty-title">No completed tasks yet.</div>
                  <div className="empty-subtitle">Check off an active task to see it here!</div>
                </>
              ) : filter === 'active' ? (
                <>
                  <div className="empty-icon">✨🏆</div>
                  <div className="empty-title">Hooray! All caught up!</div>
                  <div className="empty-subtitle">Every task is completed. Your cat is so proud of you!</div>
                </>
              ) : (
                <>
                  <div className="empty-icon">🐾</div>
                  <div className="empty-title">No tasks found.</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="panel-footer">
          {completedCount > 0 ? (
            <button
              type="button"
              className="clear-completed-btn"
              onClick={handleClearCompleted}
            >
              Clear completed ({completedCount})
            </button>
          ) : (
            <span className="footer-tip">Tip: Drag the cat anywhere!</span>
          )}

          <span className="footer-tip">Press Esc to close</span>
        </footer>
      </div>
    </div>
  );
};
