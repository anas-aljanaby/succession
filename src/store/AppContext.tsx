import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { AppState } from '../types';
import { reducer, type Action } from './reducer';
import { loadState, saveState } from './storage';
import { seedState } from './seed';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

const init = (): AppState => loadState() ?? seedState();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  // Persist the whole state on every change (spec §9.1).
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Keep document language/direction in sync with state.
  useEffect(() => {
    document.documentElement.lang = state.ui.language;
    document.documentElement.dir = state.ui.language === 'ar' ? 'rtl' : 'ltr';
  }, [state.ui.language]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
