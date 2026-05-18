





import React, { useMemo, useState } from 'react';
import type { SuccessionPlan, Translations, Organization, User, ReflectionLog, Language, UserRole, FeedbackMessage, FeedbackThread, SuccessionJourneyStage, DevelopmentRecommendation } from '../types';
import { Card } from './common/Card';
import { ProgressBar } from './common/ProgressBar';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon';
import { PresentationChartBarIcon } from './icons/PresentationChartBarIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import ReflectionLogView from './ReflectionLogView';
import FeedbackDialogueModal from './FeedbackDialogueModal';
import FeedbackThreadView from './FeedbackThreadView';
import { calculateStageDuration } from '../services/durationEstimator';
import { Button } from './common/Button';
import { ChatBubbleLeftEllipsisIcon } from './icons/ChatBubbleLeftEllipsisIcon';
import { BarChartIcon } from './icons/BarChartIcon';

interface JourneyTimelineProps {
    plan: SuccessionPlan;
    organization: Organization;
    t: Translations;
    canEdit: boolean;
    onToggleMilestone: (id: number) => void;
    expandedStageCode: string | null;
    setExpandedStageCode: (code: string | null) => void;
    currentUser: User;
    activeRole: UserRole | null;
    allUsers: User[];
    reflectionLogs: ReflectionLog[];
    onAddReflectionLog: (log: Omit<ReflectionLog, 'id' | 'timestamp'>) => void;
    onFeedbackSubmit: (planId: number, stageCode: string, message: Omit<FeedbackMessage, 'id'>, recommendations: Omit<DevelopmentRecommendation, 'id'>[]) => void;
    language: Language;
    orlsScore: number;
    onStartSurvey: (stageCode: string, options?: { title?: string, description?: string }) => void;
}

const stageIcons: { [key: string]: React.ReactNode } = {
    STG1: <ClipboardListIcon />,
    STG2: <WrenchScrewdriverIcon />,
    STG3: <PresentationChartBarIcon />,
    STG4: <ArrowPathIcon />,
};

