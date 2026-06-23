import { describe, expect, it } from 'vitest';
import {
  buildCandidateOverviewStats,
  buildFunctionPlanRows,
  buildOrgDashboardKpis,
} from './orgDashboardMetrics';
import type { Candidate, CriticalFunction } from '../types';
import { DEFAULT_CRITERIA } from './criteria';

const fn: CriticalFunction = {
  id: 'fn-1',
  organizationId: 'org-1',
  title: 'CTO',
  department: 'Tech',
  priority: 'high',
  status: 'in-progress',
  criteria: DEFAULT_CRITERIA.map((c) => ({ ...c })),
};

const candidate: Candidate = {
  id: 'c-1',
  organizationId: 'org-1',
  criticalFunctionId: 'fn-1',
  name: 'Alex',
  currentPosition: 'Director',
  targetPosition: 'CTO',
  department: 'Tech',
  status: 'active',
  scores: DEFAULT_CRITERIA.map((c) => ({ criterionKey: c.key, value: 90 })),
  journey: [],
};

describe('orgDashboardMetrics', () => {
  it('computes KPIs from visible org data', () => {
    const kpis = buildOrgDashboardKpis('org-1', [fn], [candidate]);
    expect(kpis.criticalFunctions).toBe(1);
    expect(kpis.readySuccessors).toBe(1);
    expect(kpis.avgReadiness).toBe(90);
  });

  it('summarizes candidate counts', () => {
    expect(buildCandidateOverviewStats([candidate])).toEqual({
      total: 1,
      active: 1,
      selected: 0,
    });
  });

  it('ranks the top candidate per function', () => {
    const rows = buildFunctionPlanRows('org-1', [fn], [candidate]);
    expect(rows[0].topCandidate?.id).toBe('c-1');
    expect(rows[0].topReadiness).toBe(90);
  });
});
