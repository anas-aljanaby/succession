import type { AppState, Language, UserRole } from '../types';

// Phase 1 actions: session + language. Domain mutation actions (orgs, functions,
// candidates, scores, tasks) are added as their screens are built in later phases.
export type Action =
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'LOGIN'; userId: string; role: UserRole }
  | { type: 'SET_ROLE'; role: UserRole }
  | { type: 'LOGOUT' };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, ui: { ...state.ui, language: action.language } };
    case 'LOGIN':
      return { ...state, session: { userId: action.userId, activeRole: action.role } };
    case 'SET_ROLE':
      return { ...state, session: { ...state.session, activeRole: action.role } };
    case 'LOGOUT':
      return { ...state, session: { userId: null, activeRole: null } };
    default:
      return state;
  }
}
