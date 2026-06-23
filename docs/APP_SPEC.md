# App Specification (Rebuild)

> **Status:** Draft v0.2 — core questions resolved with the user.
> Decisions are now settled; remaining **[ASSUMPTION]** tags are smaller details to confirm.

---

## 1. One-sentence summary

A tool for a **succession-planning consultant** to manage the organizations he advises,
the **critical functions** (key jobs) inside each organization, the **pool of candidates**
competing for each function, and each candidate's **development and readiness** for that job.

---

## 2. Who uses it (RESOLVED)

**Multi-user, role-based.** The login screen lists roles; a **role switcher** lets you move
between them. Roles carry through from the current app:

- **Consultant** — the primary user. Sees everything across all organizations.
- **Organization Admin** — manages their own organization.
- **HR Manager** — manages candidates / development within an org.
- **Supervisor** — oversees candidates.
- **Candidate** — sees their own development journey.
- **Viewer** — read-only.

> The consultant is still who the app is *designed around*, but the other roles log in and
> see role-appropriate views. Permissions stay.

**Role switcher appears in two places:**
- **At the start** — the login / welcome screen lets you pick which role to enter as.
- **Inside the app** — a persistent role switcher in the topbar lets you change role at any
  time without logging out (the sidebar, permissions, and visible data update to match).

### 2.1 Roles & permissions (RESOLVED)

Scope-wise: **Consultant** is cross-org; **Org Admin / HR Manager / Supervisor / Viewer** are
scoped to one organization; **Candidate** sees only themselves.

- **Org Admin** = structural owner: creates the org's critical functions, defines their
  criteria, and selects the successor. Does not score candidates.
- **HR Manager** = people operator: adds candidates to pools, scores them, and runs the
  development journey. Does not create functions or pick successors.
- **Supervisor** = scoped to the candidates **assigned to them** — scores and manages the
  journey for those candidates only (explicit candidate→supervisor assignment exists).
- **Candidate** = **read-only** view of their own profile, scores, and journey.
- **Viewer** = **read-only across the whole organization**.

| Capability | Consultant | Org Admin | HR Manager | Supervisor | Candidate | Viewer |
|---|---|---|---|---|---|---|
| **Scope** | All orgs | Own org | Own org | Own org | Self only | Own org |
| See all organizations | ✅ | — | — | — | — | — |
| Create/edit organizations | ✅ | edit own | — | — | — | — |
| Create/edit critical functions | ✅ | ✅ | — | — | — | view |
| Define a function's criteria/weights | ✅ | ✅ | — | — | — | view |
| Add candidates to a pool | ✅ | ✅ | ✅ | — | — | — |
| Score candidates | ✅ | — | ✅ | ✅ (assigned only) | — | — |
| Select the successor | ✅ | ✅ | — | — | — | — |
| Manage journey / mark tasks done | ✅ | ✅ | ✅ | ✅ (assigned only) | — | — |
| View a candidate's full profile | ✅ | ✅ | ✅ | assigned only | self only | ✅ |
| Switch roles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

