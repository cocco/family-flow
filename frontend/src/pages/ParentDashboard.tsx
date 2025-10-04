import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { mockClient } from '../api/mockClient';
import type { UserDto } from '../api/types';

const ParentDashboard: React.FC = () => {
  const { currentUser, logout } = useApp();
  const [children, setChildren] = useState<UserDto[]>([]);
  // Trust-based flow: no pending approvals
  const [summaries, setSummaries] = useState<
    { childId: string; baseAllowance: number; bonusTotal: number; total: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI-only modals (client-side placeholders)
  const [isChoreModalOpen, setIsChoreModalOpen] = useState(false);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [newChore, setNewChore] = useState({ title: '', description: '' });
  const [newBonus, setNewBonus] = useState({ title: '', description: '', rewardAmount: 0 });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const childById = useMemo(() => {
    return Object.fromEntries(children.map((c) => [c.id, c]));
  }, [children]);

  useEffect(() => {
    if (!currentUser) return;
    const ctx = { currentUser };

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [familyRes, summariesRes] = await Promise.all([
          mockClient.listFamily(ctx),
          mockClient.listMonthlySummaries(ctx, currentMonth, currentYear),
        ]);

        if ('error' in familyRes) throw new Error(familyRes.error.message);
        if ('error' in summariesRes) throw new Error(summariesRes.error.message);

        const childUsers = familyRes.data.filter((u) => u.role === 'child');
        setChildren(childUsers);
        setSummaries(summariesRes.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser, currentMonth, currentYear]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading family dashboard...</p>
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
              <p className="text-gray-600">Parent Dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsChoreModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Create Chore
              </button>
              <button
                onClick={() => setIsBonusModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Create Bonus Task
              </button>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Family Overview */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">👨‍👩‍👧‍👦</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Family Overview</div>
                      <div className="mt-1 text-lg font-semibold text-gray-900">
                        {children.length} {children.length === 1 ? 'child' : 'children'}
                      </div>
                      <div className="mt-4 space-y-2">
                        {children.map((child) => {
                          const summary = summaries.find((s) => s.childId === child.id);
                          return (
                            <div key={child.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{child.displayName}</div>
                                <div className="text-xs text-gray-500">Base ${child.monthlyAllowance.toFixed(2)}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-700">Bonus {(summary?.bonusTotal ?? 0).toFixed(2)}</div>
                                <div className="text-base font-semibold text-gray-900">Total {(summary?.total ?? child.monthlyAllowance).toFixed(2)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Family Totals */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Σ</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Family Totals (This Month)</div>
                      <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xs text-gray-500">Base</div>
                          <div className="text-lg font-semibold text-gray-900">
                            ${summaries.reduce((sum, s) => sum + s.baseAllowance, 0).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Bonus</div>
                          <div className="text-lg font-semibold text-gray-900">
                            ${summaries.reduce((sum, s) => sum + s.bonusTotal, 0).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Total</div>
                          <div className="text-lg font-semibold text-gray-900">
                            ${summaries.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Tasks */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">➕</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Create Tasks</div>
                      <div className="mt-3 flex gap-3">
                        <button
                          onClick={() => setIsChoreModalOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                          New Chore
                        </button>
                        <button
                          onClick={() => setIsBonusModalOpen(true)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                          New Bonus Task
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Summaries */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">💰 Monthly Allowance Summaries</h2>
              <p className="text-sm text-gray-600">For {now.toLocaleString(undefined, { month: 'long' })} {currentYear}</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => {
                const s = summaries.find((x) => x.childId === child.id);
                return (
                  <div key={child.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{child.displayName}</div>
                        <div className="text-sm text-gray-600">Base ${child.monthlyAllowance.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-700">Bonus {(s?.bonusTotal ?? 0).toFixed(2)}</div>
                        <div className="text-lg font-semibold text-gray-900">Total {(s?.total ?? child.monthlyAllowance).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chore Modal */}
          {isChoreModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-gray-900">Create Chore</h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700">Title</label>
                    <input
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={newChore.title}
                      onChange={(e) => setNewChore({ ...newChore, title: e.target.value })}
                      placeholder="e.g., Take out trash"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Description (optional)</label>
                    <textarea
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={newChore.description}
                      onChange={(e) => setNewChore({ ...newChore, description: e.target.value })}
                      placeholder="Add details"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => setIsChoreModalOpen(false)}
                    className="px-4 py-2 text-sm rounded-md border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const ctx = { currentUser };
                      const res = await mockClient.createChoresForAllChildren(ctx, newChore.title, newChore.description, currentMonth, currentYear);
                      if ('error' in res) {
                        setError(res.error.message);
                      } else {
                        setError(null);
                      }
                      setIsChoreModalOpen(false);
                      setNewChore({ title: '', description: '' });
                    }}
                    className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white"
                    disabled={!newChore.title}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bonus Task Modal */}
          {isBonusModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-gray-900">Create Bonus Task</h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700">Title</label>
                    <input
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={newBonus.title}
                      onChange={(e) => setNewBonus({ ...newBonus, title: e.target.value })}
                      placeholder="e.g., Wash the car"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Description (optional)</label>
                    <textarea
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={newBonus.description}
                      onChange={(e) => setNewBonus({ ...newBonus, description: e.target.value })}
                      placeholder="Add details"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Reward Amount ($)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={newBonus.rewardAmount}
                      onChange={(e) => setNewBonus({ ...newBonus, rewardAmount: Number(e.target.value) })}
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => setIsBonusModalOpen(false)}
                    className="px-4 py-2 text-sm rounded-md border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // UI-only: no persistence in Phase 2
                      setIsBonusModalOpen(false);
                      setNewBonus({ title: '', description: '', rewardAmount: 0 });
                    }}
                    className="px-4 py-2 text-sm rounded-md bg-green-600 text-white"
                    disabled={!newBonus.title || newBonus.rewardAmount <= 0}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
