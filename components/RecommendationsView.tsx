import React from 'react';
import type { Translations } from '../types';
import { Card } from './common/Card';
import { AcademicCapIcon } from './icons/AcademicCapIcon';

interface RecommendationsViewProps {
  recommendations: string[];
  t: Translations;
}

const RecommendationsView: React.FC<RecommendationsViewProps> = ({ recommendations, t }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">{t.recommendationTitle}</h3>
      <Card className="min-h-[220px]">
        {recommendations.length > 0 ? (
          <ul className="space-y-3">
            {recommendations.map((reco, index) => (
              <li key={index} className="flex items-start gap-3 p-2 bg-gray-900/50 rounded-md">
                <div className="flex-shrink-0 mt-1">
                  <AcademicCapIcon />
                </div>
                <p className="text-sm text-gray-300">{reco}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <AcademicCapIcon className="w-8 h-8 mb-2" />
            <p>{t.noData}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RecommendationsView;