import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { sound } from '../utils/sound.js';

interface TaskInputProps {
  onAddTask: (title: string) => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    sound.playPop();
    onAddTask(trimmed);
    setText('');
  };

  return (
    <div className="task-input-section">
      <form className="task-input-form" onSubmit={handleSubmit}>
        <div className="task-input-box">
          <input
            type="text"
            className="task-text-input"
            placeholder="What do you need to do?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={120}
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="add-btn"
          disabled={!text.trim()}
          style={{ opacity: text.trim() ? 1 : 0.6 }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
};
