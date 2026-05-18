import React, { useState } from 'react';
import type { SuccessionPlan, Translations } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Modal } from './common/Modal';
import { StatusBadge } from './common/StatusBadge';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { Spinner } from './common/Spinner';

interface StageClosureDashboardProps {
  plansForReview: SuccessionPlan[];
  t: Translations;
  onApproveClosure: (planId: number) => void;
  onReturnClosure: (planId: number) => void;
  processingPlanIds: Set<number>;
}

const StageClosureDashboard: React.FC<StageClosureDashboardProps> = ({ plansForReview, t, onApproveClosure, onReturnClosure, processingPlanIds }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGapAnalysis, setSelectedGapAnalysis] = useState<string | null>(null);
  
  const findGapAnalysis = (plan: SuccessionPlan) => {
    if (!plan.stageClosureData) return t.none;
    const stageData = Object.values(plan.stageClosureData).find(d => d.institutionalConfirmation?.gapAnalysis);
    return stageData?.institutionalConfirmation?.gapAnalysis || t.none;
  };
  
  const viewGapAnalysis = (plan: SuccessionPlan) => {
      setSelectedGapAnalysis(findGapAnalysis(plan));
      setIsModalOpen(true);
  };

  return (
    <Card>
      <h3 className="text-xl font-semibold text-white mb-4">{t.stageClosureDashboardTitle}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left rtl:text-right">
          <thead className="border-b border-gray-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-400">{t.candidate}</th>
              <th className="p-4 text-sm font-semibold text-gray-400">{t.closureStatus}</th>
              <th className="p-4 text-sm font-semibold text-gray-400">{t.readinessIndex}</th>
              <th className="p-4 text-sm font-semibold text-gray-400">{t.maturityIndex}</th>
              <th className="p-4 text-sm font-semibold text-gray-400">{t.gapAnalysis}</th>
              <th className="p-4 text-sm font-semibold text-gray-400">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {plansForReview.map(plan => {
              const isProcessing = processingPlanIds.has(plan.id);
              return (
                <tr key={plan.id} className={`border-b border-gray-700 last:border-b-0 transition-opacity ${isProcessing ? 'opacity-50' : ''}`}>
                  <td className="p-4 whitespace-nowrap text-white font-medium">{plan.candidate.name}</td>
                  <td className="p-4 whitespace-nowrap"><StatusBadge status={plan.closureStatus} t={t} /></td>
                  <td className="p-4 whitespace-nowrap text-gray-300">{plan.readiness}%</td>
                  <td className="p-4 whitespace-nowrap text-gray-300">{plan.maturity}%</td>
                  <td className="p-4 whitespace-nowrap">
                    <Button variant="secondary" size="sm" onClick={() => viewGapAnalysis(plan)} disabled={isProcessing}>
                      {t.view}
                    </Button>
                  </td>
                  <td className="p-4 whitespace-nowrap flex gap-2">
                    <Button onClick={() => onApproveClosure(plan.id)} size="sm" className="bg-green-600 hover:bg-green-500" disabled={isProcessing}>
                      {isProcessing ? <Spinner/> : <CheckBadgeIcon />}
                      {t.approveCandidateClosure}
                    </Button>
                    <Button onClick={() => onReturnClosure(plan.id)} variant="secondary" size="sm" className="bg-yellow-600 hover:bg-yellow-500 text-white" disabled={isProcessing}>
                      {isProcessing ? <Spinner/> : <ArrowUturnLeftIcon />}
                      {t.returnCandidateForFix}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t.gapAnalysis}>
          <p className="text-gray-300 whitespace-pre-wrap">{selectedGapAnalysis}</p>
          <div className="flex justify-end mt-6">
            <Button onClick={() => setIsModalOpen(false)}>{t.close}</Button>
          </div>
        </Modal>
      )}
    </Card>
  );
};

export default StageClosureDashboard;