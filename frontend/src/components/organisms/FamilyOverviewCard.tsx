import React from 'react';
import type { UserDto, ChildAllowanceSummaryDto } from '../../api/types';
import { Card } from '../molecules/Card';

export interface FamilyOverviewCardProps {
  childrenList: UserDto[];
  summaries: Array<Pick<ChildAllowanceSummaryDto, 'childId' | 'baseAllowance' | 'bonusTotal' | 'total'>>;
}

export const FamilyOverviewCard: React.FC<FamilyOverviewCardProps> = ({ childrenList, summaries }) => {
  return (
    <Card role="region" aria-labelledby="family-overview-title">
      <div className="p-5">
        <div className="flex items-center">
          <div className="w-0 flex-1">
            <div>
              <div id="family-overview-title" className="text-sm font-medium text-gray-800">Family Overview</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {childrenList.length} {childrenList.length === 1 ? 'child' : 'children'}
              </div>
              <ul className="mt-4 space-y-2">
                {childrenList.map((child) => {
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
    </Card>
  );
};

export default FamilyOverviewCard;


