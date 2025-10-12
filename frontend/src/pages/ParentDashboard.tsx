import React, { useEffect, useRef, useState } from 'react';
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
  // Track trigger buttons to restore focus when closing dialogs
  const choreTriggerRef = useRef<HTMLButtonElement | null>(null);
  const bonusTriggerRef = useRef<HTMLButtonElement | null>(null);
  const choreDialogRef = useRef<HTMLDivElement | null>(null);
  const bonusDialogRef = useRef<HTMLDivElement | null>(null);
  const [newChore, setNewChore] = useState({ title: '', description: '' });
  const [newBonus, setNewBonus] = useState({ title: '', description: '', rewardAmount: 0 });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

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

  // Focus management for dialogs
  useEffect(() => {
    if (isChoreModalOpen) {
      // Focus the dialog container first, then the first input
      requestAnimationFrame(() => {
        choreDialogRef.current?.focus();
        const firstInput = choreDialogRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
        firstInput?.focus();
      });
    }
  }, [isChoreModalOpen]);

  useEffect(() => {
    if (isBonusModalOpen) {
      requestAnimationFrame(() => {
        bonusDialogRef.current?.focus();
        const firstInput = bonusDialogRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
        firstInput?.focus();
      });
    }
  }, [isBonusModalOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" aria-hidden="true"></div>
          <p className="mt-4 text-gray-700">Loading family dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-blue-700 focus:p-2 focus:rounded focus:shadow">Skip to main content</a>
      <header className="bg-white shadow" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {currentUser?.displayName}!
              </h1>
              <p className="text-gray-800">Parent Dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                ref={choreTriggerRef}
                onClick={() => setIsChoreModalOpen(true)}
                aria-haspopup="dialog"
                aria-controls="create-chore-dialog"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
              >
                Create Chore
              </button>
              <button
                type="button"
                ref={bonusTriggerRef}
                onClick={() => setIsBonusModalOpen(true)}
                aria-haspopup="dialog"
                aria-controls="create-bonus-dialog"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
              >
                Create Bonus Task
              </button>
              <button
                type="button"
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" role="main" aria-labelledby="page-title">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4" role="alert" aria-live="assertive">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400" aria-hidden="true">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Family Overview */}
            <section className="bg-white overflow-hidden shadow rounded-lg border border-gray-200" role="region" aria-labelledby="family-overview-title">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-0 flex-1">
                    <div>
                      <div id="family-overview-title" className="text-sm font-medium text-gray-800">Family Overview</div>
                      <div className="mt-1 text-lg font-semibold text-gray-900">
                        {children.length} {children.length === 1 ? 'child' : 'children'}
                      </div>
                      <ul className="mt-4 space-y-2">
                        {children.map((child) => {
                          const summary = summaries.find((s) => s.childId === child.id);
                          return (
                            <li key={child.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{child.displayName}</div>
                                <div className="text-xs text-gray-700">Base ${child.monthlyAllowance.toFixed(2)}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-800">Bonus {(summary?.bonusTotal ?? 0).toFixed(2)}</div>
                                <div className="text-base font-semibold text-gray-900">Total {(summary?.total ?? child.monthlyAllowance).toFixed(2)}</div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Family Totals */}
            <section className="bg-white overflow-hidden shadow rounded-lg border border-gray-200" role="region" aria-labelledby="family-totals-title">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-0 flex-1">
                    <div>
                      <div id="family-totals-title" className="text-sm font-medium text-gray-800">Family Totals (This Month)</div>
                      <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xs text-gray-700">Base</div>
                          <div className="text-lg font-semibold text-gray-900">
                            ${summaries.reduce((sum, s) => sum + s.baseAllowance, 0).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-700">Bonus</div>
                          <div className="text-lg font-semibold text-gray-900">
                            ${summaries.reduce((sum, s) => sum + s.bonusTotal, 0).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-700">Total</div>
                          <div className="text-lg font-semibold text-gray-900">
                            ${summaries.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            
          </div>

          {/* Monthly Summaries */}
          <section className="mt-8 bg-white shadow rounded-lg" role="region" aria-labelledby="monthly-summaries-title">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 id="monthly-summaries-title" className="text-xl font-semibold text-gray-900">💰 Monthly Allowance Summaries</h2>
              <p className="text-sm text-gray-700">For {now.toLocaleString(undefined, { month: 'long' })} {currentYear}</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {children.map((child) => {
                const s = summaries.find((x) => x.childId === child.id);
                return (
                  <div key={child.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{child.displayName}</div>
                        <div className="text-sm text-gray-800">Base ${child.monthlyAllowance.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-800">Bonus {(s?.bonusTotal ?? 0).toFixed(2)}</div>
                        <div className="text-lg font-semibold text-gray-900">Total {(s?.total ?? child.monthlyAllowance).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Chore Modal */}
          {isChoreModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" aria-labelledby="create-chore-title" role="dialog" aria-modal="true">
              <div
                id="create-chore-dialog"
                ref={choreDialogRef}
                tabIndex={-1}
                className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsChoreModalOpen(false);
                    choreTriggerRef.current?.focus();
                  }
                }}
              >
                <h3 id="create-chore-title" className="text-lg font-semibold text-gray-900">Create Chore</h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <label htmlFor="chore-title" className="block text-sm text-gray-800">Title</label>
                    <input
                      id="chore-title"
                      className="mt-1 w-full border rounded-md px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
                      value={newChore.title}
                      onChange={(e) => setNewChore({ ...newChore, title: e.target.value })}
                      placeholder="e.g., Take out trash"
                    />
                  </div>
                  <div>
                    <label htmlFor="chore-description" className="block text-sm text-gray-800">Description (optional)</label>
                    <textarea
                      id="chore-description"
                      className="mt-1 w-full border rounded-md px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
                      value={newChore.description}
                      onChange={(e) => setNewChore({ ...newChore, description: e.target.value })}
                      placeholder="Add details"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChoreModalOpen(false);
                      choreTriggerRef.current?.focus();
                    }}
                    className="px-4 py-2 text-sm rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
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
                      choreTriggerRef.current?.focus();
                    }}
                    aria-disabled={!newChore.title}
                    className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" aria-labelledby="create-bonus-title" role="dialog" aria-modal="true">
              <div
                id="create-bonus-dialog"
                ref={bonusDialogRef}
                tabIndex={-1}
                className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsBonusModalOpen(false);
                    bonusTriggerRef.current?.focus();
                  }
                }}
              >
                <h3 id="create-bonus-title" className="text-lg font-semibold text-gray-900">Create Bonus Task</h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <label htmlFor="bonus-title" className="block text-sm text-gray-800">Title</label>
                    <input
                      id="bonus-title"
                      className="mt-1 w-full border rounded-md px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
                      value={newBonus.title}
                      onChange={(e) => setNewBonus({ ...newBonus, title: e.target.value })}
                      placeholder="e.g., Wash the car"
                    />
                  </div>
                  <div>
                    <label htmlFor="bonus-description" className="block text-sm text-gray-800">Description (optional)</label>
                    <textarea
                      id="bonus-description"
                      className="mt-1 w-full border rounded-md px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
                      value={newBonus.description}
                      onChange={(e) => setNewBonus({ ...newBonus, description: e.target.value })}
                      placeholder="Add details"
                    />
                  </div>
                  <div>
                    <label htmlFor="bonus-reward" className="block text-sm text-gray-800">Reward Amount ($)</label>
                    <input
                      id="bonus-reward"
                      type="number"
                      min={0}
                      step={0.5}
                      className="mt-1 w-full border rounded-md px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
                      value={newBonus.rewardAmount}
                      onChange={(e) => setNewBonus({ ...newBonus, rewardAmount: Number(e.target.value) })}
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBonusModalOpen(false);
                      bonusTriggerRef.current?.focus();
                    }}
                    className="px-4 py-2 text-sm rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // UI-only: no persistence in Phase 2
                      setIsBonusModalOpen(false);
                      setNewBonus({ title: '', description: '', rewardAmount: 0 });
                      bonusTriggerRef.current?.focus();
                    }}
                    aria-disabled={!newBonus.title || newBonus.rewardAmount <= 0}
                    className="px-4 py-2 text-sm rounded-md bg-green-600 text-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
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
