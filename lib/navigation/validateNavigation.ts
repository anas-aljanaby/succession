import type { View } from '../../types';
import {
  CANDIDATE_JOURNEY_VIEWS,
  CONSULTANT_VIEWS,
  ORGANIZATION_VIEWS,
  ORG_WORKSPACE_VIEWS,
} from './types';

/** Views rendered by `AppViewRouter` feature modules. */
export const ROUTED_VIEWS: readonly View[] = [
  ...CONSULTANT_VIEWS,
  ...ORGANIZATION_VIEWS,
  ...ORG_WORKSPACE_VIEWS,
  ...CANDIDATE_JOURNEY_VIEWS,
];

/** Consultant demo golden path (order matters for manual QA). */
export const DEMO_PATH_VIEWS: readonly View[] = [
  'consulting-house-dashboard',
  'organizations-list',
  'dashboard',
  'candidates-management',
  'candidate-plan',
  'monitor',
  'journey-timeline-preview',
  'stage-detail-screen',
];

export function validateNavigationGroups(): string[] {
  const errors: string[] = [];
  const seen = new Map<View, string>();

  const groups: Array<{ name: string; views: readonly View[] }> = [
    { name: 'consultant', views: CONSULTANT_VIEWS },
    { name: 'organization', views: ORGANIZATION_VIEWS },
    { name: 'org-workspace', views: ORG_WORKSPACE_VIEWS },
    { name: 'candidate-journey', views: CANDIDATE_JOURNEY_VIEWS },
  ];

  for (const { name, views } of groups) {
    for (const view of views) {
      if (seen.has(view)) {
        errors.push(`View "${view}" is in both "${seen.get(view)}" and "${name}"`);
      } else {
        seen.set(view, name);
      }
    }
  }

  for (const view of DEMO_PATH_VIEWS) {
    if (!ROUTED_VIEWS.includes(view)) {
      errors.push(`Demo path view "${view}" is not covered by any feature router group`);
    }
  }

  return errors;
}
