import React from 'react';
import type { ChildAllowanceSummaryDto } from '../../api/types';

export interface EarningsSummaryProps {
  summary: ChildAllowanceSummaryDto | null;
}

export const EarningsSummary: React.FC<EarningsSummaryProps> = ({ summary }) => {
  if (!summary) return null;
  return (
    <div className="mb-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">💰 Monthly Earnings</h2>
          <p className="text-yellow-100">
            Base allowance: ${summary.baseAllowance.toFixed(2)}
            {summary.bonusTotal > 0 && (
              <span> + ${summary.bonusTotal.toFixed(2)} bonus</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-white">
            ${summary.total.toFixed(2)}
          </div>
          <p className="text-yellow-100 text-sm">Total this month</p>
        </div>
      </div>
    </div>
  );
};

export default EarningsSummary;


