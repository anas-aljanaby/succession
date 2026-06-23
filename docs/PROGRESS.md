# Progress & Next-Phase Handoff

> Read order for anyone picking this up cold: [APP_SPEC.md](APP_SPEC.md) (what the app is)
> → [BUILD_PLAN.md](BUILD_PLAN.md) (screens, data model, phases) → this file (current state
> + the next phase to build).
>
> Workflow: an implementing agent builds the **Next phase** section below; a separate
> reviewer verifies against the checklist, then writes the following phase here.

---

## Current state (Phases 0–3 done)

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
- `store/reducer.ts` — actions so far: `SET_LANGUAGE`, `LOGIN`, `SET_ROLE`, `LOGOUT`,
  `ADD_ORG`, `UPDATE_ORG`. (`LOGIN`/`SET_ROLE` map a role → a representative seeded user
  so scope follows the active role.)
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
  `OrganizationDashboard`, `OrganizationForm`, `ComingSoon`.
- `App.tsx` — router. Function routes are live (`FunctionsList`/`FunctionForm`/`FunctionDetail`).
  **Only the two candidate routes still render `<Stub>` placeholders.**
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

## Next phase — Phase 4: Candidate detail (scoring + journey + readiness)

**Goal:** the candidates list and the ⭐ candidate detail screen — editable per-criterion
scores that drive the readiness gauge, and the 4-stage journey with checkable tasks. After
this phase the candidate routes stop being stubs and the readiness numbers become *live*
(editing a score flows all the way up: candidate readiness → function status → org rollup).

### Reducer actions to add (`store/reducer.ts`)
- `SET_SCORE { candidateId: string; criterionKey: string; value: number }` — **upsert** into
  the candidate's `scores` (replace the entry for that key, or append if absent). Clamp 0–100.
  **Decision: scores save live on every input change** (dispatch on `onChange`) — no Save
  button, no local dirty state. The readiness gauge must visibly update as you type.
- `SET_TASK_STATUS { candidateId: string; stageCode: string; taskId: string; status: TaskStatus }`
  — flip one task's status within the matching stage. Keep it immutable (map, don't mutate).
- `UPDATE_CANDIDATE { candidate: Candidate }` — for editing the profile fields (optional this
  phase; only add if you build candidate edit. Not required by the checklist.)

Do **not** store `readiness` or function `status` — they stay derived (`computeReadiness`,
`functionStatusFor`, `journeyProgress` already exist in `lib/selectors.ts`; reuse them).

### Screens (replace the two `<Stub>` routes in `App.tsx`)
1. **CandidatesList** — `/organizations/:orgId/candidates`
   - Table/cards of every candidate in the org (across all functions): name, current → target,
     the function they're in (resolve `criticalFunctionId` → title), readiness, status.
     Row links to the candidate detail. Empty state when the org has no candidates.
   - (Supervisor-only filtering is **Phase 5** — show all candidates here for now.)
2. **CandidateDetail** — `/organizations/:orgId/candidates/:candId` ⭐
   - Resolve the candidate and its function. If not found → redirect to the candidates list.
   - **Profile:** name, current/target position, department, status badge.
   - **Scores panel:** one row per *function criterion* (drive off `fn.criteria`, not the
     stored scores — a criterion with no score yet shows 0). Each row: label, weight, and a
     number input (0–100) → `SET_SCORE` on change. Show the live **readiness gauge**
     (reuse `ProgressBar`) computed via `computeReadiness(candidate, fn)`; it must update as
     you type. Surface the derived function status nearby so the threshold flip is visible.
   - **Journey:** the 4 stages from `candidate.journey`; per stage list its tasks with a
     control to set status (a checkbox toggling `completed`/`notStarted` is enough — an
     `inProgress` middle state is optional). Show per-stage and overall progress via
     `journeyProgress` (or a per-stage count). `SET_TASK_STATUS` on toggle.
3. Wire the candidate-name links already present in `FunctionDetail`'s pool table — they
   already point at `…/candidates/:candId`, so they light up for free.

### UI primitives
`ProgressBar` already exists (readiness gauge + journey progress). A `Gauge.tsx` is listed in
BUILD_PLAN §6 but is **optional** — `ProgressBar` covers it. Reuse `Field`/`TextInput`
(type="number") for scores and `Badge` for statuses. Add a small checkbox/toggle only if
needed; a styled native checkbox is fine (no new dependency).

### i18n keys to add (both `en` + `ar`)
Candidates list (title/subtitle/empty, column headers: candidate/current→target/function/
readiness/status — reuse `functions.candidate/current/target/readiness/status` where they
fit). Candidate detail (profile heading, scores heading, "score" label, journey heading,
stage progress, task "mark done"/"done", overall progress). Reuse `status.*`, `priority.*`,
`form.*`. Every new key needs `en` **and** `ar`.

### Router change (`App.tsx`)
Replace the two `/organizations/:orgId/candidates…` `<Stub>` routes with `CandidatesList` and
`CandidateDetail`. Add them to `src/routes/` and import in `App.tsx`.

### Verification checklist (reviewer runs this in Chrome)
- [ ] `tsc --noEmit` clean for `src/`; no console errors.
- [ ] Candidates list renders for an org; rows resolve the function title; link to detail works.
- [ ] Candidate detail shows profile + scores + journey; links from the pool table land here.
- [ ] **Edit a score → readiness gauge updates immediately** (no refresh). Push `fn-cto`'s
      Khalid above 85 on enough criteria → his readiness ≥ 85 → function `fn-cto` stays/turns
      `ready`; drop Sara below 85 too and confirm the function flips to `in-progress`.
- [ ] Function status + org readiness rollup reflect the score change (cross-check the org
      dashboard / functions list badges).
- [ ] Toggle journey tasks → per-stage and overall progress update and **persist** across refresh.
- [ ] No emojis; copy is literal; RTL + English both look right.

### Out of scope for Phase 4 (do NOT build)
Permissions / read-only Candidate role and Supervisor candidate-filtering (Phase 5).
ComingSoon nav wiring (Phase 5). Reflection logs, surveys, AI insights, reports (stubs only,
later). Don't touch the old top-level files (Phase 6 cleanup).
