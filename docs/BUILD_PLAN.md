# Build Plan — Screens, Data Model & Phases

> Companion to [APP_SPEC.md](APP_SPEC.md). The spec is the *what*; this is the *how*.
> Read the spec first. This doc is what we build against.

---

## 1. Tech decisions

| Concern | Decision | Why |
|---|---|---|
| Framework | React 19 + Vite + TS (existing) | Already in place, no reason to change |
| **Routing** | **`react-router-dom` v7** (new dependency) | Real URL routes → Back/Forward/refresh/deep-links work (§8.3). Fixes "no going back." |
| State | React Context + `useReducer` (one app store) | No backend; one in-memory store is enough. No Redux needed. |
| Persistence | `localStorage` behind a `storage` module | §9.1 — hydrate-or-seed, versioned key |
| Styling | Tailwind (CDN, existing) + theme CSS vars | Keep the current look (§8.4) |
| i18n | Simple `t(key)` dictionary + `dir` switch | Matches current approach, AR/EN + RTL |
| Tests | Vitest for the data layer (readiness calc, permissions) | Guard the logic that matters |

> **New dependency to install:** `react-router-dom`. Everything else is already present.

### 1.1 UI copy & visual principles

- **No emojis** anywhere in the frontend — not in labels, buttons, empty states, or stubs.
- **No "AI slop":** no filler/marketing fluff, no fake testimonials, no lorem-ipsum, no
  generic "Empower your team to unlock synergy" copy. Labels are short, literal, and real
  (e.g. "Add candidate", "No candidates yet").
- Use clean SVG/line icons only where they aid scanning — never decorative.
- Keep the existing restrained dark theme (§8.4 of the spec); no gratuitous gradients/glow.

---

## 2. Route map

URLs mirror the hierarchy (§3), so the breadcrumb and Back button are just the URL.

```
/login                                          Role-select / welcome
/                                               Home (role-aware landing)

/organizations                                  Org list (Consultant)
/organizations/new                              Create org
/organizations/:orgId                           Org dashboard
/organizations/:orgId/edit                      Edit org

/organizations/:orgId/functions                 Critical functions list
/organizations/:orgId/functions/new             Create function
/organizations/:orgId/functions/:fnId           Function detail (pool + criteria)
/organizations/:orgId/functions/:fnId/edit      Edit function + criteria

/organizations/:orgId/candidates                All candidates in org
/organizations/:orgId/candidates/:candId        Candidate detail (scores + journey)

/coming-soon/:feature                           Stub page for deferred features (§6)
```

- Non-consultant roles are dropped onto their scoped landing (e.g. Candidate → their own
  candidate detail; Org Admin → their org dashboard).
- Unknown / unauthorized routes → redirect to the role's home, never a dead end.

---

## 3. App shell (every authenticated screen)

```
┌──────────────┬─────────────────────────────────────────┐
│  Sidebar     │  Topbar: breadcrumb · org switch ·       │
│  (§8.1)      │          role switch · language toggle   │
│              ├─────────────────────────────────────────┤
│  Home        │                                          │
│  Orgs        │   <Outlet />  — the routed page          │
│  ───         │                                          │
│  Dashboard   │                                          │
│  Functions   │                                          │
│  Candidates  │                                          │
│  Reports     │  (soon)                                  │
└──────────────┴─────────────────────────────────────────┘
```

- **Sidebar**: global group always; org group appears when a `:orgId` is in the route.
  Active item uses the org accent color. Role-aware (Candidate/Viewer see less).
- **Topbar**: clickable breadcrumb derived from the URL; org switcher; **role switcher**
  (§2 — present inside the app); language toggle.
- Collapsible sidebar on mobile.

---

## 4. Screens

For each: what it shows, key actions, who can do them.

### 4.1 Login / role select  `/login`
- Branded welcome + a row of role cards (Consultant, Org Admin, HR Manager, Supervisor,
  Candidate, Viewer).
- Pick a role → seeded as the matching mock user → routed to that role's home.

