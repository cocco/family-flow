import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { mockClient } from '../api/mockClient';
import type { ChoreDto, BonusTaskDto, TaskReservationDto, ChildAllowanceSummaryDto } from '../api/types';

const ChildDashboard: React.FC = () => {
  const { currentUser, logout } = useApp();
  const [chores, setChores] = useState<ChoreDto[]>([]);
  const [availableTasks, setAvailableTasks] = useState<BonusTaskDto[]>([]);
  const [reservations, setReservations] = useState<TaskReservationDto[]>([]);
  const [allowanceSummary, setAllowanceSummary] = useState<ChildAllowanceSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskById, setTaskById] = useState<Record<string, BonusTaskDto>>({});

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    if (!currentUser) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const ctx = { currentUser };
        
        // Load all data in parallel
        const [choresResult, tasksResult, reservationsResult, allowanceResult] = await Promise.all([
          mockClient.listChoresByChild(ctx, currentUser.id, currentMonth, currentYear),
          mockClient.listAvailableBonusTasks(ctx),
          mockClient.listReservationsByChild(ctx, currentUser.id),
          mockClient.getAllowanceSummary(ctx, currentUser.id, currentMonth, currentYear),
        ]);

        if ('error' in choresResult) throw new Error(choresResult.error.message);
        if ('error' in tasksResult) throw new Error(tasksResult.error.message);
        if ('error' in reservationsResult) throw new Error(reservationsResult.error.message);
        if ('error' in allowanceResult) throw new Error(allowanceResult.error.message);

        setChores(choresResult.data);
        setAvailableTasks(tasksResult.data);
        // Build a lookup for tasks by id
        const lookup: Record<string, BonusTaskDto> = Object.fromEntries(tasksResult.data.map((t) => [t.id, t]));
        // Backfill task details for existing reservations that reference tasks no longer available
        for (const res of reservationsResult.data) {
          if (!lookup[res.taskId]) {
            const taskResp = await mockClient.getBonusTaskById(ctx, res.taskId);
            if ('data' in taskResp) {
              lookup[res.taskId] = taskResp.data;
            }
          }
        }
        setTaskById(lookup);
        setReservations(reservationsResult.data);
        setAllowanceSummary(allowanceResult.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, currentMonth, currentYear]);

  const handleCompleteChore = async (choreId: string) => {
    if (!currentUser) return;
    
    try {
      const result = await mockClient.completeChore({ currentUser }, choreId);
      if ('error' in result) {
        setError(result.error.message);
        return;
      }
      
      // Update local state
      setChores(prev => prev.map(chore => 
        chore.id === choreId ? result.data : chore
      ));
      // Refresh allowance summary after state-changing action
      try {
        const res = await mockClient.getAllowanceSummary({ currentUser }, currentUser.id, currentMonth, currentYear);
        if ('data' in res) setAllowanceSummary(res.data);
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete chore');
    }
  };

  const handleReserveTask = async (taskId: string) => {
    if (!currentUser) return;
    
    try {
      const result = await mockClient.reserveBonusTask({ currentUser }, taskId);
      if ('error' in result) {
        setError(result.error.message);
        return;
      }
      
      // Update local state
      // Capture the task details before removing from available list
      const reservedTask = availableTasks.find(t => t.id === taskId);
      if (reservedTask) {
        setTaskById(prev => ({ ...prev, [taskId]: reservedTask }));
      }
      setReservations(prev => [...prev, result.data]);
      setAvailableTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reserve task');
    }
  };

  const handleCompleteReservation = async (reservationId: string) => {
    if (!currentUser) return;
    
    try {
      const result = await mockClient.completeReservation({ currentUser }, reservationId);
      if ('error' in result) {
        setError(result.error.message);
        return;
      }
      
      // Update local state
      setReservations(prev => prev.map(res => 
        res.id === reservationId ? result.data : res
      ));
      // Refresh allowance summary after state-changing action
      try {
        const res = await mockClient.getAllowanceSummary({ currentUser }, currentUser.id, currentMonth, currentYear);
        if ('data' in res) setAllowanceSummary(res.data);
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task');
    }
  };

  // Combine chores and reserved tasks for unified display
  const allTasks = [
    ...chores.map(chore => ({
      id: chore.id,
      title: chore.title,
      description: chore.description,
      type: 'chore' as const,
      isCompleted: chore.isCompleted,
      completedAt: chore.completedAt,
      // approvals removed in trust-based flow
      rewardAmount: 0, // Monthly chores don't have individual rewards
    })),
    // Filter out reservations without a matching task to avoid "Unknown Task" entries
    ...reservations
      .filter(reservation => Boolean(taskById[reservation.taskId]))
      .map(reservation => {
        const task = taskById[reservation.taskId]!;
        return {
          id: reservation.id,
          title: task.title,
          description: task.description,
          type: 'bonus' as const,
          isCompleted: reservation.isCompleted,
          completedAt: reservation.completedAt,
          // approvals removed in trust-based flow
          rewardAmount: task.rewardAmount,
        };
      }),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {currentUser?.displayName}!
              </h1>
              <p className="text-gray-600">Your tasks and earnings</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Earnings Summary */}
          {allowanceSummary && (
            <div className="mb-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">💰 Monthly Earnings</h2>
                  <p className="text-yellow-100">
                    Base allowance: ${allowanceSummary.baseAllowance.toFixed(2)}
                    {allowanceSummary.bonusTotal > 0 && (
                      <span> + ${allowanceSummary.bonusTotal.toFixed(2)} bonus</span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-white">
                    ${allowanceSummary.total.toFixed(2)}
                  </div>
                  <p className="text-yellow-100 text-sm">Total this month</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* My Tasks */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">📋 My Monthly Tasks</h2>
                <p className="text-sm text-gray-600">Monthly chores and reserved bonus tasks</p>
              </div>
              <div className="p-6">
                {allTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tasks assigned yet!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`border rounded-lg p-4 ${
                          task.isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        } ${task.type === 'bonus' ? 'border-l-4 border-l-blue-400' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">{task.title}</h3>
                              {task.type === 'bonus' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  +${task.rewardAmount}
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                            )}
                            {task.isCompleted && (
                              <div className="mt-2 flex items-center space-x-2 text-sm">
                                <span className="text-green-600">✅ Completed</span>
                                {/* No approval state in trust-based flow */}
                              </div>
                            )}
                          </div>
                          {!task.isCompleted && (
                            <button
                              onClick={() => 
                                task.type === 'chore' 
                                  ? handleCompleteChore(task.id)
                                  : handleCompleteReservation(task.id)
                              }
                              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              Mark Done
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Available Bonus Tasks */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">⭐ Available Bonus Tasks</h2>
                <p className="text-sm text-gray-600">Reserve these tasks to earn extra money</p>
              </div>
              <div className="p-6">
                {availableTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No bonus tasks available right now!</p>
                    <p className="text-sm text-gray-400 mt-2">Check back later for new opportunities</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableTasks.map((task) => (
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
                            onClick={() => handleReserveTask(task.id)}
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChildDashboard;
