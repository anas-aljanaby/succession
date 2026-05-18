import React from 'react';
import type { Translations } from '../types';
import { Card } from './common/Card';
import { LightBulbIcon } from './icons/LightBulbIcon';

interface InsightHistoryViewProps {
  insights: string[];
  t: Translations;
}

const InsightHistoryView: React.FC<InsightHistoryViewProps> = ({ insights, t }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">{t.insightHistoryTitle}</h3>
      <Card className="min-h-[220px]">
        {insights.length > 0 ? (
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-3 p-2 bg-gray-900/50 rounded-md">
                <div className="flex-shrink-0 mt-1">
                  <LightBulbIcon />
                </div>
                <p className="text-sm text-gray-300">{insight}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <LightBulbIcon className="w-8 h-8 mb-2" />
            <p>{t.noInsights}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InsightHistoryView;