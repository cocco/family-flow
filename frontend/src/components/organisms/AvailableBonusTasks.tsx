import React from 'react';
import { Card } from '../molecules/Card';
import type { BonusTaskDto } from '../../api/types';

export interface AvailableBonusTasksProps {
  tasks: BonusTaskDto[];
  onReserve: (taskId: string) => void;
}

export const AvailableBonusTasks: React.FC<AvailableBonusTasksProps> = ({ tasks, onReserve }) => {
  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">⭐ Available Bonus Tasks</h2>
        <p className="text-sm text-gray-600">Reserve these tasks to earn extra money</p>
      </div>
      <div className="p-6">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No bonus tasks available right now!</p>
            <p className="text-sm text-gray-400 mt-2">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        +${task.rewardAmount}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onReserve(task.id)}
                    className="ml-4 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Reserve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AvailableBonusTasks;