### 4.2 Home  `/`
- **Consultant:** portfolio overview — all orgs, each with readiness rollup (# functions,
  # with a ready successor, risk flags). Click an org → its dashboard.
- **Org-scoped roles:** redirect to their org dashboard.
- **Candidate:** redirect to their own candidate detail.

### 4.3 Organizations list  `/organizations`  *(Consultant)*
- Cards/table of orgs: name, type (accent), sector, status, # critical functions, readiness.
- Actions: **New org**, open, edit.

### 4.4 Organization dashboard  `/organizations/:orgId`
- Header: org name, type, maturity, readiness rollup.
- **Critical functions summary**: list with status (vacant/in-progress/ready), priority,
  pool size, top candidate's readiness.
- Quick links to Functions and Candidates.
- "Coming soon" cards for deferred org analytics.

### 4.5 Org create / edit  `/organizations/new`, `/…/edit`  *(Consultant; Admin edits own)*
- Form: name, sector, type, language pref, description, contact info, status.

### 4.6 Critical functions list  `/organizations/:orgId/functions`
- All functions in the org: title, department, priority, status, pool size.
- Actions: **New function** (Consultant/Org Admin), open, edit.

### 4.7 Function detail  `/organizations/:orgId/functions/:fnId`  ⭐ core screen
- Header: title, department, priority, status, selected successor (if any).
- **Criteria panel**: the function's evaluation criteria + weights.
- **Candidate pool**: ranked table of candidates by readiness, with per-criterion scores.
  - Compare candidates side by side.
  - Actions: **Add candidate to pool** (Consultant/Org Admin/HR), **Select successor**
    (Consultant/Org Admin), open a candidate.

### 4.8 Function create / edit  `/…/functions/new`, `/…/functions/:fnId/edit`
- Form: title, department, priority.
- **Criteria editor**: pick from the recommended library (§4.1), set weights, add custom.

### 4.9 Candidates list  `/organizations/:orgId/candidates`
- All candidates in the org (across functions): name, current→target, function, readiness,
  status, supervisor.
- Supervisor sees only assigned; filterable.

### 4.10 Candidate detail  `/organizations/:orgId/candidates/:candId`  ⭐ core screen
- **Profile**: name, current/target position, department, supervisor, status.
- **Scores**: per-criterion scores (editable by Consultant/HR/assigned Supervisor),
  readiness gauge (auto-computed).
- **Journey**: 4 stages with task lists; mark tasks done; stage/overall progress.
- Candidate role sees all of this **read-only**.

### 4.11 Coming soon  `/coming-soon/:feature`
- Clean placeholder ("Coming soon" + one-line description, no decorative icons) for deferred features
  (§6): reflection logs, surveys, stage closure, AI insights/chatbot, auto-pilot/reports,
  value mirror. Keeps the nav complete without dead ends.

---

## 5. Finalized data model (`src/types.ts`)

```ts
export type Language = 'en' | 'ar';
export type InstitutionType = 'corporate' | 'government' | 'education' | 'charity';
export type UserRole =
  | 'CONSULTANT' | 'ORGANIZATION_ADMIN' | 'HR_MANAGER'
  | 'SUPERVISOR' | 'CANDIDATE' | 'VIEWER';

export type Priority = 'high' | 'medium' | 'low';
export type FunctionStatus = 'vacant' | 'in-progress' | 'ready';
export type CandidateStatus = 'active' | 'paused' | 'withdrawn' | 'selected';
export type TaskStatus = 'notStarted' | 'inProgress' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  organizationId?: string;   // scope for non-consultant roles
  candidateId?: string;      // for CANDIDATE role
}

export interface Organization {
  id: string;
  name: string;
  sector: string;
  type: InstitutionType;            // drives accent color + default stages
  languagePref: Language;
  maturityLevel: 'Emerging' | 'Maturing' | 'Advanced';
  status: 'active' | 'inactive';
  description?: string;
  contactInfo?: { email: string; phone: string; address: string };
  createdAt: string;
}

export interface Criterion {
  key: string;       // e.g. 'competence'
  label: string;
  weight: number;    // relative weight in the readiness average
}

export interface CriticalFunction {
  id: string;
  organizationId: string;
  title: string;
  department: string;
  priority: Priority;
  status: FunctionStatus;          // derived from pool readiness, see §6 logic
  criteria: Criterion[];           // what candidates are scored against
  selectedCandidateId?: string;    // chosen successor
}

export interface CriterionScore {
  criterionKey: string;
  value: number;                   // 0–100
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface JourneyStage {
  code: string;                    // 'STG1'…'STG4'
  name: string;
  tasks: Task[];
}

export interface Candidate {
  id: string;
  organizationId: string;
  criticalFunctionId: string;      // one function per candidate (§10.1)
  supervisorId?: string;           // for Supervisor scoping (§2.1)
  name: string;
  currentPosition: string;
  targetPosition: string;
  department: string;
  status: CandidateStatus;
  scores: CriterionScore[];        // against the function's criteria
  journey: JourneyStage[];
  // readiness is DERIVED, not stored — computed from scores + criteria weights
}

export interface AppState {
  users: User[];
  organizations: Organization[];
  functions: CriticalFunction[];
  candidates: Candidate[];
  session: { userId: string | null; activeRole: UserRole | null };
  ui: { language: Language };
}
```

**Derived (computed, never stored):**
- `readiness(candidate, fn)` = weighted average of `scores` by criterion `weight` (0–100).
- `functionStatus(fn, candidates)` = `vacant` if pool empty; `ready` if any candidate ≥
  threshold (default **85**); else `in-progress`.
- `orgReadiness(org)` = share of its functions that are `ready`.

> These live in a `lib/selectors` module with Vitest coverage — the spec's metric promises
> are honored here, in one place.

---

## 6. File / folder structure (new)

Build the new app under `src/`. Old top-level files stay until their replacement lands,
then get deleted (§7 phase 6).

```
src/
  main.tsx                 # entry; mounts <App/> with router + providers
  App.tsx                  # router + shell composition (thin)
  types.ts                 # the model above

  store/
    AppContext.tsx         # context + useReducer store
    reducer.ts             # actions: add/update org, function, candidate, score, task…
    seed.ts                # mock seed data (orgs, functions, candidates, users)
    storage.ts             # loadState/saveState — localStorage, versioned key (§9.1)

  lib/
    selectors.ts           # readiness, functionStatus, orgReadiness (+ tests)
    permissions.ts         # can(role, action, scope) (+ tests)
    i18n.ts                # t() dictionary + dir helper
    journey.ts             # default stages per org type

  shell/
    AppShell.tsx           # sidebar + topbar + <Outlet/>
    Sidebar.tsx
    Topbar.tsx
    Breadcrumb.tsx
    RoleSwitcher.tsx
    OrgSwitcher.tsx
    LanguageToggle.tsx

  routes/
    Login.tsx
    Home.tsx
    OrganizationsList.tsx
    OrganizationDashboard.tsx
    OrganizationForm.tsx
    FunctionsList.tsx
    FunctionDetail.tsx
    FunctionForm.tsx
    CandidatesList.tsx
    CandidateDetail.tsx
    ComingSoon.tsx

  ui/                      # presentational primitives (reuse current look)
    Card.tsx  Button.tsx  Badge.tsx  Gauge.tsx  ProgressBar.tsx
    Table.tsx  Modal.tsx  Select.tsx  Field.tsx
```

---

## 7. Phased build order (each phase = a browser-verifiable checkpoint)

**Phase 0 — Scaffold**
- Install `react-router-dom`. Set up `src/` entry, router, theme CSS vars, fonts, RTL.
- Empty shell (sidebar + topbar + outlet) renders.
- ✅ Verify: app loads, sidebar visible, routes switch, refresh keeps you on the page.

**Phase 1 — Store + persistence + seed**
- `AppContext`, reducer, `seed.ts`, `storage.ts` (versioned localStorage).
- ✅ Verify: edit something → refresh → change persists. Clear key → reseeds.

**Phase 2 — Org spine**
- Login/role-select, Home, Organizations list, Org dashboard, Org form.
- ✅ Verify: log in as each role → land correctly; create/edit an org; navigate with
  breadcrumb + Back, no dead ends.

**Phase 3 — Functions + candidate pool**
- Functions list/detail/form, criteria editor, pool table, add-to-pool, select successor.
- ✅ Verify: create a function with criteria; add candidates; see them ranked.

**Phase 4 — Candidate detail: scoring + journey + readiness**
- Candidate detail, per-criterion scoring, readiness gauge, 4-stage journey + tasks.
- ✅ Verify: change a score → readiness updates → function status flips to `ready` at
  threshold → org rollup updates.

**Phase 5 — Roles, permissions & coming-soon**
- Wire `permissions.ts` into UI (hide/disable per §2.1); ComingSoon stubs in nav.
- ✅ Verify: each role sees/does exactly what the matrix allows; Candidate is read-only;
  Supervisor sees only assigned candidates.

**Phase 6 — Cleanup**
- Delete old top-level components/services replaced by `src/`. Update `index.html` entry.
- ✅ Verify: build is clean, no dead imports, no orphaned old screens.

---

## 8. Out of scope (this build)

Everything in §6 "Coming soon" of the spec: reflection logs, surveys, stage closure /
signatures, AI insights & chatbot, auto-pilot / reports / archiving, value mirror, and the
old metric acronyms (BVI/LQM/CRI/AEI/ORLS-as-assessment). They render as stubs only.
