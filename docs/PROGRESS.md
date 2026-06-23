# Progress & Next-Phase Handoff

> Read order for anyone picking this up cold: [APP_SPEC.md](APP_SPEC.md) (what the app is)
> → [BUILD_PLAN.md](BUILD_PLAN.md) (screens, data model, phases) → this file (current state
> + the next phase to build).
>
> Workflow: an implementing agent builds the **Next phase** section below; a separate
> reviewer verifies against the checklist, then writes the following phase here.

---

## Current state (Phases 0–4 done)

The new app is built under `src/` and is the live entry (`index.html` → `/src/main.tsx`).
The old top-level files still exist but are **not loaded**; they get deleted in Phase 6.

**Stack:** React 19 + Vite + TS, `react-router-dom` v7, Tailwind via CDN. Dev server:
`npm run dev` (port 3000, or 3001 if taken). Type check: `npx tsc --noEmit -p tsconfig.json`
(only `src/` matters; ignore errors in old top-level files).

### File map (all under `src/`)
- `types.ts` — finalized data model (BUILD_PLAN §5). `readiness` and function `status` are
  **derived, never stored**.
- `store/AppContext.tsx` — Context + `useReducer`; persists whole state to `localStorage`
  on every change; syncs `<html lang/dir>`. Hook: `useApp() → { state, dispatch }`.
- `store/reducer.ts` — actions: `SET_LANGUAGE`, `LOGIN`, `SET_ROLE`, `LOGOUT`, `ADD_ORG`,
  `UPDATE_ORG`, `ADD_FUNCTION`, `UPDATE_FUNCTION`, `DELETE_FUNCTION`, `SELECT_SUCCESSOR`,
  `ADD_CANDIDATE`, `SET_SCORE` (clamped 0–100, upsert), `SET_TASK_STATUS`. (`LOGIN`/`SET_ROLE`
  map a role → a representative seeded user so scope follows the active role.)
- `store/storage.ts` — versioned key `blacksite.state.v1` (bump to discard stale state),
  `loadState`/`saveState`. No reset button by design.
- `store/seed.ts` — seed: 3 orgs (`org-acme`, `org-gda`, `org-mubarra`), 5 functions
  (`fn-cto`, `fn-cmo`, `fn-vpe`, `fn-strategy`, `fn-ceo-charity`), 5 candidates, one user
  per role. `fn-cto` has a **2-candidate pool** (Khalid + Sara; Sara is ready ≥85).
- `lib/selectors.ts` — `computeReadiness`, `candidatesForFunction`, `functionStatusFor`,
  `orgReadiness`, `journeyProgress`. **Use these for all derived values.**
- `lib/criteria.ts` — `DEFAULT_CRITERIA` (competence, leadership, strategic_thinking,
  values_alignment, learning_agility; weight 1 each), `READY_THRESHOLD = 85`.
- `lib/journey.ts` — `defaultJourney(initialStatuses?)` → the 4 stages with default tasks.
- `lib/i18n.tsx` — `useLanguage() → { language, setLanguage, t, dir }`. Translations are a
  flat `{ en, ar }` dict keyed by dotted strings; default language `ar` (RTL).
- `shell/` — `AppShell` (sidebar + topbar + `<Outlet/>`), `Sidebar` (global group always;
  org group when URL has `/organizations/:orgId`), `Topbar`, `Breadcrumb` (resolves ids →
  names from store), `RoleSwitcher`, `LanguageToggle`.
- `ui/` — `Button` (primary/secondary/ghost), `Card` (optional `to` makes it a link),
  `Badge` (+ `statusColor`, `priorityColor`), `PageHeader`, `Field`/`TextInput`/`TextArea`/
  `SelectInput`, `Placeholder`.
- `routes/` — `Login`, `Home` (role-aware landing), `OrganizationsList`,
  `OrganizationDashboard`, `OrganizationForm`, `FunctionsList`, `FunctionForm`,
  `FunctionDetail`, `CandidatesList`, `CandidateDetail`, `ComingSoon`.
- `App.tsx` — router. **All org/function/candidate routes are live — no `<Stub>` left.**
- `ui/Modal.tsx` — overlay dialog; closes on Escape, backdrop click, or the X (line-icon)
  button. `ui/ProgressBar.tsx` — clamped 0–100 bar + `%` label (reused by Phase 4 readiness).

