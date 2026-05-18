

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { SuccessionPlan, Translations, Organization, User, ReflectionLog, Language, JourneyDashboardData, UserRole, FeedbackMessage, DevelopmentRecommendation, TaskStatus, ToastData } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { MapIcon } from './icons/MapIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { LriAssessmentView } from './LriAssessmentView';
import { JourneyDashboardView } from './JourneyDashboardView';
import JourneyTimeline from './JourneyTimeline';
import DevelopmentPlanView from './DevelopmentPlanView';
import { usePermissions } from '../lib/permissions/PermissionContext';
import { PERMISSIONS } from '../lib/permissions/roles';


interface JourneyMonitorProps {
    plan: SuccessionPlan;
    organization: Organization;
    t: Translations;
    onBack: () => void;
    onUpdatePlan: (plan: SuccessionPlan) => void;
    currentUser: User;
    activeRole: UserRole | null;
    allUsers: User[];
    reflectionLogs: ReflectionLog[];
    onAddReflectionLog: (log: Omit<ReflectionLog, 'id' | 'timestamp'>) => void;
    onFeedbackSubmit: (planId: number, stageCode: string, message: Omit<FeedbackMessage, 'id'>, recommendations: Omit<DevelopmentRecommendation, 'id'>[]) => void;
    language: Language;
    onNavigateToJourneyTimelinePreview: () => void;
    onNavigateToValuesDashboard: () => void;
    onIndicatorsUpdate: () => void;
    onStageComplete: () => void;
    onJourneyComplete: () => void;
    onStartSurvey: (planId: number, stageCode: string, options?: { title?: string, description?: string }) => void;
}

