import type { UserRole } from '../../types';

export const ROLES: { [key in UserRole]: UserRole } = {
  CONSULTANT: 'CONSULTANT',
  ORGANIZATION_ADMIN: 'ORGANIZATION_ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  SUPERVISOR: 'SUPERVISOR',
  CANDIDATE: 'CANDIDATE',
  VIEWER: 'VIEWER'
} as const;

export const PERMISSIONS = {
  // Organization Management
  CREATE_ORGANIZATION: 'create_organization',
  EDIT_ORGANIZATION: 'edit_organization',
  DELETE_ORGANIZATION: 'delete_organization',
  VIEW_ALL_ORGANIZATIONS: 'view_all_organizations',
  
  // Candidate Management
  CREATE_CANDIDATE: 'create_candidate',
  EDIT_CANDIDATE: 'edit_candidate',
  DELETE_CANDIDATE: 'delete_candidate',
  VIEW_CANDIDATES: 'view_candidates',
  
  // Plan Management
  CREATE_PLAN: 'create_plan',
  EDIT_PLAN: 'edit_plan',
  APPROVE_PLAN: 'approve_plan',
  
  // Stage Management
  CLOSE_STAGE: 'close_stage',
  APPROVE_STAGE_CLOSURE: 'approve_stage_closure',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports'
} as const;

// Fix: Replaced computed property keys with string literals to ensure TypeScript correctly infers the type and satisfies the Record<UserRole, ...> constraint.
export const rolePermissions: Record<UserRole, (typeof PERMISSIONS[keyof typeof PERMISSIONS])[]> = {
  CONSULTANT: Object.values(PERMISSIONS),
  ORGANIZATION_ADMIN: [
    PERMISSIONS.CREATE_CANDIDATE,
    PERMISSIONS.EDIT_CANDIDATE,
    PERMISSIONS.VIEW_CANDIDATES,
    PERMISSIONS.CREATE_PLAN,
    PERMISSIONS.EDIT_PLAN,
    PERMISSIONS.APPROVE_PLAN,
    PERMISSIONS.CLOSE_STAGE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS
  ],
  HR_MANAGER: [
    PERMISSIONS.CREATE_CANDIDATE,
    PERMISSIONS.VIEW_CANDIDATES,
    PERMISSIONS.CREATE_PLAN,
    PERMISSIONS.VIEW_REPORTS
  ],
  SUPERVISOR: [
    PERMISSIONS.VIEW_CANDIDATES,
    PERMISSIONS.CLOSE_STAGE,
    PERMISSIONS.VIEW_REPORTS
  ],
  CANDIDATE: [],
  VIEWER: [
    PERMISSIONS.VIEW_CANDIDATES,
    PERMISSIONS.VIEW_REPORTS
  ]
};