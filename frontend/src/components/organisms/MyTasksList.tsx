import React from 'react';
import { Card } from '../molecules/Card';
import { TaskItem } from '../molecules/TaskItem';

export interface UnifiedTask {
  id: string;
  title: string;
  description?: string;
  type: 'chore' | 'bonus';
  isCompleted: boolean;
  completedAt?: string;
  rewardAmount: number;
}

export interface MyTasksListProps {
  tasks: UnifiedTask[];
  onCompleteChore: (choreId: string) => void;
  onCompleteReservation: (reservationId: string) => void;
}

export const MyTasksList: React.FC<MyTasksListProps> = ({ tasks, onCompleteChore, onCompleteReservation }) => {
  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">📋 My Monthly Tasks</h2>
        <p className="text-sm text-gray-600">Monthly chores and reserved bonus tasks</p>
      </div>
      <div className="p-6">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tasks assigned yet!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                type={task.type}
                isCompleted={task.isCompleted}
                rewardAmount={task.rewardAmount}
                onMarkDone={(id, type) =>
                  type === 'chore' ? onCompleteChore(id) : onCompleteReservation(id)
                }
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MyTasksList;