> Implies a **candidate → supervisor assignment** in the data model (a candidate references
> their supervisor; a supervisor's views filter to their assigned candidates).

---

## 3. The core hierarchy (RESOLVED)

```
Consultant
  └── Organization            (a client he advises — e.g. "ACME Corp")
        └── Critical Function (a key job/mandate — e.g. "Implement legal strategy for X")
              ├── Evaluation Criteria   (the metrics candidates are scored against)
              └── Candidate Pool        (several candidates competing for this function)
                    └── Development & Readiness (scores against criteria + journey progress)
```

### 3.1 Organization
A client entity the consultant works with.
- Name, sector, type (corporate / government / education / charity), status.
- Contains a set of **critical functions**.
- Org "type" drives labels/theming and the default journey stages — not core behavior.

### 3.2 Critical Function
A **key job or mandate** inside an organization that needs a successor lined up.
Example: *"Implement legal strategy for X."*
- Belongs to one organization.
- Has a title, department, priority (high / medium / low).
- Defines its own **evaluation criteria** — the metrics candidates are measured against
  for *this specific job* (see §4).
- Has a **pool of candidates** competing for it.
- Has a **status**: `vacant` (no viable candidate), `in-progress` (candidates developing),
  `ready` (at least one candidate has met the bar).
- **[ASSUMPTION]** A function eventually resolves to **one chosen successor** from the pool,
  but until then it tracks *several* candidates side by side.

### 3.3 Candidate Pool (RESOLVED)
Each critical function has **multiple candidates** competing for it.
- A candidate is nominated/added to a function's pool.
- All candidates in the pool are scored against the **same** function-defined criteria,
  so the consultant can compare them directly (ranking / leaderboard per function).
- Over time candidates can be ruled out, and ultimately one is selected as the successor.

> **[ASSUMPTION]** A person could appear in more than one function's pool. Confirm if a
> candidate is unique to a single function or can be considered for several.

### 3.4 Candidate
A person in a function's pool.
- Profile: name, current position, target position, department, contact info.
- **Scores** against the function's evaluation criteria (§4).
- An overall **readiness score** (0–100%) derived from those criteria.
- A **development journey** (§5) of stages and tasks that moves their scores up.

---

## 4. Metrics & evaluation (RESOLVED — starter set)

The old app had six overlapping acronyms (LRI, ORLS, BVI, LQM, CRI, AEI). For the rebuild
we **start lean** and add more later if needed. The recommended starter model:

### 4.1 Per-function evaluation criteria
Each critical function defines **what qualities matter for that job** — a weighted list of
criteria. Default recommended set (editable per function):

| Criterion | What it measures |
|-----------|------------------|
| **Competence** | Technical / functional skill for the job |
| **Leadership** | Ability to lead people and decisions |
| **Strategic Thinking** | Vision, planning, judgment |
| **Values Alignment** | Fit with the organization's values |
| **Learning Agility** | Speed of growth / adaptability |

Each candidate gets a **0–100 score per criterion** for the function they're in.

### 4.2 Candidate readiness (headline number)
**Readiness = weighted average of the candidate's criterion scores** (0–100%).
This is the single number shown everywhere ("Khalid is 72% ready for CTO").

### 4.3 Organization readiness (rollup)
**Org readiness = share of critical functions that have at least one `ready` candidate.**
Simple, derived — no separate assessment to maintain. (Replaces ORLS for now.)

> **Dropped for now → "Coming soon":** BVI, LQM, CRI, AEI. They can return as advanced
> analytics once the core works.

---

## 5. The development journey (RESOLVED — kept, simplified)

Each candidate progresses through **4 stages** toward readiness:

1. **Assessment & Planning**
2. **Building & Development**
3. **Application & Evaluation**
4. **Sustainability & Improvement**

Each stage has **tasks/milestones** the candidate completes. Completing tasks advances the
journey and feeds the candidate's criterion scores → readiness. The 4 stages and their
default tasks vary by org type (corporate/government/education/charity).

The heavier machinery currently bolted onto the journey is **deferred** (see §6).

---

## 6. Feature scope (RESOLVED — my call)

### ✅ Build now (the core)
- Multi-org management (list, create, edit, open).
- Critical functions: full CRUD, priority, status, **evaluation criteria**.
- Candidate **pool per function**: add, compare, rank, select a successor.
- Candidate profiles + per-criterion scoring + readiness.
- 4-stage development journey with tasks.
- Org / function / candidate readiness rollups.
- Role-based login + role switcher + permissions.
- Bilingual **Arabic + English with RTL** (default Arabic).

### 🔜 "Coming soon" (stub the screen, don't build the logic)
These render a clean "Coming soon" placeholder so the nav stays complete:
- Reflection logs (candidate journaling).
- Surveys / evaluations.
- Stage closure with multi-party signatures.
- AI insights, recommendations & the AI chatbot/advisor.
- Auto-pilot mode, monthly reports, yearly archiving.
- Value Mirror / behavioral velocity tracking.

---

## 7. The consultant's main flows

1. **See all organizations** — dashboard of client orgs with readiness health (functions
   count, how many have a ready successor, risk flags).
2. **Open an organization** — see its critical functions and their status.
3. **Manage a critical function** — create/edit, set priority, define evaluation criteria.
4. **Manage the candidate pool** — add candidates, compare them on the function's criteria,
   see the ranking, eventually pick a successor.
5. **Open a candidate** — profile, criterion scores, readiness, journey progress.
6. **Track development** — move the candidate through stages, mark tasks done, watch
   readiness climb and criterion scores update.
7. **Know when a function is covered** — it flips to `ready` once a pool candidate hits the bar.

---

## 8. Navigation & layout (RESOLVED — full rework)

The current navigation is a top **header + horizontal tab strip + breadcrumb**, plus pages
buried inside buttons with **no way back** (you click into a screen and get stuck). We are
**rebuilding navigation from scratch.** The only thing kept from today's app is the **visual
theme** (see §8.4) — not the navigation structure.

### 8.1 Persistent left sidebar
A fixed **sidebar** is the primary navigation, always visible (collapsible on mobile). It
mirrors the hierarchy in §3 so you always know where you are and can jump levels:

```
┌────────────────────┬─────────────────────────────────┐
│  [Logo]            │  Topbar: breadcrumb · org switch │
│                    │          · role switch · lang    │
│  ▸ Home            ├─────────────────────────────────┤
│  ▸ Organizations   │                                  │
│                    │   Main content                   │
│  ── (when an org   │   (the current page)             │
│      is selected)  │                                  │
│  ▸ Dashboard       │                                  │
│  ▸ Critical Funcs  │                                  │
│  ▸ Candidates      │                                  │
│  🔜 Reports        │                                  │
└────────────────────┴─────────────────────────────────┘
```

- **Top group (global):** Home, Organizations — always available.
- **Org group (contextual):** appears once an organization is selected — Dashboard,
  Critical Functions, Candidates, plus "coming soon" items. Shows which org is active.
- The sidebar is **role-aware**: a Candidate sees only their own journey; a Viewer sees
  read-only entries.
- The active item is highlighted with the org's accent color.

### 8.2 Breadcrumb + always-reversible navigation
A **breadcrumb** in the topbar reflects the drill-down path and every crumb is clickable:

```
Organizations  ›  ACME Corp  ›  Critical Functions  ›  CTO  ›  Khalid Al-Ghamdi
```

**Hard rule:** there are **no dead ends.** Every screen can be left — via the breadcrumb,
the sidebar, or an explicit "Back" affordance. Deep screens (a candidate inside a function
inside an org) are reachable *and* exitable. Nothing is trapped inside a button.

### 8.3 Routing principle
- Navigation maps to **real, addressable routes** (URL reflects where you are), so Back /
  Forward / refresh / deep links all work — instead of today's in-memory `currentView`
  string with ad-hoc `window.appApi` jumps.
- One navigation source of truth. No parallel `setCurrentView` + `appApi` paths.

> **[ASSUMPTION]** We introduce a real router (URL-based). Confirm that's acceptable — it's
> the clean fix for "no going back," but it's a structural change from the current setup.

### 8.4 What we keep from the current look
- **Dark theme** (`bg-gray-900` surfaces, light text).
- **Per-org-type accent color:** corporate = indigo, government = blue, education = teal,
  charity = amber (CSS `--color-primary-*` variables, applied via `theme-{type}` class).
- **Fonts:** Inter (Latin) / Tajawal (Arabic), with RTL flip.
- General card / spacing / component aesthetic.

Everything else about layout and navigation is rebuilt.

---

## 9. Proposed data model (starter)

```
Organization
  id, name, sector, type, status, language_pref
  criticalFunctions: CriticalFunction[]

CriticalFunction
  id, organizationId, title, department, priority
  status: vacant | in-progress | ready
  criteria: Criterion[]          // what candidates are scored against (§4.1)
  candidateIds: string[]         // the pool competing for this function
  selectedCandidateId?           // chosen successor, once decided

Criterion
  key, label, weight             // weight feeds the readiness average

Candidate
  id, name, currentPosition, targetPosition, department
  organizationId, criticalFunctionId
  supervisorId?                  // for Supervisor-scoped access (§2.1)
  scores: { criterionKey: string, value: number }[]   // 0-100 per criterion
  readiness: number (0-100)      // derived: weighted avg of scores
  journey: Stage[]

Stage
  code, name, tasks: Task[]

Task
  id, title, status: notStarted | inProgress | completed
```

Anything in the current `types.ts` not represented here (and not in the "coming soon" list)
is a candidate for removal.

### 9.1 Persistence (no backend yet)

No backend is built for now. App state persists **client-side via `localStorage`**:

- On load, hydrate state from `localStorage`; if nothing is stored, fall back to the **mock
  seed data**. All edits (orgs, functions, candidates, scores, journey progress) survive
  refresh.
- **No reset button.** State simply persists. (To start clean during development, clear the
  storage key manually.)
- **Versioned storage key** (e.g. `blacksite.state.v1`). While the data shape is still
  changing, bumping the version discards stale saved state instead of crashing on a mismatch.
- Persistence sits behind a **tiny storage layer** (`loadState` / `saveState`). When a real
  backend is added later, that one module is swapped for API calls and the rest of the app is
  untouched.

---

## 10. Small confirmations (RESOLVED — my recommendation)

1. **Candidate uniqueness** → **Each candidate belongs to exactly one critical function**
   for v1. Simplest model, matches a clear "this person is being developed for this job."
   Multi-function consideration (one person in several pools) is a later enhancement.
2. **Criteria editing** → **Each function picks from a shared library of recommended criteria
   (§4.1) and sets weights, and may add custom criteria.** Gives consistency across functions
   while staying flexible per job.
3. **Who scores candidates** → **Scored manually** by the Consultant / HR Manager; the
   candidate's **readiness is auto-computed** as the weighted average of those scores (§4.2).
   Journey/task progress is shown alongside as context but does not silently overwrite scores.

---

## 11. Next step

All core decisions are now settled. The next artifact is a **screen-by-screen plan** (every
page, what it shows, how you navigate between them via the sidebar/breadcrumb from §8) plus
the **finalized TypeScript data model**, then we start building.
