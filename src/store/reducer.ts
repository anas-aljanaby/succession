import type { AppState, Language, Organization, UserRole } from '../types';

export type Action =
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'LOGIN'; role: UserRole }
  | { type: 'SET_ROLE'; role: UserRole }
  | { type: 'LOGOUT' }
  | { type: 'ADD_ORG'; org: Organization }
  | { type: 'UPDATE_ORG'; org: Organization };

// For the demo, a role maps to a representative seeded user so that scope
// (organizationId / candidateId) follows the active role.
function userIdForRole(state: AppState, role: UserRole): string | null {
  return state.users.find((u) => u.roles.includes(role))?.id ?? null;
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, ui: { ...state.ui, language: action.language } };
    case 'LOGIN':
    case 'SET_ROLE':
      return {
        ...state,
        session: { userId: userIdForRole(state, action.role), activeRole: action.role },
      };
    case 'LOGOUT':
      return { ...state, session: { userId: null, activeRole: null } };
    case 'ADD_ORG':
      return { ...state, organizations: [...state.organizations, action.org] };
    case 'UPDATE_ORG':
      return {
        ...state,
        organizations: state.organizations.map((o) =>
          o.id === action.org.id ? action.org : o
        ),
      };
    default:
      return state;
  }
}
