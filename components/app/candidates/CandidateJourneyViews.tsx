import React from 'react';
import type { AppViewRouterContext } from '../viewRouterTypes';
import { CANDIDATE_JOURNEY_VIEWS } from '../../../lib/navigation/types';
import { mockUsers } from '../../../constants';
import JourneyMonitor from '../../JourneyMonitor';
import JourneyTimelinePreview from '../../JourneyTimelinePreview';
import ValuesDashboard from '../../ValuesDashboard';
import StageDetailScreen from '../../StageDetailScreen';
import StageDashboard from '../../stage-dashboard/StageDashboard';
import SummaryScreen from '../../SummaryScreen';
import CandidatePlanView from '../../CandidatePlanView';
import LearningExperienceView from '../../LearningExperienceView';
import StageClosurePage from '../../StageClosurePage';

type CandidateJourneyViewsProps = Pick<
  AppViewRouterContext,
  | 'currentView'
  | 't'
  | 'navigate'
  | 'language'
  | 'localizedOrg'
  | 'localizedPlans'
  | 'localizedOrgPlans'
  | 'localizedActivePlan'
  | 'plans'
  | 'reflectionLogs'
  | 'currentUser'
  | 'activeRole'
  | 'selectedStageCode'
  | 'selectedStageCodeForDashboard'
  | 'candidatesState'
  | 'setActivePlan'
  | 'setSelectedStageCodeForDashboard'
  | 'setSurveyState'
  | 'handleUpdatePlan'
  | 'handleConfirmClosure'
  | 'onAddReflectionLog'
  | 'onFeedbackSubmit'
  | 'showNotification'
>;

