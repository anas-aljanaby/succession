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

## Next phase — Phase 5: Roles, permissions & coming-soon

**Goal:** make the role switcher *mean* something. Wire a single `can()` permission helper
into the UI so each role sees/does exactly what APP_SPEC §2.1 allows — hide or disable the
actions a role can't perform, scope the data a role can see, and make Candidate/Viewer
read-only. Then fill the remaining nav with `ComingSoon` stubs so there are no dead ends.

This is the first phase with **no new screens** — it's guards and visibility over the screens
that already exist. The role switcher (topbar) already swaps the active role + seeded user;
this phase makes the rest of the app react to it.

### The permission model (`src/lib/permissions.ts` — new, with Vitest)
Build the matrix from APP_SPEC §2.1 as one pure function plus a scope helper:

```ts
type Action =
  | 'org.create' | 'org.edit'
  | 'fn.create' | 'fn.edit' | 'fn.selectSuccessor'
  | 'candidate.addToPool' | 'candidate.score' | 'candidate.journey'
  | 'candidate.viewProfile';

can(role, action, scope?): boolean   // scope = { orgId?, candidate? } + the active user
```

Encode the §2.1 table exactly:
- **Consultant** — everything, all orgs.
- **Org Admin** — `org.edit` (own org only), `fn.create`/`fn.edit`/`fn.selectSuccessor`,
  `candidate.addToPool`, `candidate.journey`, view profiles. **Cannot score.**
- **HR Manager** — `candidate.addToPool`, `candidate.score`, `candidate.journey`, view
  profiles. **Cannot create functions or select successors.**
- **Supervisor** — `candidate.score` / `candidate.journey` **only for candidates whose
  `supervisorId` is this user**; view assigned profiles only.
- **Candidate** — read-only; can view **only their own** candidate (the user's `candidateId`).
- **Viewer** — read-only across their org; may view functions/candidates, no mutating actions.

Keep `can()` pure and table-driven; put the Supervisor/Candidate scope checks (compare
`candidate.supervisorId` / `user.candidateId`) in a small `scopeOk` helper. **Cover it with
Vitest** (BUILD_PLAN §1 promised tests for the data + permission layer — this is that test).

> Data note: the seed already has `supervisorId` on the model (BUILD_PLAN §5) and a user per
> role. Confirm at least one candidate is assigned to the seeded Supervisor and that the
> Candidate user's `candidateId` points at a real candidate — if not, fix the seed so the
> scoped roles are demonstrable. Bump the storage key (`blacksite.state.v2`) if you change the
> seed shape so stale `localStorage` is discarded.

### Wire `can()` into the UI (hide or disable, don't just leave dead buttons)
- **FunctionsList / FunctionDetail / FunctionForm:** gate "New function", "Edit",
  "Select successor", and the criteria editor on `fn.create`/`fn.edit`/`fn.selectSuccessor`.
- **FunctionDetail pool:** gate "Add candidate to pool" on `candidate.addToPool`; gate the
  per-row "Select successor" on `fn.selectSuccessor`.
- **CandidateDetail:** gate the score inputs on `candidate.score` (render read-only values when
  not allowed) and the journey checkboxes on `candidate.journey`. For Candidate/Viewer the
  whole screen is read-only.
- **CandidatesList:** Supervisor sees **only assigned** candidates; Candidate is redirected to
  their own detail; others see all in the org.
- **OrganizationsList / OrganizationForm:** already partly role-aware — confirm "New org" and
  "Edit" honor `org.create`/`org.edit` (Org Admin edits own only).
- **Sidebar:** already role-aware per the file map — re-check it hides what a role can't reach
  (Candidate sees only their journey; Viewer is read-only entries).
- Prefer **hiding** an action the role can never do; **disable** (with a reason) only when the
  control's absence would be confusing. No dead-end buttons.

### Coming-soon stubs in the nav (no dead ends)
`ComingSoon` already exists at `/coming-soon/:feature`. Add the deferred entries from
APP_SPEC §6 to the sidebar (Reports/analytics, reflection logs, surveys, AI insights, value
mirror) pointing at `/coming-soon/<feature>` so the nav is complete. Clean placeholder copy,
no decorative icons, both `en`/`ar`.

### i18n keys to add (both `en` + `ar`)
Any "read-only" / "you don't have permission" microcopy you surface, plus `comingSoon.*`
labels for each deferred nav entry. Reuse existing keys everywhere else.

### Verification checklist (reviewer runs this in Chrome)
- [ ] `tsc --noEmit` clean for `src/`; **`vitest run` green** (permission matrix covered);
      no console errors.
- [ ] Switch through all six roles via the topbar switcher — the sidebar, visible data, and
      available actions change to match §2.1 each time (no logout needed).
- [ ] **Org Admin** can create/edit functions and select a successor but the **score inputs
      are read-only**; **HR Manager** can score and add to pool but **cannot** create functions
      or select a successor.
- [ ] **Supervisor** sees only their assigned candidates and can score/journey only those.
- [ ] **Candidate** lands on their own detail, fully **read-only** (no score inputs, no
      checkboxes, no edit buttons); cannot reach another candidate.
- [ ] **Viewer** can browse the org read-only — no mutating action is reachable.
- [ ] Deferred nav entries route to `ComingSoon`, not dead ends. No emojis; RTL + English right.

### Out of scope for Phase 5 (do NOT build)
The deferred features themselves (reflection logs, surveys, stage closure/signatures, AI
insights/chatbot, reports/auto-pilot, value mirror) — stubs only. Old top-level file deletion
is **Phase 6**. Don't add a backend or real auth — roles stay mock/seeded.
