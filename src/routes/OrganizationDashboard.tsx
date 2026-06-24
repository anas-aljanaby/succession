import React, { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { can, canAccessOrg, visibleCandidatesForOrg } from '../lib/permissions';
import { READY_THRESHOLD } from '../lib/criteria';
import {
  buildCandidateOverviewStats,
  buildFunctionPlanRows,
  buildImprovementThemes,
  buildLatestInsights,
  buildLearningLoopItems,
  buildOrgDashboardKpis,
} from '../lib/orgDashboardMetrics';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { Pill } from '../ui/Pill';
import { SectionLabel } from '../ui/SectionLabel';
import { toneText, type Tone } from '../ui/tone';
import { BriefcaseIcon } from '@/components/icons/BriefcaseIcon';
import { CheckBadgeIcon } from '@/components/icons/CheckBadgeIcon';
import { ExclamationTriangleIcon } from '@/components/icons/ExclamationTriangleIcon';
import { TrendingUpIcon } from '@/components/icons/TrendingUpIcon';
import { LightBulbIcon } from '@/components/icons/LightBulbIcon';
import { ArrowPathIcon } from '@/components/icons/ArrowPathIcon';
import { SparklesIcon } from '@/components/icons/SparklesIcon';

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: Tone;
  valueTone?: Tone;
  pill: { tone: Tone; text: string };
}> = ({ label, value, icon, tone, valueTone, pill }) => (
  <div className="surface-card flex flex-col gap-2.5 p-4">
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-medium text-[var(--text-muted)]">{label}</span>
      <Chip tone={tone}>{icon}</Chip>
    </div>
    <span className={`text-3xl font-bold leading-none ${valueTone ? toneText[valueTone] : 'text-[var(--text)]'}`}>
      {value}
    </span>
    <Pill tone={pill.tone}>{pill.text}</Pill>
  </div>
);

const ReadinessRing: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div className="relative h-[132px] w-[132px] shrink-0">
      <svg width="132" height="132" className="-rotate-90">
        <circle cx="66" cy="66" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="11" />
        <circle
          cx="66"
          cy="66"
          r={radius}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgb(var(--color-primary-500))" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="text-[30px] font-extrabold leading-none text-[var(--text)]">{value}%</span>
        <span className="mt-1 text-[11px] text-[var(--text-faint)]">{label}</span>
      </div>
    </div>
  );
};

const InsightCard: React.FC<{
  icon: React.ReactNode;
  tone: Tone;
  title: string;
  items: { id: string; text: string }[];
  empty: string;
}> = ({ icon, tone, title, items, empty }) => (
  <div className="surface-card p-5">
    <div className="mb-4 flex items-center gap-2.5">
      <Chip tone={tone}>{icon}</Chip>
      <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
    </div>
    {items.length > 0 ? (
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="flex gap-2.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="py-6 text-center text-sm text-[var(--text-faint)]">{empty}</p>
    )}
  </div>
);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

