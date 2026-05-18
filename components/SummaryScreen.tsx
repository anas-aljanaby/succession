import React from 'react';
import type { SuccessionPlan, Organization, Translations } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';

interface SummaryScreenProps {
  plan: SuccessionPlan;
  organization: Organization;
  t: Translations;
  onBackToDashboard: () => void;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ plan, organization, t, onBackToDashboard }) => {
  const journeyInsights = (organization.insight_history || []).filter(insight => 
    insight.includes(plan.candidate.name)
  );

  const handleExport = () => {
    alert('Export functionality is a future feature.');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in-up">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white">{t.journeyCompletedMessage}</h2>
        <p className="text-xl text-primary-400 mt-2">{plan.candidate.name} - {plan.roleTitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-xl font-semibold text-white mb-4">{t.timelineSummary}</h3>
          <ul className="space-y-3">
            {organization.stages.map(stage => {
              if (plan.journey.some(m => m.stageCode === stage.code)) {
                return (
                  <li key={stage.code} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-md">
                    <CheckCircleIcon />
                    <span className="font-medium text-gray-200">{stage.name}</span>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-white mb-4">{t.keyInsights}</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {journeyInsights.length > 0 ? (
              journeyInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-2 bg-gray-900/50 rounded-md">
                   <div className="flex-shrink-0 mt-1">
                      <LightBulbIcon />
                    </div>
                  <p className="text-sm text-gray-300">{insight}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-8">
                <LightBulbIcon className="w-8 h-8 mb-2" />
                <p>{t.noJourneyInsights}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Button onClick={handleExport} variant="secondary">
            <ArrowDownTrayIcon />
            {t.exportSummary}
        </Button>
        <Button onClick={onBackToDashboard}>{t.backToDashboard}</Button>
      </div>
    </div>
  );
};

export default SummaryScreen;
