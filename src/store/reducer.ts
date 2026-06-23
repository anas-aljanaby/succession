import type {
  AppState,
  Candidate,
  CriticalFunction,
  Language,
  Organization,
  UserRole,
} from '../types';

export type Action =
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'LOGIN'; role: UserRole }
  | { type: 'SET_ROLE'; role: UserRole }
  | { type: 'LOGOUT' }
  | { type: 'ADD_ORG'; org: Organization }
  | { type: 'UPDATE_ORG'; org: Organization }
  | { type: 'ADD_FUNCTION'; fn: CriticalFunction }
  | { type: 'UPDATE_FUNCTION'; fn: CriticalFunction }
  | { type: 'DELETE_FUNCTION'; fnId: string }
  | { type: 'SELECT_SUCCESSOR'; fnId: string; candidateId: string }
  | { type: 'ADD_CANDIDATE'; candidate: Candidate };

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
    case 'ADD_FUNCTION':
      return { ...state, functions: [...state.functions, action.fn] };
    case 'UPDATE_FUNCTION':
      return {
        ...state,
        functions: state.functions.map((fn) =>
          fn.id === action.fn.id ? action.fn : fn
        ),
      };
    case 'DELETE_FUNCTION':
      return {
        ...state,
        functions: state.functions.filter((fn) => fn.id !== action.fnId),
        candidates: state.candidates.filter(
          (candidate) => candidate.criticalFunctionId !== action.fnId
        ),
      };
    case 'SELECT_SUCCESSOR':
      return {
        ...state,
        functions: state.functions.map((fn) =>
          fn.id === action.fnId
            ? { ...fn, selectedCandidateId: action.candidateId }
            : fn
        ),
        candidates: state.candidates.map((candidate) => {
          if (candidate.criticalFunctionId !== action.fnId) return candidate;
          if (candidate.id === action.candidateId) {
            return { ...candidate, status: 'selected' };
          }
          if (candidate.status === 'selected') {
            return { ...candidate, status: 'active' };
          }
          return candidate;
        }),
      };
    case 'ADD_CANDIDATE':
      return { ...state, candidates: [...state.candidates, action.candidate] };
    default:
      return state;
  }
}
