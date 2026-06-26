# Legacy page port guide

Handoff reference for porting pages from the initial commit (`9fbe438`) and `components/` into the router-based app under `src/`.

Also read **`docs/BUILD_PLAN.md`** for target architecture and data model.

---

## Hard rules for every page you port

1. **Do not build from scratch if a legacy page exists.** Find the original component in the initial commit or current `components/`. Reuse its behavior and data shape; adapt to the new app model.
2. **Redesign UI to match the new design system.** Do not drop in old `components/common/Card` styling as-is. Use:
   - `surface-card`, design tokens (`var(--text)`, `var(--card-2)`, etc.)
   - `PageHeader`, `Button`, `Pill`, `Chip`, `ProgressBar`, `SectionLabel` from `src/ui/`
   - Match patterns in `src/routes/OrganizationDashboard.tsx`, `OrgAiInsights.tsx`, `OrgSettings.tsx`, `CandidateDetail.tsx`
3. **Org-scoped navigation.** Almost every page must live under `/organizations/:orgId/...`. Never use global routes like `/coming-soon/...` for real features — that drops org context and breaks the sidebar.
4. **Dedicated sidebar link.** Each ported page gets its **own `NavLink` in `src/shell/Sidebar.tsx`**, inside the org nav block (when `orgId && canUseOrgNav`). Do not bury live features under More unless they are genuinely stub-only.
5. **Keep org context.** When on an org page, the sidebar must still show: Dashboard, Functions, Candidates, AI Insights, More, Settings (plus any new items). The URL must include `/organizations/:orgId/...`.
6. **Bilingual support (EN + AR).**
   - All user-facing strings → `src/lib/i18n.tsx` with keys in **both** `en` and `ar`.
   - Seed/demo content → bilingual via `src/lib/contentCatalog.ts` and/or `src/lib/localizeState.ts` (pattern: `{ en: '...', ar: '...' }` + `pickLocalized()`).
   - Journey/stage text → `src/lib/journey.ts` templates per `InstitutionType` × language.
   - Do not hardcode English-only placeholder text.
7. **Permissions.** Gate with `canAccessOrg`, `can()` from `src/lib/permissions.ts`. Match existing routes.
8. **Breadcrumb.** Add segment labels in `src/shell/Breadcrumb.tsx`.
9. **Surgical changes.** Touch only what the port requires. No unrelated refactors.
10. **Verify.** Run `npm run build`. Browser-check the page keeps org sidebar and renders in AR + EN.

---

## Architecture quick reference

| Layer | Location |
|---|---|
| Router entry | `src/App.tsx` |
| Routes | `src/routes/*.tsx` |
| Shell | `src/shell/` (Sidebar, Topbar, Breadcrumb) |
| State | `src/store/` (AppContext, reducer, seed.ts) |
| Types (new model) | `src/types.ts` |
| i18n | `src/lib/i18n.tsx` + `useLanguage()` |
| Bilingual seed | `src/store/seed.ts` + `src/lib/contentCatalog.ts` + `applyLanguageToState()` |
| Legacy components | `components/` (old app, still present) |
| Legacy mock data | `constants.ts` (old `SuccessionPlan`, `mockReflectionLogs`, etc.) |

### New vs old data model

The new app (`src/types.ts`) uses `Organization`, `CriticalFunction`, and `Candidate` with **derived readiness** — not the old `SuccessionPlan`.

When porting legacy pages, either:

- Adapt legacy UI to new types + seed data, **or**
- Create a thin adapter in `src/lib/*Data.ts` mapping new IDs to legacy mock data (see `orgInsightsData.ts`, `valuesData.ts`, `orgSettingsData.ts`).

### Org ID mapping (new → old mock)

| New route ID | Old mock org id |
|---|---|
| `org-acme` | `1` |
| `org-gda` | `2` |
| `org-mubarra` | `4` |

### Consultant fallbacks (no org in URL)

- `/ai-insights` → org picker or redirect via `useResolvedOrgId()` in `src/lib/activeOrg.ts`
- `/settings` → same pattern via `SettingsLegacyRedirect`

---

## Already ported (do not redo)

