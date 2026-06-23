import { describe, expect, it } from 'vitest';
import {
  DEMO_PATH_VIEWS,
  ROUTED_VIEWS,
  validateNavigationGroups,
} from './validateNavigation';
import {
  CANDIDATE_JOURNEY_VIEWS,
  CONSULTANT_VIEWS,
  ORGANIZATION_VIEWS,
  ORG_WORKSPACE_VIEWS,
} from './types';

describe('navigation groups', () => {
  it('has no duplicate views across feature routers', () => {
    expect(validateNavigationGroups()).toEqual([]);
  });

  it('covers all feature router views', () => {
    const expected = [
      ...CONSULTANT_VIEWS,
      ...ORGANIZATION_VIEWS,
      ...ORG_WORKSPACE_VIEWS,
      ...CANDIDATE_JOURNEY_VIEWS,
    ];
    expect([...ROUTED_VIEWS].sort()).toEqual([...expected].sort());
  });

  it('defines a consultant demo path within routed views', () => {
    for (const view of DEMO_PATH_VIEWS) {
      expect(ROUTED_VIEWS).toContain(view);
    }
    expect(DEMO_PATH_VIEWS.length).toBeGreaterThanOrEqual(5);
  });
});
