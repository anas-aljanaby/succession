import React from 'react';
import type { SuccessionPlan } from '../../../types';
import type { AppViewRouterContext } from '../viewRouterTypes';
import { ORG_WORKSPACE_VIEWS } from '../../../lib/navigation/types';
import Dashboard from '../../Dashboard';
import SuccessionPlanner from '../../SuccessionPlanner';
import PlanCreationWizard from '../../plan-flow/PlanCreationWizard';
import CandidatesManagement from '../../candidates/CandidatesManagement';

type OrgWorkspaceViewsProps = Pick<
  AppViewRouterContext,
  | 'currentView'
  | 't'
  | 'navigate'
  | 'localizedOrg'
  | 'localizedOrgPlans'
  | 'selectedOrgId'
  | 'activeRole'
  | 'plans'
  | 'candidatesState'
  | 'processingPlanIds'
  | 'setPlans'
  | 'setCandidatesState'
  | 'handleUpdateOrganization'
  | 'handleApproveClosure'
  | 'handleReturnClosure'
  | 'handleSaveCandidate'
  | 'handleDeleteCandidate'
>;

export const OrgWorkspaceViews: React.FC<OrgWorkspaceViewsProps> = ({
  currentView,
  t,
  navigate,
  localizedOrg,
  localizedOrgPlans,
  selectedOrgId,
  activeRole,
  plans,
  candidatesState,
  processingPlanIds,
  setPlans,
  setCandidatesState,
  handleUpdateOrganization,
  handleApproveClosure,
  handleReturnClosure,
  handleSaveCandidate,
  handleDeleteCandidate,
}) => {
  if (!ORG_WORKSPACE_VIEWS.includes(currentView)) return null;

  if (currentView === 'dashboard') {
    return (
      <Dashboard
        plans={localizedOrgPlans}
        organization={localizedOrg}
        t={t}
        viewPlan={(plan) => navigate('candidate-plan', { planId: plan.id })}
        createPlan={() => navigate('planner')}
        onUpdateOrganization={handleUpdateOrganization}
        activeRole={activeRole}
        onApproveClosure={handleApproveClosure}
        onReturnClosure={handleReturnClosure}
        processingPlanIds={processingPlanIds}
        candidates={candidatesState.candidates.filter(c => c.organizationId === localizedOrg.id)}
        onNavigateToCandidates={() => navigate('candidates-management')}
        onNavigateToPlanWizard={(candidateId?: string) => {
          setCandidatesState(prev => ({ ...prev, selectedCandidateId: candidateId || null }));
          navigate('plan-creation-wizard', candidateId ? { candidateId } : {});
        }}
      />
    );
  }

  if (currentView === 'planner') {
    return (
      <SuccessionPlanner
        t={t}
        onSave={(newPlanData) => {
          const newPlan: SuccessionPlan = {
            ...newPlanData,
            id: Date.now(),
            orgId: localizedOrg.id,
          };
          setPlans([...plans, newPlan]);
          navigate('dashboard');
        }}
        onCancel={() => navigate('dashboard')}
        organization={localizedOrg}
      />
    );
  }

  if (currentView === 'plan-creation-wizard') {
    return (
      <PlanCreationWizard
        organizationId={selectedOrgId?.toString()}
        preselectedCandidateId={candidatesState.selectedCandidateId || undefined}
        t={t}
        onCancel={() => {
          setCandidatesState(prev => ({ ...prev, selectedCandidateId: null }));
          navigate('dashboard');
        }}
        onComplete={(plan) => {
          setPlans(prev => [...prev, plan]);
          setCandidatesState(prev => ({ ...prev, selectedCandidateId: null }));
          navigate('candidate-plan', { planId: plan.id });
        }}
      />
    );
  }

  if (currentView === 'candidates-management') {
    return (
      <CandidatesManagement
        candidatesState={candidatesState}
        setCandidatesState={setCandidatesState}
        plans={plans}
        stages={localizedOrg.stages || []}
        t={t}
        onSave={handleSaveCandidate}
        onDelete={handleDeleteCandidate}
        onViewPlan={(planId) => navigate('candidate-plan', { planId })}
        onMonitorJourney={(planId) => navigate('monitor', { planId })}
        onCreatePlan={(candidateId) => {
          setCandidatesState(prev => ({ ...prev, selectedCandidateId: candidateId }));
          navigate('plan-creation-wizard', { candidateId });
        }}
      />
    );
  }

  return null;
};
