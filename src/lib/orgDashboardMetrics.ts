import type { Candidate, CriticalFunction } from '../types';
import { READY_THRESHOLD } from './criteria';
import {
  computeReadiness,
  candidatesForFunction,
  functionStatusFor,
  journeyProgress,
  orgReadiness,
} from './selectors';

export interface OrgDashboardKpis {
  criticalFunctions: number;
  readySuccessors: number;
  avgReadiness: number;
  orlsScore: number;
  avgCri: number;
  avgAei: number;
}

export interface FunctionPlanRow {
  fn: CriticalFunction;
  topCandidate: Candidate | null;
  topReadiness: number;
}

export interface CandidateOverviewStats {
  total: number;
  active: number;
  selected: number;
}

function orgFunctions(functions: CriticalFunction[], orgId: string) {
  return functions.filter((fn) => fn.organizationId === orgId);
}

function orgCandidates(candidates: Candidate[], orgId: string) {
  return candidates.filter((candidate) => candidate.organizationId === orgId);
}

export function buildOrgDashboardKpis(
  orgId: string,
  functions: CriticalFunction[],
  candidates: Candidate[]
): OrgDashboardKpis {
  const fns = orgFunctions(functions, orgId);
  const pool = orgCandidates(candidates, orgId);

  const readinessScores = pool
    .map((candidate) => {
      const fn = fns.find((item) => item.id === candidate.criticalFunctionId);
      return fn ? computeReadiness(candidate, fn) : null;
    })
    .filter((value): value is number => value !== null);

  const avgReadiness =
    readinessScores.length > 0
      ? Math.round(readinessScores.reduce((sum, value) => sum + value, 0) / readinessScores.length)
      : 0;

  const criScores = pool
    .map((candidate) => {
      const fn = fns.find((item) => item.id === candidate.criticalFunctionId);
      if (!fn || fn.criteria.length === 0) return null;
      const scores = fn.criteria.map(
        (criterion) =>
          candidate.scores.find((score) => score.criterionKey === criterion.key)?.value ?? 0
      );
      return Math.min(...scores);
    })
    .filter((value): value is number => value !== null);

  const avgCri =
    criScores.length > 0
      ? Math.round(criScores.reduce((sum, value) => sum + value, 0) / criScores.length)
      : 0;

  const avgAei =
    pool.length > 0
      ? Math.round(pool.reduce((sum, candidate) => sum + journeyProgress(candidate), 0) / pool.length)
      : 0;

  return {
    criticalFunctions: fns.length,
    readySuccessors: fns.filter((fn) => functionStatusFor(fn, candidates) === 'ready').length,
    avgReadiness,
    orlsScore: orgReadiness(orgId, functions, candidates),
    avgCri,
    avgAei,
  };
}

export function buildCandidateOverviewStats(candidates: Candidate[]): CandidateOverviewStats {
  return {
    total: candidates.length,
    active: candidates.filter((candidate) => candidate.status === 'active').length,
    selected: candidates.filter((candidate) => candidate.status === 'selected').length,
  };
}

export function buildFunctionPlanRows(
  orgId: string,
  functions: CriticalFunction[],
  candidates: Candidate[]
): FunctionPlanRow[] {
  return orgFunctions(functions, orgId).map((fn) => {
    const pool = candidatesForFunction(fn.id, candidates);
    if (pool.length === 0) {
      return { fn, topCandidate: null, topReadiness: 0 };
    }

    const topCandidate = pool.reduce((best, candidate) =>
      computeReadiness(candidate, fn) > computeReadiness(best, fn) ? candidate : best
    );

    return {
      fn,
      topCandidate,
      topReadiness: computeReadiness(topCandidate, fn),
    };
  });
}

export interface InsightBullet {
  id: string;
  text: string;
}

export function buildLatestInsights(
  rows: FunctionPlanRow[],
  interpolate: (key: string, vars: Record<string, string>) => string
): InsightBullet[] {
  const bullets: InsightBullet[] = [];

  for (const row of rows) {
    if (!row.topCandidate) continue;
    bullets.push({
      id: `${row.fn.id}-readiness`,
      text: interpolate('org.dashboard.insightReadiness', {
        name: row.topCandidate.name,
        role: row.fn.title,
        readiness: String(row.topReadiness),
      }),
    });
    if (bullets.length >= 3) break;
  }

  if (bullets.length === 0) {
    bullets.push({
      id: 'empty',
      text: interpolate('org.dashboard.noInsights', {}),
    });
  }

  return bullets;
}

export function buildLearningLoopItems(
  candidates: Candidate[],
  functions: CriticalFunction[],
  interpolate: (key: string, vars: Record<string, string>) => string
): InsightBullet[] {
  const items: InsightBullet[] = [];

  for (const candidate of candidates) {
    const fn = functions.find((item) => item.id === candidate.criticalFunctionId);
    if (!fn) continue;

    const readiness = computeReadiness(candidate, fn);
    if (readiness >= READY_THRESHOLD) continue;

    items.push({
      id: candidate.id,
      text: interpolate('org.dashboard.learningLoopItem', {
        name: candidate.name,
        readiness: String(readiness),
        role: fn.title,
      }),
    });
    if (items.length >= 3) break;
  }

  if (items.length === 0) {
    items.push({
      id: 'learning-empty',
      text: interpolate('org.dashboard.learningLoopEmpty', {}),
    });
  }

  return items;
}

export function buildImprovementThemes(
  candidates: Candidate[],
  functions: CriticalFunction[],
  interpolate: (key: string, vars: Record<string, string>) => string
): InsightBullet[] {
  const counts = new Map<string, number>();

  for (const candidate of candidates) {
    const fn = functions.find((item) => item.id === candidate.criticalFunctionId);
    if (!fn || fn.criteria.length === 0) continue;

    let weakest = fn.criteria[0];
    let weakestScore =
      candidate.scores.find((score) => score.criterionKey === weakest.key)?.value ?? 0;

    for (const criterion of fn.criteria) {
      const value =
        candidate.scores.find((score) => score.criterionKey === criterion.key)?.value ?? 0;
      if (value < weakestScore) {
        weakest = criterion;
        weakestScore = value;
      }
    }

    if (weakestScore < READY_THRESHOLD) {
      counts.set(weakest.label, (counts.get(weakest.label) ?? 0) + 1);
    }
  }

  const themes = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, count], index) => ({
      id: `theme-${index}`,
      text: interpolate('org.dashboard.improvementTheme', { label, count: String(count) }),
    }));

  return themes;
}