### Conventions (must follow)
- **No emojis. No AI-slop copy.** Labels are short, literal, real ("Add candidate", "No
  candidates yet"). Both `en` and `ar` strings for every new key.
- Read state via `useApp()`; translate via `useLanguage().t`. Never compute readiness/status
  inline — call the selectors.
- Reuse `ui/` primitives and existing Tailwind palette (`bg-gray-900`, `bg-gray-800/40`
  surfaces, `border-gray-800`, `text-gray-*`, accent `primary-*`). Use logical edges for RTL
  (`border-e`, `ms-`, `me-`) — do not hardcode left/right.
- New ids: `fn-${Date.now()}`, `cand-${Date.now()}`.
- Keep `tsc` clean for `src/`.

### Verified working
Org portfolio, org dashboard (with function cards), org create/edit, role-based landing,
name-resolving breadcrumbs, persistence across refresh, RTL/Arabic + English toggle. No
console errors. (Verify in real Chrome at full width — the in-editor preview tool had a
1px-viewport glitch; the code is fine.)

---

## Phase 3 — verified ✅ (reviewer pass, 2026-06-23)

Verified in Chrome against the checklist below. All boxes pass:
- [x] `tsc --noEmit` clean for `src/` (0 errors; remaining errors are only in the old
      top-level `components/` files, which aren't loaded — deleted in Phase 6). No console errors.
- [x] Functions list renders the org's functions with derived status/priority/pool-size;
      "New function" opens the form.
- [x] Creating a function with edited criteria/weights persists and shows in list + dashboard.
- [x] Function detail shows criteria + the pool **ranked by readiness** (Sara 88% above
      Khalid 56% on `fn-cto`).
- [x] Add-to-pool modal (Escape/backdrop/X all close); fresh 0-score candidate added.
- [x] Select successor marks the row selected and shows the name in the header.
- [x] Breadcrumb shows the real function title; RTL + English both correct.

**Frontend fixes applied during review** (the implementing agent's layout had defects):
1. `FunctionDetail` pool table overflowed its container by ~450px, pushing the **readiness
   meter and the "Select successor" action entirely off-screen**. Fixed by stacking the
   criteria panel above the pool (criteria rendered as compact chips instead of a 320px
   side column) and tightening table cell padding + the readiness column width. The table
   now fits with no horizontal scroll at standard width.
2. `Modal` close button was a literal lowercase `"x"` glyph → replaced with a clean SVG
   line-icon X (per the build-plan "clean SVG/line icons only" rule).

> Note: the review left `fn-cto` with Sara selected as successor in the demo localStorage
> state (a side effect of clicking through the flow). Harmless; re-pick or clear the
> `blacksite.state.v1` key to reseed.

---

## Phase 4 — verified ✅ (reviewer pass, 2026-06-23)

Verified in Chrome against the checklist. All boxes pass:
- [x] `tsc --noEmit` clean for `src/` (0 errors). No console errors.
- [x] Candidates list renders for an org; rows resolve the function title (via an id→fn map);
      name links to the candidate detail.
- [x] Candidate detail shows profile + per-criterion scores + the 4-stage journey; links from
      the function pool table land here.
- [x] **Score edit updates readiness live** — set Khalid's scores → gauge went 56% → 90% with
      no refresh, and persisted to `localStorage`.
- [x] Journey checkbox toggles a task and **persists** across refresh; per-stage and overall
      progress recompute.
- [x] Function status / readiness stay derived (`computeReadiness`, `functionStatusFor`,
      `journeyProgress` reused — nothing stored). RTL + English both correct.

`SET_SCORE` (clamped, upsert) and `SET_TASK_STATUS` (immutable stage/task map) landed in the
reducer; scores save live on `onChange` as decided. `UPDATE_CANDIDATE` was not needed and
wasn't added — fine.

**Review notes (non-blocking — the frontend was solid this time, no layout defects):**
1. `candidateStatusColor` is **duplicated verbatim** in `routes/CandidatesList.tsx` and
   `routes/CandidateDetail.tsx`. Lift it into `ui/Badge.tsx` next to `statusColor`/
   `priorityColor` and import from there. Small DRY cleanup; do it opportunistically.
2. The score `<input type="number">` snaps an emptied field to `0` (`Number('') → 0`). Minor;
   acceptable for a 0–100 score. Leave unless it annoys in testing.

> Heads up for the next implementer: the running Vite dev server binds to **port 3000**
> (vite default), even though `.claude/launch.json` / older notes mention 3001. Use whatever
> port the `vite` startup log prints.

---

## Phase 5 — verified ✅ (reviewer pass, 2026-06-23)

Verified against the checklist. `tsc --noEmit` clean for `src/` (the only errors are in the
old top-level `components/` files — not loaded, deleted in Phase 6). `vitest run` green:
**6 permission tests** in `src/lib/permissions.test.ts` (one per role) + 3 legacy nav tests.

- [x] `src/lib/permissions.ts` encodes §2.1 exactly: a table-driven `can(role, action, scope)`
      plus a `scopeOk` helper for the Supervisor (`candidate.supervisorId === user.id` **and**
      same org) and Candidate (`candidate.id === user.candidateId`) scope checks. Two extra
      helpers landed and are used everywhere: `canAccessOrg` (org-scoped route guard) and
      `visibleCandidatesForOrg` (data scoping). Clean, pure, no React in the lib.
- [x] Role table correct: Consultant = all/all orgs; Org Admin = structural + journey but
      **not score**; HR Manager = pool/score/journey but **not** create-fn/select-successor;
      Supervisor/Candidate scoped via `scopeOk`; Viewer read-only in own org.
- [x] UI gates **hide** actions rather than leaving dead buttons — New function, Edit, Add to
      pool, per-row Select successor, New org all gated; score inputs render as read-only
      values with `permissions.readOnly` microcopy when `candidate.score` is denied; journey
      checkboxes carry `disabled`.
- [x] CandidatesList scopes rows via `visibleCandidatesForOrg`; Candidate is redirected to
      their own detail from the list and the org list; CandidateDetail/FunctionsList/
      FunctionDetail/OrganizationsList guard on `canAccessOrg` and `Navigate` away otherwise.
- [x] Sidebar is role-aware: Candidate gets only Home + "My journey"; Supervisor's Functions
      link is hidden; org nav only renders when `canAccessOrg` passes.
- [x] Seed is demonstrable: `u-sup` supervises `cand-khalid` + `cand-sara`; `u-cand.candidateId
      = cand-khalid`. (These scope fields predate Phase 5, so the storage key was **not** bumped
      — correct call; stale `v1` state already carries them.)
- [x] ComingSoon nav complete: reports, reflection-logs, surveys, stage-closure, ai-insights,
      value-mirror — all routed, both `en`/`ar`, no decorative icons. Phase 4's
      `candidateStatusColor` DRY note was also addressed (lifted into `ui/Badge.tsx`).

**Review notes (non-blocking — no defects, do opportunistically):**
1. `FunctionDetail` computes the header status badge with `functionStatusFor(fn,
   state.candidates)` (line 48 — **all** candidates), while the pool ranking and
   `CandidateDetail` use `visibleCandidates`. For a Supervisor the header would reflect the
   full pool but the table shows only assigned candidates. Pick one — using `visibleCandidates`
   there too is the consistent choice.
2. Supervisor/Viewer can still reach `FunctionsList`/`FunctionDetail` by typing the URL
   (`canAccessOrg` passes for any same-org role); the Supervisor's sidebar link is hidden but
   the route isn't blocked. Harmless — those screens are read-only for them — but note it.
3. The score `<input type="number">` still snaps an emptied field to `0` (carried from Phase 4).
   Acceptable.

---

## Next phase — Phase 6: Cleanup (delete legacy, finalize entry)

**Goal:** remove the dead pre-rebuild code now that every screen lives under `src/` and is the
live entry. This is the final BUILD_PLAN phase — **no features, no behavior change.** Pure
deletion + verification that nothing under `src/` depended on what was removed.

### What's safe to delete (verified: nothing in `src/` imports any of it)
`index.html` already points at `/src/main.tsx`, and a grep for legacy imports inside `src/`
comes back empty. The orphaned top-level files are:
- `App.tsx`, `index.tsx`, `NavigationMap.ts`, `constants.ts`, top-level `types.ts`
- `components/` (the entire old screen set — this is what produces the remaining `tsc` errors)
- top-level `lib/` (the **old** lib — not `src/lib/`)

> ⚠️ `lib/navigation/navigation.test.ts` (the 3 legacy nav tests in the current `vitest run`)
> lives under the old top-level `lib/`. Confirm it tests only legacy navigation, then delete it
> with `lib/`. After Phase 6, `vitest run` should show **only** `src/lib/permissions.test.ts`.

> Keep: root `vite.config.ts`, `index.html`, `tsconfig.json`, `package.json`, everything under
> `src/`, and `docs/`. Don't touch `output/playwright/` screenshots.

### Steps
1. Delete the legacy files/dirs listed above → verify: `git status` shows only deletions +
   this doc.
2. Check `tsconfig.json` / `vite.config.ts` for `include`/`alias`/`root` entries that referenced
   the deleted paths; remove only those. Don't restructure config that still applies to `src/`.
3. Re-run the full gate.

### Verification checklist (reviewer runs this)
- [ ] `npx tsc --noEmit -p tsconfig.json` is **fully clean** — zero errors now that the old
      `components/` files are gone (this is the first phase where there's no "ignore legacy"
      caveat).
- [ ] `vitest run` green and contains **only** `src/lib/permissions.test.ts` (legacy nav test
      removed with its dir).
- [ ] `npm run dev` boots; app loads, routes switch, refresh persists — no broken imports, no
      console errors. Spot-check one flow per role to confirm nothing was wired to deleted code.
- [ ] `npm run build` (if defined) succeeds with no unresolved-import warnings.
- [ ] `git status` shows deletions of legacy files only — no stray edits to `src/`.

### Out of scope for Phase 6 (do NOT build)
Any deferred feature (reflection logs, surveys, stage closure, AI insights, reports, value
mirror) — those stay ComingSoon stubs. No new screens, no refactors of `src/`, no backend,
no real auth. If you spot a cleanup worth doing inside `src/`, note it here — don't fold it
into the deletion commit.
