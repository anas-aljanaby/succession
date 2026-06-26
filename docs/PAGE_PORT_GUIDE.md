# Page port guide (legacy → `src/` app)

This document describes how to port remaining pages from the initial commit / `components/` into the router-based app under `src/`. Use it together with `docs/BUILD_PLAN.md`.

For each port task, the user will attach this file and give a one-line prompt naming the specific page to port.

---

## Hard rules for every page you port

1. **Do not build from scratch if a legacy page exists.** Find the original component in the initial commit (`9fbe438`) or current `components/`. Reuse its behavior and data shape; adapt to the new app model.
2. **Redesign UI to match the new design system.** Do not drop in old `components/common/Card` styling as-is. Use:
   - `surface-card`, design tokens (`var(--text)`, `var(--card-2)`, etc.)
   - `PageHeader`, `Button`, `Pill`, `Chip`, `ProgressBar`, `SectionLabel` from `src/ui/`
   - Match patterns in `src/routes/OrganizationDashboard.tsx`, `OrgAiInsights.tsx`, `OrgSettings.tsx`, `CandidateDetail.tsx`
3. **Org-scoped navigation.** Almost every page must live under `/organizations/:orgId/...`. Never use global routes like `/coming-soon/...` for real features — that drops org context and breaks the sidebar.
4. **Dedicated sidebar link.** Each ported page gets its **own `NavLink` in `src/shell/Sidebar.tsx`**, inside the org nav block (when `orgId && canUseOrgNav`). Do not bury live features under More unless they are genuinely stub-only.
5. **Keep org context.** When on an org page, the sidebar must still show: Dashboard, Functions, Candidates, AI Insights, More, Settings (plus any new item). The URL must include `/organizations/:orgId/...`.
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

**New data model** (`src/types.ts`): `Organization`, `CriticalFunction`, `Candidate` with derived readiness — **not** the old `SuccessionPlan`. When porting legacy pages, either:

- Adapt legacy UI to new types + seed data, **or**
- Create a thin adapter in `src/lib/*Data.ts` mapping new IDs to legacy mock data (see `orgInsightsData.ts`, `valuesData.ts`, `orgSettingsData.ts`).

**Org ID mapping (new → old mock):**

| New route ID | Old mock org id |
|---|---|
| `org-acme` | `1` |
| `org-gda` | `2` |
| `org-mubarra` | `4` |

---

## Already ported (do not redo)

| Feature | Route | Sidebar / access |
|---|---|---|
| Org dashboard | `/organizations/:orgId` | Dashboard |
| Functions CRUD | `/organizations/:orgId/functions/...` | Functions |
| Candidates CRUD | `/organizations/:orgId/candidates/...` | Candidates |
| Journey timeline preview | `/organizations/:orgId/candidates/:candId/journey-timeline` | Topbar calendar icon (candidate context) |
| Values dashboard | `/organizations/:orgId/candidates/:candId/values-dashboard` | Topbar diamond icon |
| AI insights | `/organizations/:orgId/ai-insights` | AI Insights |
| Settings | `/organizations/:orgId/settings` | Settings |
| More (stubs only) | `/organizations/:orgId/more` | More |

**Consultant fallbacks** (no org in URL): `/ai-insights`, `/settings` → org picker or redirect via `useResolvedOrgId()` in `src/lib/activeOrg.ts`.

**Legacy redirects:** `/coming-soon` → org-scoped More when org is known; `/coming-soon/ai-insights` → `/ai-insights`.

---

## Port queue (recommended order)

Port **one page per task**. After each port: add sidebar link, remove from More stubs if applicable.

### Tier 1 — best ROI, legacy UI exists

1. **Reflection logs** — `components/ReflectionLogView.tsx`, data: `mockReflectionLogs` in `constants.ts`
2. **Summary screen** — `components/SummaryScreen.tsx`
3. **Full values dashboard** — extend `CandidateValuesDashboard` with pieces from `components/ValuesDashboard.tsx`

### Tier 2 — journey chain (port in order)

4. **Journey monitor** — `components/JourneyMonitor.tsx`
5. **Stage detail** — `components/StageDetailScreen.tsx`
6. **Learning experience** — `components/LearningExperienceView.tsx`
7. **Stage closure** — `components/StageClosurePage.tsx` + `StageClosureDashboard.tsx`

### Tier 3 — org / consultant level

8. **Consultant dashboard** — `components/consultant/ConsultantDashboard.tsx`
9. **Stage dashboard** — `components/stage-dashboard/StageDashboard.tsx`
10. **Reports** — extract from `components/ConsultingHouseDashboard.tsx` + `services/reportingService.ts`

### Tier 4 — defer (heavy old model or modal-only)

- Surveys (`SurveyModal.tsx` — modal, not page)
- ORLS / LRI assessments, plan wizard, succession planner
- Full consulting house dashboard
- Wire real Gemini into AI chatbot (`components/AiChatbot.tsx` vs stub `AiChatbotPanel.tsx`)

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
      <div className="surface-card p-5">{/* content */}</div>
    </section>
  );
};
```

**Register route** in `src/App.tsx` (org-scoped).

**Add sidebar link** in `src/shell/Sidebar.tsx`:

```tsx
<NavLink to={`/organizations/${orgId}/your-route`} className={linkClass}>
  {t('nav.yourFeature')}
</NavLink>
```

**Add i18n** in `src/lib/i18n.tsx` — both `en` and `ar` blocks.

**Seed bilingual content** if the page shows demo text:

- Static labels → i18n keys
- Entity-specific demo copy → `contentCatalog.ts` or `src/lib/*Data.ts`
- If reusing legacy English-only strings from `constants.ts`, add Arabic equivalents

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

- `docs/BUILD_PLAN.md` — scope and data model
- `src/App.tsx` — routing
- `src/shell/Sidebar.tsx` — nav pattern
- `src/routes/OrgAiInsights.tsx` — legacy → new port example
- `src/routes/OrgSettings.tsx` — org-scoped page with placeholder data
- `src/routes/OrganizationDashboard.tsx` — design system reference
- `src/lib/contentCatalog.ts` — bilingual content pattern
- `src/lib/i18n.tsx` — translation keys
- `components/app/candidates/CandidateJourneyViews.tsx` — old journey view wiring
- Initial commit: `git show 9fbe438:App.tsx` — original view routing

---

## Work completed in prior sessions (context)

These ports were done before this guide was written:

- **Journey timeline preview** — `src/routes/CandidateJourneyTimeline.tsx`, topbar wired
- **Values dashboard** — `src/routes/CandidateValuesDashboard.tsx`, topbar wired
- **AI insights** — `src/routes/OrgAiInsights.tsx`, sidebar link, removed from More
- **Settings** — `src/routes/OrgSettings.tsx`, org-scoped, no legacy page existed (header alert only in init commit)
- **More hub** — org-scoped at `/organizations/:orgId/more`; stubs remain for reports, reflection-logs, surveys, stage-closure, value-mirror
