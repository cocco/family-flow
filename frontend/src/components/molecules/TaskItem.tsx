import React from 'react';

export interface TaskItemProps {
  id: string;
  title: string;
  description?: string;
  type: 'chore' | 'bonus';
  isCompleted: boolean;
  rewardAmount?: number;
  onMarkDone?: (id: string, type: 'chore' | 'bonus') => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ id, title, description, type, isCompleted, rewardAmount = 0, onMarkDone }) => {
  return (
    <div
      className={`border rounded-lg p-4 ${
        isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      } ${type === 'bonus' ? 'border-l-4 border-l-blue-400' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-900">{title}</h3>
            {type === 'bonus' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                +${rewardAmount}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
          {isCompleted && (
            <div className="mt-2 flex items-center space-x-2 text-sm">
              <span className="text-green-600">✅ Completed</span>
            </div>
          )}
        </div>
        {!isCompleted && onMarkDone && (
          <button
            onClick={() => onMarkDone(id, type)}
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Mark Done
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskItem;


