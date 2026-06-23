import { describe, expect, it } from 'vitest';
import type { Candidate, User } from '../types';
import { can } from './permissions';

const user = (overrides: Partial<User> = {}): User => ({
  id: 'u-user',
  name: 'User',
  email: 'user@example.com',
  roles: ['CONSULTANT'],
  ...overrides,
});

const candidate = (overrides: Partial<Candidate> = {}): Candidate => ({
  id: 'cand-1',
  organizationId: 'org-1',
  criticalFunctionId: 'fn-1',
  supervisorId: 'u-supervisor',
  name: 'Candidate',
  currentPosition: 'Manager',
  targetPosition: 'Director',
  department: 'Operations',
  status: 'active',
  scores: [],
  journey: [],
  ...overrides,
});

describe('can', () => {
  it('allows consultants to perform every modeled action across organizations', () => {
    const consultant = user({ id: 'u-consultant', roles: ['CONSULTANT'] });

    expect(can('CONSULTANT', 'org.create', { user: consultant })).toBe(true);
    expect(can('CONSULTANT', 'candidate.score', { user: consultant, candidate: candidate({ organizationId: 'org-2' }) })).toBe(true);
    expect(can('CONSULTANT', 'fn.selectSuccessor', { user: consultant, orgId: 'org-3' })).toBe(true);
  });

  it('limits organization admins to structural work in their own organization', () => {
    const admin = user({
      id: 'u-admin',
      roles: ['ORGANIZATION_ADMIN'],
      organizationId: 'org-1',
    });

    expect(can('ORGANIZATION_ADMIN', 'org.edit', { user: admin, orgId: 'org-1' })).toBe(true);
    expect(can('ORGANIZATION_ADMIN', 'fn.create', { user: admin, orgId: 'org-1' })).toBe(true);
    expect(can('ORGANIZATION_ADMIN', 'fn.selectSuccessor', { user: admin, orgId: 'org-1' })).toBe(true);
    expect(can('ORGANIZATION_ADMIN', 'candidate.journey', { user: admin, candidate: candidate() })).toBe(true);
    expect(can('ORGANIZATION_ADMIN', 'candidate.score', { user: admin, candidate: candidate() })).toBe(false);
    expect(can('ORGANIZATION_ADMIN', 'org.create', { user: admin, orgId: 'org-1' })).toBe(false);
    expect(can('ORGANIZATION_ADMIN', 'fn.edit', { user: admin, orgId: 'org-2' })).toBe(false);
  });

  it('lets HR managers operate candidates but not functions or successors', () => {
    const hr = user({ id: 'u-hr', roles: ['HR_MANAGER'], organizationId: 'org-1' });

    expect(can('HR_MANAGER', 'candidate.addToPool', { user: hr, orgId: 'org-1' })).toBe(true);
    expect(can('HR_MANAGER', 'candidate.score', { user: hr, candidate: candidate() })).toBe(true);
    expect(can('HR_MANAGER', 'candidate.journey', { user: hr, candidate: candidate() })).toBe(true);
    expect(can('HR_MANAGER', 'fn.create', { user: hr, orgId: 'org-1' })).toBe(false);
    expect(can('HR_MANAGER', 'fn.selectSuccessor', { user: hr, orgId: 'org-1' })).toBe(false);
    expect(can('HR_MANAGER', 'candidate.score', { user: hr, candidate: candidate({ organizationId: 'org-2' }) })).toBe(false);
  });

  it('limits supervisors to assigned candidates', () => {
    const supervisor = user({
      id: 'u-supervisor',
      roles: ['SUPERVISOR'],
      organizationId: 'org-1',
    });

    expect(can('SUPERVISOR', 'candidate.viewProfile', { user: supervisor, candidate: candidate() })).toBe(true);
    expect(can('SUPERVISOR', 'candidate.score', { user: supervisor, candidate: candidate() })).toBe(true);
    expect(can('SUPERVISOR', 'candidate.journey', { user: supervisor, candidate: candidate() })).toBe(true);
    expect(can('SUPERVISOR', 'candidate.score', { user: supervisor, candidate: candidate({ supervisorId: 'u-other' }) })).toBe(false);
    expect(can('SUPERVISOR', 'candidate.score', { user: supervisor, candidate: candidate({ organizationId: 'org-2' }) })).toBe(false);
  });

  it('keeps candidates read-only and scoped to their own profile', () => {
    const candidateUser = user({
      id: 'u-candidate',
      roles: ['CANDIDATE'],
      organizationId: 'org-1',
      candidateId: 'cand-1',
    });

    expect(can('CANDIDATE', 'candidate.viewProfile', { user: candidateUser, candidate: candidate() })).toBe(true);
    expect(can('CANDIDATE', 'candidate.viewProfile', { user: candidateUser, candidate: candidate({ id: 'cand-2' }) })).toBe(false);
    expect(can('CANDIDATE', 'candidate.score', { user: candidateUser, candidate: candidate() })).toBe(false);
    expect(can('CANDIDATE', 'candidate.journey', { user: candidateUser, candidate: candidate() })).toBe(false);
  });

  it('keeps viewers read-only within their organization', () => {
    const viewer = user({ id: 'u-viewer', roles: ['VIEWER'], organizationId: 'org-1' });

    expect(can('VIEWER', 'candidate.viewProfile', { user: viewer, candidate: candidate() })).toBe(true);
    expect(can('VIEWER', 'candidate.viewProfile', { user: viewer, candidate: candidate({ organizationId: 'org-2' }) })).toBe(false);
    expect(can('VIEWER', 'candidate.score', { user: viewer, candidate: candidate() })).toBe(false);
    expect(can('VIEWER', 'candidate.journey', { user: viewer, candidate: candidate() })).toBe(false);
  });
});
