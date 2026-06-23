import React from 'react';
import {
  CANDIDATE_JOURNEY_VIEWS,
  CONSULTANT_VIEWS,
  ORGANIZATION_VIEWS,
  ORG_WORKSPACE_VIEWS,
} from '../../lib/navigation/types';
import type { AppViewRouterContext } from './viewRouterTypes';
import { ConsultantViews } from './consultant/ConsultantViews';
import { OrganizationViews } from './organizations/OrganizationViews';
import { OrgWorkspaceViews } from './org/OrgWorkspaceViews';
import { CandidateJourneyViews } from './candidates/CandidateJourneyViews';

export type { AppViewRouterContext } from './viewRouterTypes';

export const AppViewRouter: React.FC<AppViewRouterContext> = (props) => {
  const { currentView } = props;

  if (CONSULTANT_VIEWS.includes(currentView)) {
    return (
      <ConsultantViews
        currentView={currentView}
        t={props.t}
        language={props.language}
        organizations={props.organizations}
        localizedPlans={props.localizedPlans}
        reflectionLogs={props.reflectionLogs}
        onRunDailyAnalysis={props.onRunDailyAnalysis}
        handleUpdateOrganization={props.handleUpdateOrganization}
        onEnterOrg={props.onEnterOrg}
        navigate={props.navigate}
      />
    );
  }

  if (ORGANIZATION_VIEWS.includes(currentView)) {
    return (
      <OrganizationViews
        currentView={currentView}
        t={props.t}
        navigate={props.navigate}
        organizations={props.organizations}
        plans={props.plans}
        selectedOrg={props.selectedOrg}
        editingOrg={props.editingOrg}
        setEditingOrg={props.setEditingOrg}
        setSelectedOrgId={props.setSelectedOrgId}
        setOrganizations={props.setOrganizations}
        handleSaveOrganization={props.handleSaveOrganization}
        onEnterOrg={props.onEnterOrg}
      />
    );
  }

  if (ORG_WORKSPACE_VIEWS.includes(currentView)) {
    return (
      <OrgWorkspaceViews
        currentView={currentView}
        t={props.t}
        navigate={props.navigate}
        localizedOrg={props.localizedOrg}
        localizedOrgPlans={props.localizedOrgPlans}
        selectedOrgId={props.selectedOrgId}
        activeRole={props.activeRole}
        plans={props.plans}
        candidatesState={props.candidatesState}
        processingPlanIds={props.processingPlanIds}
        setPlans={props.setPlans}
        setCandidatesState={props.setCandidatesState}
        handleUpdateOrganization={props.handleUpdateOrganization}
        handleApproveClosure={props.handleApproveClosure}
        handleReturnClosure={props.handleReturnClosure}
        handleSaveCandidate={props.handleSaveCandidate}
        handleDeleteCandidate={props.handleDeleteCandidate}
      />
    );
  }

  if (CANDIDATE_JOURNEY_VIEWS.includes(currentView)) {
    return (
      <CandidateJourneyViews
        currentView={currentView}
        t={props.t}
        navigate={props.navigate}
        language={props.language}
        localizedOrg={props.localizedOrg}
        localizedPlans={props.localizedPlans}
        localizedOrgPlans={props.localizedOrgPlans}
        localizedActivePlan={props.localizedActivePlan}
        plans={props.plans}
        reflectionLogs={props.reflectionLogs}
        currentUser={props.currentUser}
        activeRole={props.activeRole}
        selectedStageCode={props.selectedStageCode}
        selectedStageCodeForDashboard={props.selectedStageCodeForDashboard}
        candidatesState={props.candidatesState}
        setActivePlan={props.setActivePlan}
        setSelectedStageCodeForDashboard={props.setSelectedStageCodeForDashboard}
        setSurveyState={props.setSurveyState}
        handleUpdatePlan={props.handleUpdatePlan}
        handleConfirmClosure={props.handleConfirmClosure}
        onAddReflectionLog={props.onAddReflectionLog}
        onFeedbackSubmit={props.onFeedbackSubmit}
        showNotification={props.showNotification}
      />
    );
  }

  return null;
};
