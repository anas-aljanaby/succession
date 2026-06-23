import type { View } from '../../types';
import type { NavigateFn, NavigationParams } from './types';

/** Shape exposed on `window.appApi` for legacy / cross-component navigation. */
export interface AppApiBridge {
  navigateTo: (view: View, params?: NavigationParams) => void;
  setCurrentView: (view: View, params?: NavigationParams) => void;
}

export function attachAppApiNavigation(
  navigate: NavigateFn,
  existing: Record<string, unknown> = {}
): AppApiBridge & Record<string, unknown> {
  const bridge: AppApiBridge = {
    navigateTo: (view, params) => navigate(view, params || {}),
    setCurrentView: (view, params) => navigate(view, params || {}),
  };

  return { ...existing, ...bridge };
}

export function installAppApi(api: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  (window as unknown as { appApi: Record<string, unknown> }).appApi = api;
}
