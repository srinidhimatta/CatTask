import React from 'react';

interface TaskProgressProps {
  total: number;
  completed: number;
  remaining: number;
}

export const TaskProgress: React.FC<TaskProgressProps> = ({ total, completed, remaining }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="panel-progress-section">
      <div className="progress-header">
        <div className="progress-counts">
          <span>Daily Progress</span>
          <span className="progress-badge">
            {completed}/{total}
          </span>
        </div>
        <div className="progress-pct">{percentage}%</div>
      </div>

      <div className="progress-track" title={`${percentage}% completed`}>
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>

      <div className="progress-stats-row">
        <span>🐾 {remaining} task{remaining === 1 ? '' : 's'} remaining</span>
        <span>{total === 0 ? 'Ready to plan' : percentage === 100 ? 'All finished! 🎉' : 'Keep going! ✨'}</span>
      </div>
    </div>
  );
};
