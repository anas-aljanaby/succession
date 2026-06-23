import type { AppState } from '../types';

// Versioned key: bump the version to discard stale saved state when the data shape
// changes during development (spec §9.1).
const STORAGE_KEY = 'blacksite.state.v1';

export function loadState(): AppState | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as AppState;
  } catch {
    return undefined;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — ignore; the app still works in-memory.
  }
}