| Feature | Route | Sidebar / entry |
|---|---|---|
| Org dashboard | `/organizations/:orgId` | Dashboard |
| Functions CRUD | `/organizations/:orgId/functions/...` | Functions |
| Candidates CRUD | `/organizations/:orgId/candidates/...` | Candidates |
| Journey timeline preview | `/organizations/:orgId/candidates/:candId/journey-timeline` | Topbar calendar icon (candidate context) |
| Values dashboard | `/organizations/:orgId/candidates/:candId/values-dashboard` | Topbar diamond icon |
| AI insights | `/organizations/:orgId/ai-insights` | AI Insights |
| Settings | `/organizations/:orgId/settings` | Settings |
| More (stubs only) | `/organizations/:orgId/more` | More |

---

## Port queue (recommended order)

Port **one page per task**. After each port:

- Remove the feature from More stubs if applicable (`src/lib/comingSoonFeatures.ts`)
- Add a dedicated sidebar link in `src/shell/Sidebar.tsx`

### Tier 1 — best ROI, legacy UI exists

| # | Page | Legacy source | Suggested route | Sidebar label |
|---|---|---|---|---|
| 1 | Reflection logs | `components/ReflectionLogView.tsx`, `mockReflectionLogs` in `constants.ts` | `/organizations/:orgId/reflection-logs` | Reflection logs |
| 2 | Summary screen | `components/SummaryScreen.tsx` | `/organizations/:orgId/candidates/:candId/summary` | Optional (link from candidate journey) |
| 3 | Full values dashboard | Extend `CandidateValuesDashboard` using `components/ValuesDashboard.tsx` | existing values route | Topbar icon (extend in place) |

### Tier 2 — journey chain (port in order)

| # | Page | Legacy source |
|---|---|---|
| 4 | Journey monitor | `components/JourneyMonitor.tsx` |
| 5 | Stage detail | `components/StageDetailScreen.tsx` |
| 6 | Learning experience | `components/LearningExperienceView.tsx` |
| 7 | Stage closure | `components/StageClosurePage.tsx`, `components/StageClosureDashboard.tsx` |

### Tier 3 — org / consultant level

| # | Page | Legacy source |
|---|---|---|
| 8 | Consultant dashboard | `components/consultant/ConsultantDashboard.tsx` |
| 9 | Stage dashboard | `components/stage-dashboard/StageDashboard.tsx` |
| 10 | Reports | `components/ConsultingHouseDashboard.tsx`, `services/reportingService.ts` |

### Tier 4 — defer (heavy old model or modal-only)

- **Surveys** — `SurveyModal.tsx` (modal, not a page)
- **ORLS / LRI assessments**, plan wizard, succession planner
- **Full consulting house dashboard**
- **Real Gemini AI chatbot** — `components/AiChatbot.tsx` vs stub `src/shell/AiChatbotPanel.tsx`
- **Value mirror** as separate page — already partially on values dashboard

---

## UI pattern to follow

```tsx
// src/routes/ExamplePage.tsx
export const ExamplePage: React.FC = () => {
  const { orgId } = useParams();
  const { t } = useLanguage();
  const { state } = useApp();
  // access check → Navigate if denied

  return (
    <section className="mx-auto max-w-[1180px] space-y-6">
      <PageHeader
        title={t('example.title')}
        subtitle={
          <>
            <span className="text-[var(--text)]">{org.name}</span>
            <span className="text-[var(--text-faint)]"> · </span>
            <span>{t('example.subtitle')}</span>
          </>
        }
        actions={/* optional Button */}
      />
      <div className="surface-card p-5">
        {/* content using var(--text-muted), Pill, Chip, etc. */}
      </div>
    </section>
  );
};
```

### Wiring checklist (every port)

1. **Route** — register in `src/App.tsx` under `/organizations/:orgId/...`
2. **Sidebar** — add `NavLink` in `src/shell/Sidebar.tsx` inside the org nav block
3. **i18n** — add keys in `src/lib/i18n.tsx` (both `en` and `ar`)
4. **Seed / demo content** — bilingual via `contentCatalog.ts`, `seed.ts`, or `src/lib/*Data.ts`
5. **Breadcrumb** — segment label in `src/shell/Breadcrumb.tsx`
6. **Permissions** — `canAccessOrg` / `can()` guards
7. **Topbar icons** — if candidate-scoped, wire in `src/shell/Topbar.tsx` with `hasJourneyContext`

