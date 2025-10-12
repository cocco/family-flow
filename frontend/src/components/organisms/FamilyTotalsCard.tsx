import React from 'react';
import type { ChildAllowanceSummaryDto } from '../../api/types';
import { Card } from '../molecules/Card';

export interface FamilyTotalsCardProps {
  summaries: Array<Pick<ChildAllowanceSummaryDto, 'baseAllowance' | 'bonusTotal' | 'total'>>;
}

export const FamilyTotalsCard: React.FC<FamilyTotalsCardProps> = ({ summaries }) => {
  return (
    <Card role="region" aria-labelledby="family-totals-title">
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
    </Card>
  );
};

export default FamilyTotalsCard;


