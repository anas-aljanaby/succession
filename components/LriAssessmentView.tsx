

import React, { useMemo } from 'react';
import type { LriAssessment, Translations } from '../types';
import { Card } from './common/Card';

interface LriAssessmentViewProps {
  assessment: LriAssessment;
  t: Translations;
}

const LriDimensionProgress: React.FC<{label: string, value: number}> = ({label, value}) => (
    <div>
        <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-400">{label}</span>
            <span className="text-sm font-medium text-gray-400">{value}%</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${value}%` }}></div>
        </div>
    </div>
)

export const LriAssessmentView: React.FC<LriAssessmentViewProps> = ({ assessment, t }) => {
  const averageScore = useMemo(() => {
    // Fix: Cast the result of Object.values to number[] to ensure correct type inference for reduce.
    const scores = Object.values(assessment) as number[];
    const total = scores.reduce((sum, score) => sum + score, 0);
    return scores.length > 0 ? Math.round(total / scores.length) : 0;
  }, [assessment]);

  const dimensions = [
      { key: 'competence', value: assessment.competence},
      { key: 'behavior', value: assessment.behavior},
      { key: 'value_alignment', value: assessment.value_alignment},
      { key: 'learning_agility', value: assessment.learning_agility},
  ]

  return (
    <div>
        <h3 className="text-xl font-semibold text-white mb-4">{t.lriTitle}</h3>
        <Card>
        <div className="text-center mb-6">
            <p className="text-5xl font-bold text-white">{averageScore}%</p>
            <p className="text-lg text-gray-400">{t.lriScore}</p>
        </div>
        <div className="space-y-4">
            {dimensions.map(dim => (
                <LriDimensionProgress key={dim.key} label={t[dim.key]} value={dim.value} />
            ))}
        </div>
        </Card>
    </div>
  );
};
