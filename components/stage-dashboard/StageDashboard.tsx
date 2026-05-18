import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { Spinner } from '../common/Spinner';
import type { Translations, Organization, SuccessionPlan, Candidate, StageDashboardData } from '../../types';
import { mockStageDashboardData } from '../../data/mockStageDashboard';

import { StageCandidatesTable } from './StageCandidatesTable';
import { StageKpiHeader } from './StageKpiHeader';
import { StageActivityFeed } from './StageActivityFeed';

interface StageDashboardProps {
  stageCode: string;
  organization: Organization;
  plans: SuccessionPlan[];
  candidates: Candidate[];
  t: Translations;
  onBack: () => void;
  onNavigateToCandidate: (planId: number) => void;
}

export const StageDashboard: React.FC<StageDashboardProps> = (props) => {
  const { stageCode, organization, plans, candidates, t, onBack, onNavigateToCandidate } = props;

  const [stageData, setStageData] = useState<StageDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const stageName = useMemo(() => {
    return organization.stages.find(s => s.code === stageCode)?.name || stageCode;
  }, [stageCode, organization.stages]);

  useEffect(() => {
    setLoading(true);
    // Simulate fetching data for the specific stage
    setTimeout(() => {
        // In a real app, you would filter plans and candidates based on the stageCode
        // For this mock, we use pre-filtered data
        const data = { ...mockStageDashboardData, stageName };
        setStageData(data);
        setLoading(false);
    }, 800);
  }, [stageCode, stageName]);

  if (loading) {
    return <div className="flex justify-center items-center h-[60vh]"><Spinner /><span className="ms-4 text-gray-400">جاري تحميل بيانات المرحلة...</span></div>;
  }

  if (!stageData) {
    return <div className="p-6 text-center text-gray-400"><span>لا توجد بيانات لهذه المرحلة.</span></div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <Button onClick={onBack} variant="secondary"><ArrowLeftIcon />{t.backToTimeline}</Button>
      </div>

      <StageKpiHeader {...stageData} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">المرشحون في هذه المرحلة</h3>
            <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={() => alert('Export feature coming soon.')}>تصدير</Button>
            </div>
            </div>
            <StageCandidatesTable
                rows={stageData.candidates}
                onSelectCandidate={onNavigateToCandidate}
                t={t}
            />
        </Card>

        <StageActivityFeed
            stageCode={stageCode}
        />
      </div>
    </div>
  );
};

export default StageDashboard;
