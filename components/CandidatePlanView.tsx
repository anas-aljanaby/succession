

import React, { useState, useEffect, useMemo } from 'react';
import type { SuccessionPlan, Organization, Translations, ReflectionLog } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { RadialProgress } from './common/RadialProgress';
import { ProgressBar } from './common/ProgressBar';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { SentimentPositiveIcon } from './icons/SentimentPositiveIcon';
import { SentimentNeutralIcon } from './icons/SentimentNeutralIcon';
import { SentimentNegativeIcon } from './icons/SentimentNegativeIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface CandidatePlanViewProps {
    plan: SuccessionPlan | null;
    organization: Organization;
    t: Translations;
    onBack: () => void;
    reflectionLogs: ReflectionLog[];
}

const ShimmerCard: React.FC = () => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
        <div className="h-5 bg-gray-700 rounded w-1/3 mb-4 shimmer"></div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-full shimmer"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 shimmer"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 shimmer"></div>
        </div>
    </div>
);

const CandidatePlanView: React.FC<CandidatePlanViewProps> = ({ plan, organization, t, onBack, reflectionLogs }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 800); // Simulate data fetch
        return () => clearTimeout(timer);
    }, [plan?.id]);

    const { overallProgress, currentStage, upcomingTasks } = useMemo(() => {
        if (!plan) return { overallProgress: 0, currentStage: null, upcomingTasks: [] };
        
        const completedCount = plan.journey.filter(m => m.status === 'Completed').length;
        const totalCount = plan.journey.length;
        const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        const currentStage = organization.stages.find(s => plan.journey.some(m => m.stageCode === s.code && m.status !== 'Completed')) || organization.stages[organization.stages.length - 1];

        const tasks = plan.journey.filter(m => m.status !== 'Completed');

        return { overallProgress: progress, currentStage, upcomingTasks: tasks };
    }, [plan, organization.stages]);
    
    const recentLogs = useMemo(() => {
        if (!plan) return [];
        // A simple way to link logs to a candidate is to find logs by users who are candidates and match the ID.
        // A more robust system would link logs directly to a plan ID.
        return reflectionLogs
            .filter(log => log.note) // Ensure there's a note
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 4);
    }, [reflectionLogs, plan]);
    
    if (!plan) {
         return (
            <div className="text-center py-20">
                <p className="text-gray-400">{t.planDataNotAvailable}</p>
                <Button onClick={onBack} className="mt-4">{t.backToDashboard}</Button>
            </div>
        );
    }
    
    if (isLoading) {
        return (
             <div className="max-w-7xl mx-auto space-y-8">
                 <div className="h-8 w-48 shimmer rounded-md"></div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <ShimmerCard />
                     <ShimmerCard />
                     <ShimmerCard />
                     <ShimmerCard />
                 </div>
             </div>
        );
    }
    
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            <Button onClick={onBack} variant="secondary">
                <ArrowLeftIcon />
                {t.backToDashboard}
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Candidate Overview */}
                <Card className="lg:col-span-2">
                    <h3 className="text-xl font-semibold text-white mb-4">{t.candidateOverview}</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                         <RadialProgress value={plan.readiness} label={t.lriScore} color="stroke-primary-400" size={160} />
                         <div className="text-center sm:text-start">
                             <h4 className="text-2xl font-bold text-white">{plan.candidate.name}</h4>
                             <p className="text-gray-400">{plan.candidate.currentRole}</p>
                             <p className="text-sm text-gray-500 mt-2">{t.role}: <span className="font-semibold text-gray-300">{plan.roleTitle}</span></p>
                         </div>
                    </div>
                </Card>

                {/* AI Recommendations */}
                <Card className="lg:col-span-2">
                    <h3 className="text-xl font-semibold text-white mb-4">{t.aiRecommendations}</h3>
                    {(plan.developmentRecommendations && plan.developmentRecommendations.length > 0) ? (
                        <ul className="space-y-3 max-h-48 overflow-y-auto">
                            {plan.developmentRecommendations.map(rec => (
                                <li key={rec.id} className="flex items-start gap-3">
                                    <LightBulbIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-gray-300">{rec.recommendationText}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-10">{t.noRecommendations}</p>
                    )}
                </Card>

                {/* Development Actions */}
                <Card className="lg:col-span-2">
                    <h3 className="text-xl font-semibold text-white mb-4">{t.developmentActions}</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-300">{t.overallProgress}</span>
                                <span className="text-sm font-medium text-gray-300">{overallProgress}%</span>
                            </div>
                            <ProgressBar progress={overallProgress} />
                            <p className="text-xs text-gray-500 mt-1">{t.currentStage}: <span className="font-medium text-gray-400">{currentStage?.name}</span></p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-300 mb-2">{t.upcomingTasks}</h4>
                            {(upcomingTasks && upcomingTasks.length > 0) ? (
                                <ul className="space-y-2 max-h-40 overflow-y-auto">
                                    {upcomingTasks.map(task => (
                                        <li key={task.id} className="flex items-center gap-3 p-2 bg-gray-900/50 rounded-md">
                                            <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                                            <span className="text-sm text-gray-300">{task.title}</span>
                                        </li>
                                    ))}
                                </ul>
                             ) : (
                                <p className="text-sm text-gray-500 flex items-center gap-2"><CheckCircleIcon className="h-5 w-5" />{t.noUpcomingTasks}</p>
                             )}
                        </div>
                    </div>
                </Card>

                {/* Coaching Notes */}
                <Card className="lg:col-span-2">
                    <h3 className="text-xl font-semibold text-white mb-4">{t.coachingNotes}</h3>
                    {(recentLogs.length > 0) ? (
                         <ul className="space-y-3 max-h-56 overflow-y-auto">
                            {recentLogs.map(log => (
                                <li key={log.id} className="flex items-start gap-3 p-2 bg-gray-900/50 rounded-md">
                                     <div className="flex-shrink-0 mt-0.5">
                                        {log.sentiment === 'positive' && <SentimentPositiveIcon />}
                                        {log.sentiment === 'neutral' && <SentimentNeutralIcon />}
                                        {log.sentiment === 'negative' && <SentimentNegativeIcon />}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300">{log.note}</p>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-10">{t.noCoachingNotes}</p>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default CandidatePlanView;