# App Refactor Notes

## Goal

Move the app from a fragile "single mega-file" structure to a demo-ready and maintainable structure without breaking the consultant demo flow.

## Completed Passes

### Pass 1 - Audit

- Identified `App.tsx` as a combined state manager, navigation controller, and view router.
- Confirmed routing was fragmented across `setCurrentView(...)` calls and `window.appApi`.
- Confirmed duplicate/parallel navigation concepts (`NavigationMap.ts` exists but is not the runtime source of truth).

### Pass 2 - Navigation Stabilization

- Added `components/AppSectionNav.tsx` for consistent top-level section navigation.
- Introduced a single `navigate(view, params)` helper in `App.tsx`.
- Routed `window.appApi.navigateTo` / `window.appApi.setCurrentView` through the unified navigation helper.

### Pass 3 - Demo Flow Polish

- Consultant login now defaults to `consulting-house-dashboard`.
- Top-level movement between core sections is visible and role-aware.

### Pass 4 - App Shell Extraction

- Added `components/app/AppShellFrame.tsx` to centralize:
  - `Header`
  - `AppSectionNav`
  - shared page layout container
- Replaced duplicated authenticated page shell blocks in `App.tsx`.

### Pass 5 - View Router Extraction

- Added `components/app/AppViewRouter.tsx` to hold main view-selection/render logic.
- `App.tsx` now delegates primary screen rendering to `AppViewRouter`.
- This reduces `App.tsx` responsibility to app-level orchestration (auth/session/state integration).

### Pass 6 - Feature Routers + Navigation Contract

- Split routing into feature modules:
  - `components/app/consultant/ConsultantViews.tsx`
  - `components/app/organizations/OrganizationViews.tsx`
  - `components/app/org/OrgWorkspaceViews.tsx`
  - `components/app/candidates/CandidateJourneyViews.tsx`
- Added shared navigation types in `lib/navigation/types.ts` (`NavigationParams`, `NavigateFn`, view group constants).
- `AppViewRouter` now dispatches by view group, then feature router renders the screen.
- Feature routers use `navigate(view, params)` instead of ad-hoc `setCurrentView(...)` for transitions.
- Added `lib/navigation/appApiBridge.ts` and wired `App.tsx` `window.appApi` navigation through `attachAppApiNavigation()`.

## Current Architecture (High Level)

- `App.tsx`: app-level state, side effects, auth/session, `navigate()` implementation, shared services wiring.
- `lib/navigation/types.ts`: navigation contract and view group constants.
- `components/app/AppShellFrame.tsx`: shared authenticated shell (header + section nav + main).
- `components/app/AppViewRouter.tsx`: dispatches to feature routers by view group.
- Feature routers: consultant / organization / org workspace / candidate journey.
- UI feature components remain in domain folders (`consultant`, `candidates`, `organizations`, etc.).

## Why This Matters

- Reduces the chance of navigation regressions.
- Makes demo-path fixes faster (router and shell are now explicit boundaries).
- Creates clear seams for upcoming decomposition into feature modules.

## Demo Path (Consultant)

1. Login as **Consultant** → lands on `consulting-house-dashboard`.
2. Use section nav: **Global view** → **Organizations** → select org → **Dashboard** / **Candidates**.
3. Open a candidate plan or journey monitor from candidates list or dashboard table.
4. From journey: timeline → stage detail → (optional) values / closure / stage dashboard.

### Pass 7 - Navigation Cleanup + Smoke Tests

- Moved `navigate()` earlier in `App.tsx` so auth/closure/org handlers use one path.
- Extended `NavigationParams` with `clearPlan` and `clearStage` for leaving journey context cleanly.
- Replaced remaining `setCurrentView(...)` in login, logout, closure, and org-save handlers with `navigate(...)`.
- Added `lib/navigation/validateNavigation.ts` and Vitest coverage (`npm run test`).
- Documented `DEMO_PATH_VIEWS` for manual QA.

## Recommended Next Steps

1. Add Playwright (or similar) browser smoke test for the consultant demo path (`DEMO_PATH_VIEWS` in `lib/navigation/validateNavigation.ts`).
2. Deprecate or wire `NavigationMap.ts` to `lib/navigation/types` view constants.
3. Run `npm run test` in CI to guard navigation group coverage.