const JourneyMonitor: React.FC<JourneyMonitorProps> = (props) => {
    const { 
        plan, 
        organization, 
        t, 
        onBack, 
        onUpdatePlan, 
        currentUser, 
        activeRole, 
        allUsers, 
        reflectionLogs, 
        onAddReflectionLog, 
        onFeedbackSubmit,
        language, 
        onNavigateToJourneyTimelinePreview, 
        onNavigateToValuesDashboard, 
        onIndicatorsUpdate, 
        onStageComplete, 
        onJourneyComplete,
        onStartSurvey
    } = props;
  const [copied, setCopied] = useState(false);
  const [expandedStageCode, setExpandedStageCode] = useState<string | null>(null);
  const { hasPermission } = usePermissions();
  // Fix: Initialize useRef with null to provide a clear initial value.
  const prevJourneyDataRef = useRef<JourneyDashboardData | null>(null);

  const canEdit = hasPermission(PERMISSIONS.EDIT_PLAN);

  const orlsAverageScore = useMemo(() => {
    if (!organization.orlsAssessment) return 0;
    const scores = Object.values(organization.orlsAssessment) as number[];
    const total = scores.reduce((sum, score) => sum + score, 0);
    return scores.length > 0 ? Math.round(total / scores.length) : 0;
  }, [organization.orlsAssessment]);


  const journeyDashboardData = useMemo((): JourneyDashboardData => {
    const findCurrentStage = () => {
        let fallbackStage = organization.stages[0];
        let lastStageWithMilestones = null;

        for (const stage of organization.stages) {
            const stageMilestones = plan.journey.filter(m => m.stageCode === stage.code);
            if (stageMilestones.length > 0) {
                lastStageWithMilestones = stage;
                if (stageMilestones.some(m => m.status !== 'Completed')) {
                    return stage;
                }
            }
        }
        return lastStageWithMilestones || fallbackStage;
    };
    
    const currentStage = findCurrentStage();
    
    const tasksInStage = plan.journey.filter(m => m.stageCode === currentStage.code);
    const stageTasks = {
        completed: tasksInStage.filter(m => m.status === 'Completed').length,
        total: tasksInStage.length
    };

    return {
      currentStageName: currentStage.name,
      lriScore: plan.readiness,
      orlsScore: orlsAverageScore,
      cri: currentStage.cri ?? 0,
      aei: currentStage.aei ?? 0,
      stageTasks: stageTasks
    };
  }, [plan, organization, orlsAverageScore]);
  
  useEffect(() => {
    if (prevJourneyDataRef.current) {
      const prev = prevJourneyDataRef.current;
      const current = journeyDashboardData;
      if (
        prev.lriScore !== current.lriScore ||
        prev.orlsScore !== current.orlsScore ||
        prev.aei !== current.aei
      ) {
        onIndicatorsUpdate();
      }
    }
    // Update ref for the next render
    prevJourneyDataRef.current = journeyDashboardData;
  }, [journeyDashboardData, onIndicatorsUpdate]);
  

  const handleToggleMilestone = (id: number) => {
    if (!canEdit) return;
    
    let bviChange = 0;

    const updatedJourney = plan.journey.map(m => {
      if (m.id === id) {
        // Fix: Explicitly type `newStatus` as `TaskStatus` to prevent type widening to `string`, which would cause a type error in `onUpdatePlan`.
        const newStatus: TaskStatus = m.status === 'Completed' ? 'InProgress' : 'Completed';
        if (newStatus === 'Completed') {
            bviChange = 1;
        } else if (m.status === 'Completed') {
            bviChange = -1;
        }
        return { ...m, status: newStatus };
      }
      return m;
    });
    
    const toggledMilestone = updatedJourney.find(m => m.id === id);
    if (!toggledMilestone) return;

    const newBvi = Math.max(0, Math.min(100, plan.bvi + bviChange));
    
    const updatedPlan = { ...plan, journey: updatedJourney, bvi: newBvi };
    onUpdatePlan(updatedPlan);

    // Journey completion logic
    const allMilestonesCompleted = updatedJourney.every(m => m.status === 'Completed');
    if (allMilestonesCompleted) {
        setTimeout(() => {
            onJourneyComplete();
        }, 500); // Allow UI to update before navigating
        return; // Exit early
    }

    // Stage completion logic
    if (toggledMilestone.status === 'Completed') {
        const stageCode = toggledMilestone.stageCode;
        const milestonesInStage = updatedJourney.filter(m => m.stageCode === stageCode);
        const allComplete = milestonesInStage.every(m => m.status === 'Completed');

        if (allComplete) {
            onStageComplete();

            const currentStageIndex = organization.stages.findIndex(s => s.code === stageCode);
            let nextStage = null;
            // Find the next stage in the plan that actually has milestones
            for (let i = currentStageIndex + 1; i < organization.stages.length; i++) {
                const potentialNextStage = organization.stages[i];
                if (plan.journey.some(m => m.stageCode === potentialNextStage.code)) {
                    nextStage = potentialNextStage;
                    break;
                }
            }
            
            if (nextStage) {
                setTimeout(() => {
                    setExpandedStageCode(nextStage.code);
                }, 2000);
            }
        }
    }
  };

  const copyPlanToClipboard = () => {
    navigator.clipboard.writeText(plan.aiGeneratedPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  

  return (
    <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
            <Button onClick={onBack} variant="secondary">
                <ArrowLeftIcon />
                {t.backToDashboard}
            </Button>
            <div className="flex items-center gap-4">
                <Button onClick={onNavigateToJourneyTimelinePreview}>
                    <MapIcon />
                    {t.journeyTimelinePreview}
                </Button>
                 <Button onClick={onNavigateToValuesDashboard}>
                    <UserCircleIcon />
                    {t.viewValuesDashboard}
                </Button>
            </div>
        </div>
      
      <div>
        <h2 className="text-3xl font-bold text-white">{plan.roleTitle}</h2>
        <p className="text-lg text-primary-400">{t.journeyMonitorTitle} for {plan.candidate.name}</p>
      </div>
      
      <JourneyDashboardView data={journeyDashboardData} t={t} />
      
      <DevelopmentPlanView 
          recommendations={plan.developmentRecommendations || []}
          stages={organization.stages}
          activeRole={activeRole}
          t={t}
          language={language}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xl font-semibold text-white">{t.progressIndicators}</h3>
           <JourneyTimeline
                plan={plan}
                organization={organization}
                t={t}
                canEdit={canEdit}
                onToggleMilestone={handleToggleMilestone}
                expandedStageCode={expandedStageCode}
                setExpandedStageCode={setExpandedStageCode}
                currentUser={currentUser}
                activeRole={activeRole}
                allUsers={allUsers}
                reflectionLogs={reflectionLogs}
                onAddReflectionLog={onAddReflectionLog}
                onFeedbackSubmit={onFeedbackSubmit}
                language={language}
                orlsScore={orlsAverageScore}
                onStartSurvey={(stageCode, options) => onStartSurvey(plan.id, stageCode, options)}
            />
        </div>
        <div className="space-y-6">
            <LriAssessmentView assessment={plan.lriAssessment} t={t} />
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">{t.aiGeneratedPlan}</h3>
              <Card className="max-h-[500px] overflow-y-auto relative">
                  <Button onClick={copyPlanToClipboard} variant="secondary" size="sm" className="absolute top-2 right-2 rtl:right-auto rtl:left-2 z-10">
                      {copied ? <CheckIcon /> : <ClipboardIcon />}
                      {copied ? t.copied : t.copyPlan}
                  </Button>
                  <div className="prose prose-invert max-w-none text-sm pt-8" dangerouslySetInnerHTML={{ __html: plan.aiGeneratedPlan.replace(/\n/g, '<br/>') }} />
              </Card>
            </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyMonitor;