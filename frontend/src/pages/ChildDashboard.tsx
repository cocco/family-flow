import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { mockClient } from '../api/mockClient';
import type { ChoreDto, BonusTaskDto, TaskReservationDto, ChildAllowanceSummaryDto } from '../api/types';
import EarningsSummary from '../components/organisms/EarningsSummary';
import MyTasksList from '../components/organisms/MyTasksList';
import AvailableBonusTasks from '../components/organisms/AvailableBonusTasks';

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

          <EarningsSummary summary={allowanceSummary} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MyTasksList
              tasks={allTasks}
              onCompleteChore={handleCompleteChore}
              onCompleteReservation={handleCompleteReservation}
            />
            <AvailableBonusTasks tasks={availableTasks} onReserve={handleReserveTask} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChildDashboard;