---

## Bilingual content patterns

### UI labels → i18n

```tsx
// src/lib/i18n.tsx — both en and ar blocks
'feature.title': 'Feature title',
'feature.title': 'عنوان الميزة',
```

### Entity-specific demo copy → contentCatalog

```tsx
// src/lib/contentCatalog.ts
export const exampleContent: Record<string, { title: LocalizedText }> = {
  'org-acme': {
    title: { en: 'English text', ar: 'النص العربي' },
  },
};
```

Use `pickLocalized(content.title, language, fallback)` via `applyLanguageToState()` or in the route.

### Journey / stage templates

`src/lib/journey.ts` — `JOURNEY_TEMPLATES` per `InstitutionType` × `Language`.

### Legacy English-only data

If reusing strings from `constants.ts`, add Arabic equivalents in `contentCatalog.ts` or dedicated i18n keys. Never ship English-only demo text.

---

## Definition of done (per page)

- [ ] Route works under `/organizations/:orgId/...`
- [ ] Sidebar link added; org nav stays visible on the page
- [ ] UI uses new design tokens / `surface-card` (not legacy Card styling)
- [ ] All strings in `i18n.tsx` (EN + AR)
- [ ] Demo/seed content displays correctly in both languages (toggle language in topbar)
- [ ] Breadcrumb label added
- [ ] Permissions checked
- [ ] `npm run build` passes
- [ ] Removed from More stubs if it was listed there

---

## Key files to read before starting

| File | Why |
|---|---|
| `docs/BUILD_PLAN.md` | Scope, data model, phased plan |
| `src/App.tsx` | Routing |
| `src/shell/Sidebar.tsx` | Nav pattern |
| `src/routes/OrgAiInsights.tsx` | Legacy → new port example |
| `src/routes/OrgSettings.tsx` | Org-scoped page with placeholder data |
| `src/routes/OrganizationDashboard.tsx` | Design system reference |
| `src/lib/contentCatalog.ts` | Bilingual content pattern |
| `src/lib/i18n.tsx` | Translation keys |
| `src/lib/activeOrg.ts` | Org context helpers |
| `components/app/candidates/CandidateJourneyViews.tsx` | Old journey view wiring |
| `git show 9fbe438:App.tsx` | Original view routing |

---

## Legacy view map (initial commit)

For locating original behavior:

| Old `currentView` | Legacy component |
|---|---|
| `dashboard` | `components/Dashboard.tsx` |
| `monitor` | `components/JourneyMonitor.tsx` |
| `journey-timeline-preview` | `components/JourneyTimelinePreview.tsx` |
| `values-dashboard` | `components/ValuesDashboard.tsx` |
| `stage-detail-screen` | `components/StageDetailScreen.tsx` |
| `stage-dashboard` | `components/stage-dashboard/StageDashboard.tsx` |
| `summary-screen` | `components/SummaryScreen.tsx` |
| `candidate-plan` | `components/CandidatePlanView.tsx` |
| `learning-experience` | `components/LearningExperienceView.tsx` |
| `stage-closure` | `components/StageClosurePage.tsx` |
| `consultant-dashboard` | `components/consultant/ConsultantDashboard.tsx` |
| `consulting-house-dashboard` | `components/ConsultingHouseDashboard.tsx` |
| `candidates-management` | `components/candidates/CandidatesManagement.tsx` |
| `planner` | `components/SuccessionPlanner.tsx` |
| `plan-creation-wizard` | `components/plan-flow/PlanCreationWizard.tsx` |

Navigation types: `lib/navigation/types.ts`

---

## More hub (remaining stubs)

Current stubs in `src/lib/comingSoonFeatures.ts`:

- `reports`
- `reflection-logs`
- `surveys`
- `stage-closure`
- `value-mirror`

Route pattern: `/organizations/:orgId/more/:feature`

When a stub becomes a real page, remove it from `COMING_SOON_FEATURES`, add a sidebar link, and optionally redirect the old more URL to the new route.