export const CandidateJourneyViews: React.FC<CandidateJourneyViewsProps> = ({
  currentView,
  t,
  navigate,
  language,
  localizedOrg,
  localizedPlans,
  localizedOrgPlans,
  localizedActivePlan,
  plans,
  reflectionLogs,
  currentUser,
  activeRole,
  selectedStageCode,
  selectedStageCodeForDashboard,
  candidatesState,
  setActivePlan,
  setSelectedStageCodeForDashboard,
  setSurveyState,
  handleUpdatePlan,
  handleConfirmClosure,
  onAddReflectionLog,
  onFeedbackSubmit,
  showNotification,
}) => {
  if (!CANDIDATE_JOURNEY_VIEWS.includes(currentView)) return null;

  const activePlanId = localizedActivePlan?.id;

  // Back to candidates list (logical parent for candidate-level views)
  const backToCandidates = () => {
    setActivePlan(null);
    navigate('candidates-management', { clearPlan: true, clearStage: true });
  };

  // Back to journey monitor (logical parent for journey sub-views)
  const backToMonitor = () => navigate('monitor', { planId: activePlanId });

  // Back to journey timeline (logical parent for stage-level views)
  const backToTimeline = () => navigate('journey-timeline-preview', { planId: activePlanId });

  // Back to stage detail (logical parent for stage sub-views)
  const backToStageDetail = () => navigate('stage-detail-screen', { stageId: selectedStageCode!, planId: activePlanId });

  if (currentView === 'monitor' && localizedActivePlan) {
    return (
      <JourneyMonitor
        plan={localizedActivePlan}
        organization={localizedOrg}
        t={t}
        onBack={backToCandidates}
        onUpdatePlan={handleUpdatePlan}
        currentUser={currentUser}
        activeRole={activeRole}
        allUsers={mockUsers}
        reflectionLogs={reflectionLogs}
        onAddReflectionLog={onAddReflectionLog}
        onFeedbackSubmit={onFeedbackSubmit}
        language={language}
        onNavigateToJourneyTimelinePreview={() => navigate('journey-timeline-preview', { planId: activePlanId })}
        onNavigateToValuesDashboard={() => navigate('values-dashboard', { planId: activePlanId })}
        onIndicatorsUpdate={() => console.log('Indicators updated!')}
        onStageComplete={() => showNotification({ type: 'success', title: 'Stage Complete!', subtitle: 'Great work moving to the next phase.' })}
        onJourneyComplete={() => navigate('summary-screen', { planId: activePlanId })}
        onStartSurvey={(planId, stageCode, options) => setSurveyState({ isOpen: true, planId, stageCode, ...options })}
      />
    );
  }

  if (currentView === 'journey-timeline-preview' && localizedActivePlan) {
    return (
      <JourneyTimelinePreview
        plan={localizedActivePlan}
        organization={localizedOrg}
        t={t}
        onBack={backToMonitor}
        onStageSelect={(stageCode) => navigate('stage-detail-screen', { stageId: stageCode, planId: activePlanId })}
        activeRole={activeRole}
      />
    );
  }

  if (currentView === 'values-dashboard' && localizedActivePlan) {
    return (
      <ValuesDashboard
        plan={localizedActivePlan}
        organization={localizedOrg}
        t={t}
        onBack={backToMonitor}
        reflectionLogs={reflectionLogs.filter(r => r.org_id === localizedOrg.id)}
        allUsers={mockUsers}
        currentUser={currentUser}
        onAddReflectionLog={onAddReflectionLog}
        language={language}
        activeRole={activeRole}
      />
    );
  }

  if (currentView === 'stage-detail-screen' && localizedActivePlan && selectedStageCode) {
    return (
      <StageDetailScreen
        plan={localizedActivePlan}
        organization={localizedOrg}
        stageCode={selectedStageCode}
        t={t}
        onBack={backToTimeline}
        reflectionLogs={reflectionLogs}
        allUsers={mockUsers}
        currentUser={currentUser}
        activeRole={activeRole}
        onAddReflectionLog={onAddReflectionLog}
        language={language}
        onUpdatePlan={handleUpdatePlan}
        onStartSurvey={(stageCode, options) => setSurveyState({ isOpen: true, planId: localizedActivePlan.id, stageCode, ...options })}
        showNotification={showNotification}
        onNavigateToLearningExperience={() => navigate('learning-experience', { stageId: selectedStageCode, planId: activePlanId })}
        onNavigateToClosure={() => navigate('stage-closure', { stageId: selectedStageCode, planId: activePlanId })}
        onNavigateToStageDashboard={(stageCode) => navigate('stage-dashboard', { stageId: stageCode, planId: activePlanId })}
      />
    );
  }

  if (currentView === 'stage-dashboard' && selectedStageCodeForDashboard) {
    return (
      <StageDashboard
        stageCode={selectedStageCodeForDashboard}
        organization={localizedOrg}
        plans={localizedOrgPlans}
        candidates={candidatesState.candidates.filter(c => c.organizationId === localizedOrg.id)}
        t={t}
        onBack={() => {
          setSelectedStageCodeForDashboard(null);
          backToTimeline();
        }}
        onNavigateToCandidate={(planId) => navigate('monitor', { planId })}
      />
    );
  }

  if (currentView === 'summary-screen' && localizedActivePlan) {
    return (
      <SummaryScreen
        plan={localizedActivePlan}
        organization={localizedOrg}
        t={t}
        onBackToDashboard={backToCandidates}
      />
    );
  }

  if (currentView === 'candidate-plan') {
    const planToView = localizedActivePlan || localizedPlans.find(p => p.candidate.id === currentUser.candidateId);
    if (planToView) {
      return (
        <CandidatePlanView
          plan={planToView}
          organization={localizedOrg}
          t={t}
          onBack={backToCandidates}
          reflectionLogs={reflectionLogs}
        />
      );
    }
    return <div>{t.noPlanAssigned}</div>;
  }

  if (currentView === 'learning-experience' && localizedActivePlan && selectedStageCode) {
    const stage = localizedOrg.stages.find(s => s.code === selectedStageCode);
    return (
      <LearningExperienceView
        onBack={backToStageDetail}
        t={t}
        stageCode={selectedStageCode}
        stageName={stage?.name}
      />
    );
  }

  if (currentView === 'stage-closure' && localizedActivePlan && selectedStageCode) {
    return (
      <StageClosurePage
        plan={localizedActivePlan}
        organization={localizedOrg}
        stageCode={selectedStageCode}
        t={t}
        onBack={backToStageDetail}
        currentUser={currentUser}
        activeRole={activeRole}
        onConfirmClosure={handleConfirmClosure}
        onUpdatePlan={handleUpdatePlan}
        showNotification={showNotification}
        allPlans={localizedOrgPlans}
        reflectionLogs={reflectionLogs}
      />
    );
  }

  return null;
};
