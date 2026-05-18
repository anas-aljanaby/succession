
import React, { useMemo } from 'react';
import type { OrlsAssessment, Translations } from '../types';
import { Card } from './common/Card';

interface OrlsAssessmentViewProps {
  assessment: OrlsAssessment;
  t: Translations;
}

const DimensionProgress: React.FC<{label: string, value: number}> = ({label, value}) => (
    <div>
        <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-400">{label}</span>
            <span className="text-sm font-medium text-gray-400">{value}%</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
            <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${value}%` }}></div>
        </div>
    </div>
)

export const OrlsAssessmentView: React.FC<OrlsAssessmentViewProps> = ({ assessment, t }) => {
  const averageScore = useMemo(() => {
    if (!assessment) return 0;
    // Fix: Cast the result of Object.values to number[] to ensure correct type inference for reduce.
    const scores = Object.values(assessment) as number[];
    const total = scores.reduce((sum, score) => sum + score, 0);
    return scores.length > 0 ? Math.round(total / scores.length) : 0;
  }, [assessment]);

  const dimensions = [
      { key: 'governance', value: assessment.governance},
      { key: 'culture', value: assessment.culture},
      { key: 'systems', value: assessment.systems},
      { key: 'resources', value: assessment.resources},
      { key: 'strategic_support', value: assessment.strategic_support},
  ]

  return (
    <div>
        <h3 className="text-xl font-semibold text-white mb-4">{t.orlsTitle}</h3>
        <Card>
        <div className="text-center mb-6">
            <p className="text-5xl font-bold text-white">{averageScore}%</p>
            <p className="text-lg text-gray-400">{t.orlsScore}</p>
        </div>
        <div className="space-y-4">
            {dimensions.map(dim => (
                <DimensionProgress key={dim.key} label={t[dim.key]} value={dim.value} />
            ))}
        </div>
        </Card>
    </div>
  );
};