export const OrganizationDashboard: React.FC = () => {
  const { orgId } = useParams();
  const { state } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const activeRole = state.session.activeRole;
  const activeUser = state.users.find((user) => user.id === state.session.userId);
  const ownCandidate = activeUser?.candidateId
    ? state.candidates.find((candidate) => candidate.id === activeUser.candidateId)
    : undefined;

  const org = state.organizations.find((o) => o.id === orgId);
  if (!org) return <Navigate to="/organizations" replace />;
  if (activeRole === 'CANDIDATE' && ownCandidate) {
    return (
      <Navigate
        to={`/organizations/${ownCandidate.organizationId}/candidates/${ownCandidate.id}`}
        replace
      />
    );
  }
  if (!canAccessOrg(activeRole, { user: activeUser, orgId: org.id })) {
    return <Navigate to="/organizations" replace />;
  }

  const visibleCandidates = visibleCandidatesForOrg(
    state.candidates,
    activeRole,
    activeUser,
    org.id
  );
  const orgFunctions = state.functions.filter((fn) => fn.organizationId === org.id);
  const canEditOrg = can(activeRole, 'org.edit', { user: activeUser, orgId: org.id });

  const interpolate = (key: string, vars: Record<string, string>) => {
    let text = t(key);
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(`{${name}}`, value);
    }
    return text;
  };

  const kpis = useMemo(
    () => buildOrgDashboardKpis(org.id, state.functions, visibleCandidates),
    [org.id, state.functions, visibleCandidates]
  );
  const candidateStats = useMemo(
    () => buildCandidateOverviewStats(visibleCandidates),
    [visibleCandidates]
  );
  const planRows = useMemo(
    () => buildFunctionPlanRows(org.id, state.functions, visibleCandidates),
    [org.id, state.functions, visibleCandidates]
  );
  const learningLoop = useMemo(
    () => buildLearningLoopItems(visibleCandidates, orgFunctions, interpolate),
    [visibleCandidates, orgFunctions, t]
  );
  const latestInsights = useMemo(
    () => buildLatestInsights(planRows, interpolate),
    [planRows, t]
  );
  const improvementThemes = useMemo(
    () => buildImprovementThemes(visibleCandidates, orgFunctions, interpolate),
    [visibleCandidates, orgFunctions, t]
  );

  const openPlan = (row: (typeof planRows)[number]) => {
    if (row.topCandidate) {
      navigate(`/organizations/${org.id}/candidates/${row.topCandidate.id}`);
      return;
    }
    navigate(`/organizations/${org.id}/functions/${row.fn.id}`);
  };

  const total = candidateStats.total || 1;
  const activePct = (candidateStats.active / total) * 100;
  const selectedPct = (candidateStats.selected / total) * 100;

  const rowStatus = (row: (typeof planRows)[number]): { tone: Tone; key: string } => {
    if (!row.topCandidate) return { tone: 'bad', key: 'fnStatus.vacant' };
    if (row.topReadiness >= READY_THRESHOLD) return { tone: 'ok', key: 'fnStatus.ready' };
    return { tone: 'warn', key: 'fnStatus.in-progress' };
  };

  return (
    <section className="mx-auto max-w-[1180px]">
      <PageHeader
        title={t('org.dashboard.title')}
        subtitle={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--text)]">{org.name}</span>
            <span className="text-[var(--text-faint)]">·</span>
            <span>{org.sector}</span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--card-2)] px-2.5 py-0.5 text-xs">
              {t('org.dashboard.maturityLevel')}: {t(`maturity.${org.maturityLevel}`)}
            </span>
          </div>
        }
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => navigate(`/organizations/${org.id}/candidates`)}
            >
              {t('org.viewCandidates')}
            </Button>
            {canEditOrg ? (
              <Button onClick={() => navigate(`/organizations/${org.id}/edit`)}>
                {t('org.edit')}
              </Button>
            ) : null}
          </>
        }
      />

      <SectionLabel title={t('org.dashboard.overview')} />

      <div className="grid gap-4 lg:grid-cols-[1.05fr_1.55fr]">
        {/* Hero readiness */}
        <div className="surface-card relative flex items-center gap-5 overflow-hidden p-5">
          <span className="pointer-events-none absolute -end-16 -top-16 h-44 w-44 rounded-full bg-[var(--accent-soft)] blur-2xl" />
          <ReadinessRing value={kpis.avgReadiness} label={t('orgs.readinessLabel')} />
          <div className="relative">
            <h3 className="text-[15px] font-semibold text-[var(--text)]">
              {t('org.dashboard.kpiAvgReadiness')}
            </h3>
            <div className="mt-3 flex gap-6">
              <div>
                <div className="text-[11px] text-[var(--text-faint)]">{t('org.dashboard.kpiOrls')}</div>
                <div className="text-lg font-bold text-[var(--text)]">{kpis.orlsScore}%</div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--text-faint)]">{t('org.dashboard.kpiFunctions')}</div>
                <div className="text-lg font-bold text-[var(--text)]">{kpis.criticalFunctions}</div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--text-faint)]">{t('org.dashboard.kpiReady')}</div>
                <div className="text-lg font-bold text-[var(--ok)]">{kpis.readySuccessors}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label={t('org.dashboard.kpiFunctions')}
            value={String(kpis.criticalFunctions)}
            icon={<BriefcaseIcon />}
            tone="accent"
            pill={{ tone: 'accent', text: t('org.dashboard.successionPlans') }}
          />
          <StatCard
            label={t('org.dashboard.kpiReady')}
            value={String(kpis.readySuccessors)}
            icon={<CheckBadgeIcon />}
            tone="ok"
            pill={{ tone: 'ok', text: t('fnStatus.ready') }}
          />
          <StatCard
            label={t('org.dashboard.kpiCri')}
            value={`${kpis.avgCri}%`}
            icon={<ExclamationTriangleIcon />}
            tone="bad"
            valueTone="bad"
            pill={{ tone: 'bad', text: t('priority.high') }}
          />
          <StatCard
            label={t('org.dashboard.kpiAei')}
            value={`${kpis.avgAei}%`}
            icon={<TrendingUpIcon />}
            tone="ok"
            valueTone="ok"
            pill={{ tone: 'warn', text: t('priority.medium') }}
          />
        </div>
      </div>

      {/* Candidates overview band */}
      <div className="surface-card mt-4 flex flex-wrap items-center justify-between gap-6 p-5">
        <div className="min-w-[12rem]">
          <h3 className="text-base font-semibold text-[var(--text)]">{t('candidates.title')}</h3>
          <p className="mt-1 text-[13px] text-[var(--text-muted)]">{t('org.dashboard.candidateOverview')}</p>
          <div className="mt-3 flex h-2 w-56 overflow-hidden rounded-full bg-[var(--card-2)]">
            <span className="h-full bg-[var(--ok)]" style={{ width: `${activePct}%` }} />
            <span className="h-full bg-[var(--info)]" style={{ width: `${selectedPct}%` }} />
          </div>
        </div>
        <div className="flex gap-7 text-center">
          <div>
            <div className="text-2xl font-bold text-[var(--text)]">{candidateStats.total}</div>
            <div className="text-[11.5px] text-[var(--text-faint)]">{t('org.dashboard.candidatesTotal')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--ok)]">{candidateStats.active}</div>
            <div className="text-[11.5px] text-[var(--text-faint)]">{t('org.dashboard.candidatesActive')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--info)]">{candidateStats.selected}</div>
            <div className="text-[11.5px] text-[var(--text-faint)]">{t('org.dashboard.candidatesSelected')}</div>
          </div>
        </div>
        <Button variant="secondary" onClick={() => navigate(`/organizations/${org.id}/candidates`)}>
          {t('org.dashboard.manageCandidates')}
        </Button>
      </div>

      {/* Insights */}
      <SectionLabel title={t('org.dashboard.insights')} />
      <div className="grid gap-4 lg:grid-cols-3">
        <InsightCard
          icon={<LightBulbIcon />}
          tone="accent"
          title={t('org.dashboard.improvementThemes')}
          items={improvementThemes.map((theme) => ({ id: theme.id, text: theme.text }))}
          empty={t('org.dashboard.noData')}
        />
        <InsightCard
          icon={<ArrowPathIcon />}
          tone="ok"
          title={t('org.dashboard.learningLoop')}
          items={learningLoop}
          empty={t('org.dashboard.noData')}
        />
        <InsightCard
          icon={<SparklesIcon />}
          tone="info"
          title={t('org.dashboard.latestInsights')}
          items={latestInsights}
          empty={t('org.dashboard.noData')}
        />
      </div>

      {/* Succession plans */}
      <div className="mb-4 mt-8 flex flex-wrap items-center justify-between gap-3">
        <SectionLabel title={t('org.dashboard.successionPlans')} />
        <Button
          variant="secondary"
          className="!px-3 !py-1.5 text-xs"
          onClick={() => navigate(`/organizations/${org.id}/functions`)}
        >
          {t('org.viewAllFunctions')}
        </Button>
      </div>

      <div className="surface-card overflow-hidden">
        {planRows.length === 0 ? (
          <p className="p-6 text-sm text-[var(--text-muted)]">{t('org.noFunctions')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-[11.5px] font-semibold text-[var(--text-faint)]">
                    {t('org.dashboard.colFunction')}
                  </th>
                  <th className="px-4 py-3 text-[11.5px] font-semibold text-[var(--text-faint)]">
                    {t('org.dashboard.colCandidate')}
                  </th>
                  <th className="min-w-[14rem] px-4 py-3 text-[11.5px] font-semibold text-[var(--text-faint)]">
                    {t('org.dashboard.colReadiness')}
                  </th>
                  <th className="px-4 py-3 text-[11.5px] font-semibold text-[var(--text-faint)]">
                    {t('org.dashboard.colActions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {planRows.map((row) => {
                  const status = rowStatus(row);
                  return (
                    <tr
                      key={row.fn.id}
                      className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--card-2)]"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-[var(--text)]">
                        {row.fn.title}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {row.topCandidate ? (
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent-bright)]">
                              {initials(row.topCandidate.name)}
                            </span>
                          ) : (
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--card-2)] text-[var(--text-faint)]">
                              —
                            </span>
                          )}
                          <span className={row.topCandidate ? 'text-[var(--text)]' : 'text-[var(--text-faint)]'}>
                            {row.topCandidate?.name ?? t('org.dashboard.noCandidate')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--card-2)]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${row.topReadiness}%`,
                                background:
                                  status.tone === 'ok'
                                    ? 'linear-gradient(90deg, rgb(var(--color-primary-500)), rgb(var(--color-primary-400)))'
                                    : status.tone === 'warn'
                                      ? 'linear-gradient(90deg, #b45309, var(--warn))'
                                      : 'var(--card-3)',
                              }}
                            />
                          </div>
                          <span className="w-9 text-end text-[13px] font-semibold text-[var(--text)]">
                            {row.topReadiness}%
                          </span>
                          <Pill tone={status.tone}>{t(status.key)}</Pill>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <Button
                          variant="secondary"
                          className="!px-3 !py-1.5 text-xs"
                          onClick={() => openPlan(row)}
                        >
                          {t('org.dashboard.viewPlan')}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
