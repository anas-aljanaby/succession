import React, { useMemo } from 'react';
import type { DevelopmentRecommendation, Translations, UserRole, SuccessionJourneyStage, Language } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { improvementAreas } from '../constants';

interface DevelopmentPlanViewProps {
  recommendations: DevelopmentRecommendation[];
  stages: SuccessionJourneyStage[];
  activeRole: UserRole | null;
  t: Translations;
  language: Language;
}

const priorityDisplay: { [key in DevelopmentRecommendation['priority']]: { icon: string; color: string } } = {
  High: { icon: '🔥', color: 'text-red-400' },
  Medium: { icon: '⚙️', color: 'text-yellow-400' },
  Low: { icon: '🌿', color: 'text-green-400' },
};

const DevelopmentPlanView: React.FC<DevelopmentPlanViewProps> = ({ recommendations, stages, activeRole, t, language }) => {

  const { groupedRecommendations, coreDevelopmentAxes } = useMemo(() => {
    const stageMap = new Map(stages.map(s => [s.code, s.name]));
    const improvementAreaCounts = new Map<string, number>();

    const grouped = recommendations.reduce((acc, rec) => {
        const stageName = stageMap.get(rec.stageCode) || rec.stageCode;
        if (!acc[stageName]) {
            acc[stageName] = [];
        }
        acc[stageName].push(rec);
        improvementAreaCounts.set(rec.improvementArea, (improvementAreaCounts.get(rec.improvementArea) || 0) + 1);
        return acc;
    }, {} as Record<string, DevelopmentRecommendation[]>);

    const coreAxes = new Set<string>();
    for (const [area, count] of improvementAreaCounts.entries()) {
        if (count >= 2) {
            coreAxes.add(area);
        }
    }

    return { groupedRecommendations: grouped, coreDevelopmentAxes };
  }, [recommendations, stages]);
  
  const languageKey = useMemo(() => language === 'ar' ? 'name_ar' : 'name_en', [language]);
  const improvementAreaNameMap = useMemo(() => new Map(improvementAreas.map(area => [area.key, area[languageKey]])), [languageKey]);
  
  if (recommendations.length === 0) {
    return null;
  }

  const handleExport = () => {
    alert(`${t.exportDevelopmentPdf} functionality is a future feature.`);
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">{t.initialImprovementPlan}</h3>
        {activeRole === 'HR_User' && (
          <Button onClick={handleExport} variant="secondary" size="sm">
            <ArrowDownTrayIcon />
            {t.exportDevelopmentPdf}
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(groupedRecommendations).map(([stageName, recs]) => (
          <div key={stageName}>
            <h4 className="font-semibold text-primary-300 mb-2">{stageName}</h4>
            <div className="space-y-3">
              {/* Fix: Cast 'recs' to the correct type as it was being inferred as 'unknown'. */}
              {(recs as DevelopmentRecommendation[]).map(rec => {
                const isCore = coreDevelopmentAxes.has(rec.improvementArea);
                const display = priorityDisplay[rec.priority];
                return (
                  <div key={rec.id} className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`font-semibold ${display.color}`}>
                          <span className="text-lg mr-2">{display.icon}</span>
                          {improvementAreaNameMap.get(rec.improvementArea) || rec.improvementArea}
                        </p>
                        <p className="text-sm text-gray-300 mt-1 pl-8">{rec.recommendationText}</p>
                      </div>
                      {isCore && (
                        <span className="text-xs font-bold bg-red-800/50 text-red-300 px-2 py-1 rounded-full whitespace-nowrap">
                          {t.coreDevelopmentAxis}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default DevelopmentPlanView;