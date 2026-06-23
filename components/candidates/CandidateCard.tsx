import React from 'react';
import type { Candidate, Translations } from '../../types';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';

interface CandidateCardProps {
  candidate: Candidate;
  t: Translations;
  onViewPlan: () => void;
  onCreatePlan: () => void;
  onMonitorJourney: () => void;
}

const statusBg: Record<Candidate['status'], { bg: string, text_color: string }> = {
    active: { bg: 'bg-green-500/10', text_color: 'text-green-400' },
    paused: { bg: 'bg-yellow-500/10', text_color: 'text-yellow-400' },
    completed: { bg: 'bg-blue-500/10', text_color: 'text-blue-400' },
    archived: { bg: 'bg-gray-500/10', text_color: 'text-gray-400' },
};

const getStatusText = (statusKey: Candidate['status'], t: Translations): string => {
    const map: Record<Candidate['status'], string> = { active: t.active, paused: t.paused, completed: t.completed, archived: t.archived };
    return map[statusKey];
};

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, t, onViewPlan, onCreatePlan, onMonitorJourney }) => {
    const style = statusBg[candidate.status];
    const hasPlan = Boolean(candidate.planId);

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col items-center text-center hover:bg-gray-700/50 hover:border-primary-500/50 transition-all">
            <img
                src={candidate.profileImage || `https://ui-avatars.com/api/?name=${candidate.name}&background=374151&color=fff`}
                alt={candidate.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-600"
            />
            <h3 className="mt-4 font-bold text-lg text-white">{candidate.name}</h3>
            <p className="text-sm text-primary-300 h-10">{candidate.targetPosition}</p>

            <div className="w-full mt-4 space-y-3">
                {hasPlan ? (
                    <div className="text-left">
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                            <span>{t.progress}</span>
                            <span className="font-semibold text-white">{candidate.journeyProgress}%</span>
                        </div>
                        <ProgressBar progress={candidate.journeyProgress} />
                    </div>
                ) : (
                    <p className="text-xs text-gray-500 italic">{t.noPlanYet}</p>
                )}
                <div className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${style.bg} ${style.text_color}`}>
                    {getStatusText(candidate.status, t)}
                </div>
            </div>

            <div className="w-full mt-4 pt-3 border-t border-gray-700 flex flex-col gap-2">
                {hasPlan ? (
                    <>
                        <Button variant="primary" size="sm" className="w-full" onClick={onMonitorJourney}>
                            {t.monitorJourney}
                        </Button>
                        <Button variant="secondary" size="sm" className="w-full" onClick={onViewPlan}>
                            {t.viewPlan}
                        </Button>
                    </>
                ) : (
                    <Button variant="primary" size="sm" className="w-full" onClick={onCreatePlan}>
                        {t.createPlanForCandidate}
                    </Button>
                )}
            </div>
        </div>
    );
};
