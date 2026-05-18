import React, { useMemo } from 'react';
import type { SuccessionPlan, Translations } from '../types';
import { Card } from './common/Card';
import { ChartPieIcon } from './icons/ChartPieIcon';
import { ProgressBar } from './common/ProgressBar';

interface CompletionTimelineCardProps {
  plan: SuccessionPlan;
  t: Translations;
}

const CompletionTimelineCard: React.FC<CompletionTimelineCardProps> = ({ plan, t }) => {
  const { completedCount, totalCount, progress } = useMemo(() => {
    const total = plan.journey.length;
    const completed = plan.journey.filter(m => m.status === 'Completed').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completedCount: completed, totalCount: total, progress };
  }, [plan.journey]);

  return (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <ChartPieIcon className="w-6 h-6 text-primary-400" />
        <h4 className="text-lg font-semibold text-white">{t.completionTimeline}</h4>
      </div>
      <div>
        <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm font-medium text-gray-300">
                {completedCount} / {totalCount} {t.tasks}
            </span>
            <span className="text-2xl font-bold text-white">{progress}%</span>
        </div>
        <ProgressBar progress={progress} />
      </div>
    </Card>
  );
};

export default CompletionTimelineCard;
