import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import type { Task } from '../../types/todo.js';
import { sound } from '../utils/sound.js';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const handleToggle = () => {
    if (!task.completed) {
      sound.playChime();
    }
    onToggle(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playDelete();
    onDelete(task.id);
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-left" onClick={handleToggle} style={{ cursor: 'pointer' }}>
        <button
          type="button"
          className={`checkbox-custom ${task.completed ? 'checked' : ''}`}
          aria-label={task.completed ? 'Mark task active' : 'Mark task completed'}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
        >
          {task.completed && <Check size={13} strokeWidth={3} />}
        </button>
        <span className="task-title">{task.title}</span>
      </div>

      <button
        type="button"
        className="delete-btn"
        title="Delete task"
        onClick={handleDelete}
        aria-label="Delete task"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
};
