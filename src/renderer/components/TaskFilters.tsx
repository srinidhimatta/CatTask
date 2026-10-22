import React from 'react';
import type { FilterType } from '../../types/todo.js';

interface TaskFiltersProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ currentFilter, onFilterChange, counts }) => {
  return (
    <div className="filter-tabs">
      <button
        type="button"
        className={`filter-tab ${currentFilter === 'all' ? 'active' : ''}`}
        onClick={() => onFilterChange('all')}
      >
        <span>All</span>
        <span className="tab-badge">{counts.all}</span>
      </button>

      <button
        type="button"
        className={`filter-tab ${currentFilter === 'active' ? 'active' : ''}`}
        onClick={() => onFilterChange('active')}
      >
        <span>Active</span>
        <span className="tab-badge">{counts.active}</span>
      </button>

      <button
        type="button"
        className={`filter-tab ${currentFilter === 'completed' ? 'active' : ''}`}
        onClick={() => onFilterChange('completed')}
      >
        <span>Done</span>
        <span className="tab-badge">{counts.completed}</span>
      </button>
    </div>
  );
};
