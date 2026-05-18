import React from 'react';
import type { Translations } from '../types';
import { Card } from './common/Card';
import { InformationCircleIcon } from './icons/InformationCircleIcon';

interface StageSummaryCardProps {
  stageCode: string;
  t: Translations;
}

const StageSummaryCard: React.FC<StageSummaryCardProps> = ({ stageCode, t }) => {
  const summaryText = t[`stage_summary_${stageCode}`] || '';

  return (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <InformationCircleIcon className="w-6 h-6 text-primary-400" />
        <h4 className="text-lg font-semibold text-white">{t.executiveSummary}</h4>
      </div>
      <p className="text-sm text-gray-300">{summaryText}</p>
    </Card>
  );
};

export default StageSummaryCard;
