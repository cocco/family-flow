import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { mockClient } from '../api/mockClient';
import type { UserDto } from '../api/types';
import HeaderActions from '../components/organisms/HeaderActions';
import FamilyOverviewCard from '../components/organisms/FamilyOverviewCard';
import FamilyTotalsCard from '../components/organisms/FamilyTotalsCard';
import CreateChoreModal from '../components/organisms/CreateChoreModal';
import CreateBonusModal from '../components/organisms/CreateBonusModal';
import Card from '../components/molecules/Card';

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
  // moved to modal organisms

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
            <HeaderActions
              onOpenChore={() => setIsChoreModalOpen(true)}
              onOpenBonus={() => setIsBonusModalOpen(true)}
              onLogout={logout}
            />
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
            <FamilyOverviewCard childrenList={children} summaries={summaries} />
            <FamilyTotalsCard summaries={summaries} />
          </div>

          {/* Monthly Summaries */}
          <Card className="mt-8" role="region" aria-labelledby="monthly-summaries-title">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 id="monthly-summaries-title" className="text-xl font-semibold text-gray-900">💰 Monthly Allowance Summaries</h2>
              <p className="text-sm text-gray-700">For {now.toLocaleString(undefined, { month: 'long' })} {currentYear}</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {children.map((child) => {
                const s = summaries.find((x) => x.childId === child.id);
                return (
                  <Card key={child.id} className="p-4">
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
                  </Card>
                );
              })}
            </div>
          </Card>

          <CreateChoreModal
            isOpen={isChoreModalOpen}
            onClose={() => setIsChoreModalOpen(false)}
            triggerRef={choreTriggerRef}
            dialogRef={choreDialogRef}
            currentUser={currentUser ?? null}
            currentMonth={currentMonth}
            currentYear={currentYear}
            onError={(msg) => setError(msg)}
          />

          <CreateBonusModal
            isOpen={isBonusModalOpen}
            onClose={() => setIsBonusModalOpen(false)}
            triggerRef={bonusTriggerRef}
            dialogRef={bonusDialogRef}
          />
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