const JourneyTimeline: React.FC<JourneyTimelineProps> = (props) => {
    const { 
        plan, 
        organization, 
        t, 
        canEdit, 
        onToggleMilestone, 
        expandedStageCode, 
        setExpandedStageCode,
        currentUser,
        activeRole,
        allUsers,
        reflectionLogs,
        onAddReflectionLog,
        onFeedbackSubmit,
        language,
        orlsScore,
        onStartSurvey
    } = props;
    
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedStageForFeedback, setSelectedStageForFeedback] = useState<SuccessionJourneyStage | null>(null);


    const handleToggleExpand = (stageCode: string) => {
        // Fix: Use the `expandedStageCode` prop directly instead of a functional update, as the prop type doesn't support it.
        setExpandedStageCode(expandedStageCode === stageCode ? null : stageCode);
    };

    const handleOpenFeedbackModal = (e: React.MouseEvent, stage: SuccessionJourneyStage) => {
        e.stopPropagation(); // Prevent the stage from collapsing
        setSelectedStageForFeedback(stage);
        setIsFeedbackModalOpen(true);
    };
    
    const handleFeedbackSend = (message: Omit<FeedbackMessage, 'id'>, recommendations: Omit<DevelopmentRecommendation, 'id'>[]) => {
        if (!selectedStageForFeedback) return;
        onFeedbackSubmit(plan.id, selectedStageForFeedback.code, message, recommendations);
        setIsFeedbackModalOpen(false);
        setSelectedStageForFeedback(null);
    };

    const stageData = useMemo(() => {
        return organization.stages.map(stage => {
            const milestones = plan.journey.filter(m => m.stageCode === stage.code);
            if (milestones.length === 0) return null;

            const completedCount = milestones.filter(m => m.status === 'Completed').length;
            const totalCount = milestones.length;
            const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            
            let status: 'completed' | 'inProgress' | 'notStarted' = 'notStarted';
            let statusColor = 'bg-gray-500';
            if (percentage === 100) {
                status = 'completed';
                statusColor = 'bg-green-500';
            } else if (percentage > 0 || milestones.some(m => m.status === 'InProgress' || m.status === 'Delayed')) {
                status = 'inProgress';
                statusColor = 'bg-primary-500';
            }

            const estimatedDuration = calculateStageDuration(stage, orlsScore, plan.readiness);

            const isCandidate = activeRole === 'Leadership_Candidate';
            const isEvaluationStage = stage.type === 'evaluation';

            const feedbackThread = plan.feedbackThreads?.find(ft => ft.stageCode === stage.code);

            return {
                ...stage,
                milestones,
                completedCount,
                totalCount,
                percentage,
                status,
                statusColor,
                estimatedDuration,
                isCandidate,
                isEvaluationStage,
                feedbackThread,
            };
        }).filter(Boolean); // Remove stages with no milestones
    }, [organization.stages, plan.journey, plan.feedbackThreads, orlsScore, plan.readiness, activeRole]);
    

  return (
        <div className="space-y-4">
            {stageData.map((stage, index) => stage && (
                <Card key={stage.code} className="transition-all duration-300">
                    <div className="flex items-center cursor-pointer" onClick={() => handleToggleExpand(stage.code)}>
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center me-4 ${stage.statusColor}`}>
                            {stageIcons[stage.code]}
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-semibold text-white">{stage.name}</h4>
                            <ProgressBar progress={stage.percentage} />
                        </div>
                        <div className="text-sm text-gray-400 mx-4 hidden sm:block">
                            {stage.completedCount} / {stage.totalCount} {t.complete}
                        </div>
                        <ChevronDownIcon className={`transition-transform duration-300 ${expandedStageCode === stage.code ? 'rotate-180' : ''}`} />
                    </div>
                    
                    {expandedStageCode === stage.code && (
                        <div className="mt-6 space-y-4 animate-fade-in-up">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-sm">
                                <div className="bg-gray-900/50 p-2 rounded-md">
                                    <p className="text-gray-400">{t.cri}</p>
                                    <p className="font-bold text-red-400 text-lg">{stage.cri}%</p>
                                </div>
                                <div className="bg-gray-900/50 p-2 rounded-md">
                                    <p className="text-gray-400">{t.aei}</p>
                                    <p className="font-bold text-green-400 text-lg">{stage.aei}%</p>
                                </div>
                                <div className="bg-gray-900/50 p-2 rounded-md">
                                    <p className="text-gray-400">{t.estimatedDuration}</p>
                                    <p className="font-bold text-cyan-400 text-lg">{stage.estimatedDuration} {t.days}</p>
                                </div>
                                 <div className="bg-gray-900/50 p-2 rounded-md flex items-center justify-center">
                                    {!stage.isCandidate && (
                                        <Button size="sm" variant="secondary" onClick={(e) => handleOpenFeedbackModal(e, stage)}>
                                            <ChatBubbleLeftEllipsisIcon />
                                            {t.shareFeedback}
                                        </Button>
                                    )}
                                     {stage.isCandidate && stage.isEvaluationStage && (
                                        <div className="mt-4">
                                            <Button 
                                                onClick={() => onStartSurvey(stage.code)}
                                                variant="primary"
                                                className="w-full"
                                            >
                                                <BarChartIcon className="h-5 w-5" />
                                                {t.startEvaluation}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-2">
                                {stage.milestones.map(m => (
                                <li key={m.id} className="flex items-center p-2 bg-gray-900/50 rounded">
                                    <input
                                    type="checkbox"
                                    checked={m.status === 'Completed'}
                                    onChange={() => onToggleMilestone(m.id)}
                                    disabled={!canEdit}
                                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-primary-600 focus:ring-primary-500 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <span className={`ms-3 text-sm ${m.status === 'Completed' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{m.title}</span>
                                </li>
                                ))}
                            </ul>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                                <ReflectionLogView
                                    stage={stage}
                                    logs={reflectionLogs.filter(l => l.stage_code === stage.code)}
                                    allUsers={allUsers}
                                    currentUser={currentUser}
                                    orgId={plan.orgId}
                                    onAddLog={onAddReflectionLog}
                                    t={t}
                                    language={language}
                                />
                                <FeedbackThreadView 
                                    thread={stage.feedbackThread}
                                    plan={plan}
                                    currentUser={currentUser}
                                    activeRole={activeRole}
                                    allUsers={allUsers}
                                    t={t}
                                    onAddMessage={(message) => onFeedbackSubmit(plan.id, stage.code, message, [])}
                                    onUpdateStatus={(status) => {
                                        const updatedThreads = plan.feedbackThreads?.map(t => t.stageCode === stage.code ? { ...t, status } : t) || [];
                                        onFeedbackSubmit(plan.id, stage.code, {} as FeedbackMessage, []);
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </Card>
            ))}

            {selectedStageForFeedback && (
                <FeedbackDialogueModal 
                    isOpen={isFeedbackModalOpen}
                    onClose={() => setIsFeedbackModalOpen(false)}
                    stage={selectedStageForFeedback}
                    plan={plan}
                    currentUser={currentUser}
                    t={t}
                    language={language}
                    onSend={handleFeedbackSend}
                />
            )}
        </div>
    );
};

export default JourneyTimeline;