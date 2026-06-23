import type { Candidate, CriticalFunction, FunctionStatus } from '../types';
import { READY_THRESHOLD } from './criteria';

// Readiness = weighted average of a candidate's criterion scores, by the function's
// criterion weights (spec §4.2). Derived, never stored.
export function computeReadiness(candidate: Candidate, fn: CriticalFunction): number {
  if (fn.criteria.length === 0) return 0;
  const totalWeight = fn.criteria.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) return 0;
  const weighted = fn.criteria.reduce((sum, c) => {
    const score = candidate.scores.find((s) => s.criterionKey === c.key)?.value ?? 0;
    return sum + score * c.weight;
  }, 0);
  return Math.round(weighted / totalWeight);
}

export function candidatesForFunction(
  fnId: string,
  candidates: Candidate[]
): Candidate[] {
  return candidates.filter((c) => c.criticalFunctionId === fnId);
}

// Function status (spec §4/§6): vacant if the pool is empty, ready if any candidate
// meets the threshold, otherwise in-progress.
export function functionStatusFor(
  fn: CriticalFunction,
  candidates: Candidate[]
): FunctionStatus {
  const pool = candidatesForFunction(fn.id, candidates);
  if (pool.length === 0) return 'vacant';
  const anyReady = pool.some((c) => computeReadiness(c, fn) >= READY_THRESHOLD);
  return anyReady ? 'ready' : 'in-progress';
}

// Org readiness = share of the org's functions that have a ready successor.
export function orgReadiness(
  orgId: string,
  functions: CriticalFunction[],
  candidates: Candidate[]
): number {
  const fns = functions.filter((f) => f.organizationId === orgId);
  if (fns.length === 0) return 0;
  const ready = fns.filter((f) => functionStatusFor(f, candidates) === 'ready').length;
  return Math.round((ready / fns.length) * 100);
}

export function journeyProgress(candidate: Candidate): number {
  const tasks = candidate.journey.flatMap((s) => s.tasks);
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === 'completed').length;
  return Math.round((done / tasks.length) * 100);
}
