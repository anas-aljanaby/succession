
import React, { useMemo } from 'react';
import type { SuccessionPlan, Organization, Translations, UserRole } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { calculateStageDuration } from '../services/durationEstimator';

const ProgressRing: React.FC<{ progress: number; status: 'completed' | 'inProgress' | 'notStarted' }> = ({ progress, status }) => {
    const size = 80;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    const colorClasses = {
        completed: 'text-green-500',
        inProgress: 'text-primary-500',
        notStarted: 'text-gray-500',
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} className="stroke-current text-gray-700" fill="transparent" />
                <circle cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} className={`stroke-current ${colorClasses[status]}`} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {status === 'completed' ? <CheckCircleIcon className="h-10 w-10 text-green-500" /> : ''}
            </div>
        </div>
    );
};


interface JourneyTimelinePreviewProps {
  plan: SuccessionPlan;
  organization: Organization;
  t: Translations;
  onBack: () => void;
  onStageSelect: (stageCode: string) => void;
  activeRole: UserRole | null;
}

const JourneyTimelinePreview: React.FC<JourneyTimelinePreviewProps> = ({ plan, organization, t, onBack, onStageSelect, activeRole }) => {
    const orlsAverageScore = useMemo(() => {
        if (!organization.orlsAssessment) return 0;
        const scores = Object.values(organization.orlsAssessment) as number[];
        const total = scores.reduce((sum, score) => sum + score, 0);
        return scores.length > 0 ? Math.round(total / scores.length) : 0;
    }, [organization.orlsAssessment]);

    const stageData = useMemo(() => {
        return organization.stages.map(stage => {
            const milestones = plan.journey.filter(m => m.stageCode === stage.code);
            
            const completedCount = milestones.filter(m => m.status === 'Completed').length;
            const percentage = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;
            
            let status: 'completed' | 'inProgress' | 'notStarted' = 'notStarted';
            if (percentage === 100 && milestones.length > 0) {
                status = 'completed';
            } else if (percentage > 0 || milestones.some(m => m.status === 'InProgress' || m.status === 'Delayed')) {
                status = 'inProgress';
            }
            
            const estimatedDuration = calculateStageDuration(stage, orlsAverageScore, plan.readiness);

            return {
                ...stage,
                status,
                percentage,
                estimatedDuration,
            };
        });
    }, [organization.stages, plan.journey, orlsAverageScore, plan.readiness]);

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">{t.journeyTimelinePreview}</h2>
                    <p className="text-lg text-primary-400">{plan.roleTitle} - {plan.candidate.name}</p>
                </div>
                <Button onClick={onBack} variant="secondary">
                    <ArrowLeftIcon />
                    {t.backToDashboard}
                </Button>
            </div>
            
            <Card>
                <h3 className="text-xl font-semibold text-white mb-4 text-center">{t.readinessSummary}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="text-center border-e-0 md:border-e md:border-gray-700 px-4">
                        <p className="text-sm font-medium text-gray-400">{t.orgReadiness}</p>
                        <p className="text-6xl font-bold text-teal-400 my-2">{orlsAverageScore}<span className="text-4xl">%</span></p>
                        <p className="text-xs text-gray-500 mt-1">نتيجة ORLS</p>
                    </div>
                    <div className="text-center px-4">
                        <p className="text-sm font-medium text-gray-400">{t.candidateReadiness}</p>
                        <p className="text-6xl font-bold text-primary-400 my-2">{plan.readiness}<span className="text-4xl">%</span></p>
                        <p className="text-xs text-gray-500 mt-1">مؤشر الجاهزية</p>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto p-4">
                    <div className="flex items-start">
                        {stageData.map((stage, index) => stage && (
                            <React.Fragment key={stage.code}>
                                <div 
                                    className={`flex flex-col items-center flex-shrink-0 px-4 py-2 cursor-pointer rounded-lg transition-all duration-300 w-60 hover:bg-gray-800/50`}
                                    onClick={() => onStageSelect(stage.code)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStageSelect(stage.code)}
                                    aria-label={`${t.viewDetailsFor} ${stage.name}`}
                                >
                                    <ProgressRing progress={stage.percentage} status={stage.status} />
                                    <h3 className="mt-4 font-semibold text-white text-center h-12 flex items-center">{stage.name}</h3>
                                    <div className="mt-2 space-y-1 text-xs text-center text-gray-400 w-full">
                                        <div className="flex justify-between"><span>{t.cri}:</span> <span className="font-medium text-red-400">{stage.cri}%</span></div>
                                        <div className="flex justify-between"><span>{t.aei}:</span> <span className="font-medium text-green-400">{stage.aei}%</span></div>
                                        <div className="flex items-center justify-center gap-1 pt-2 mt-2 border-t border-gray-700/50">
                                            <ClockIcon className="h-3 w-3 text-cyan-400" />
                                            <span>{t.estimatedDuration}:</span> <span className="font-medium text-cyan-400">{stage.estimatedDuration} {t.days}</span>
                                        </div>
                                    </div>
                                </div>
                                {index < stageData.filter(Boolean).length - 1 && (
                                    <div className="flex-grow h-px bg-gray-700 mt-10" style={{ minWidth: '4rem' }}></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default JourneyTimelinePreview;
