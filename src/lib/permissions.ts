import type { Candidate, User, UserRole } from '../types';

export type Action =
  | 'org.create'
  | 'org.edit'
  | 'fn.create'
  | 'fn.edit'
  | 'fn.selectSuccessor'
  | 'candidate.addToPool'
  | 'candidate.score'
  | 'candidate.journey'
  | 'candidate.viewProfile';

export interface PermissionScope {
  user?: User | null;
  orgId?: string;
  candidate?: Candidate | null;
}

const permissions: Record<UserRole, Action[]> = {
  CONSULTANT: [
    'org.create',
    'org.edit',
    'fn.create',
    'fn.edit',
    'fn.selectSuccessor',
    'candidate.addToPool',
    'candidate.score',
    'candidate.journey',
    'candidate.viewProfile',
  ],
  ORGANIZATION_ADMIN: [
    'org.edit',
    'fn.create',
    'fn.edit',
    'fn.selectSuccessor',
    'candidate.addToPool',
    'candidate.journey',
    'candidate.viewProfile',
  ],
  HR_MANAGER: [
    'candidate.addToPool',
    'candidate.score',
    'candidate.journey',
    'candidate.viewProfile',
  ],
  SUPERVISOR: ['candidate.score', 'candidate.journey', 'candidate.viewProfile'],
  CANDIDATE: ['candidate.viewProfile'],
  VIEWER: ['candidate.viewProfile'],
};

const candidateOrgId = (scope: PermissionScope) => scope.candidate?.organizationId;
const scopedOrgId = (scope: PermissionScope) => scope.orgId ?? candidateOrgId(scope);

function orgScopeOk(scope: PermissionScope): boolean {
  const orgId = scopedOrgId(scope);
  return Boolean(orgId && scope.user?.organizationId === orgId);
}

function scopeOk(role: UserRole, action: Action, scope: PermissionScope): boolean {
  if (role === 'CONSULTANT') return true;
  if (action === 'org.create') return false;

  if (role === 'SUPERVISOR') {
    return Boolean(
      scope.candidate &&
        scope.candidate.supervisorId === scope.user?.id &&
        scope.candidate.organizationId === scope.user?.organizationId
    );
  }

  if (role === 'CANDIDATE') {
    return Boolean(
      action === 'candidate.viewProfile' &&
        scope.candidate &&
        scope.candidate.id === scope.user?.candidateId
    );
  }

  return orgScopeOk(scope);
}

export function can(
  role: UserRole | null | undefined,
  action: Action,
  scope: PermissionScope = {}
): boolean {
  if (!role || !permissions[role].includes(action)) return false;
  return scopeOk(role, action, scope);
}

export function canAccessOrg(
  role: UserRole | null | undefined,
  scope: PermissionScope = {}
): boolean {
  if (!role) return false;
  if (role === 'CONSULTANT') return true;
  if (role === 'CANDIDATE') return false;
  return orgScopeOk(scope);
}

export function visibleCandidatesForOrg(
  candidates: Candidate[],
  role: UserRole | null | undefined,
  user: User | null | undefined,
  orgId: string
): Candidate[] {
  return candidates.filter(
    (candidate) =>
      candidate.organizationId === orgId &&
      can(role, 'candidate.viewProfile', { user, candidate })
  );
}
