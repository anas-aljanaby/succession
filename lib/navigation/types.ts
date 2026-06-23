import type { View } from '../../types';

export type NavigationParams = {
  planId?: number;
  candidateId?: string;
  stageId?: string;
  /** Clears active plan context (e.g. leaving journey back to org dashboard). */
  clearPlan?: boolean;
  /** Clears selected stage / stage-dashboard context. */
  clearStage?: boolean;
};

export type NavigateFn = (view: View, params?: NavigationParams) => void;

export const CONSULTANT_VIEWS: View[] = ['consulting-house-dashboard', 'consultant-dashboard'];

export const ORGANIZATION_VIEWS: View[] = [
  'organizations-list',
  'organization-form',
  'organization-details',
];

export const ORG_WORKSPACE_VIEWS: View[] = [
  'dashboard',
  'planner',
  'plan-creation-wizard',
  'candidates-management',
];

export const CANDIDATE_JOURNEY_VIEWS: View[] = [
  'monitor',
  'journey-timeline-preview',
  'values-dashboard',
  'stage-detail-screen',
  'stage-dashboard',
  'summary-screen',
  'candidate-plan',
  'learning-experience',
  'stage-closure',
];
