import React, { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { can, canAccessOrg, visibleCandidatesForOrg } from '../lib/permissions';
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
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

const StatCard: React.FC<{
  label: string;
  value: number;
  valueClassName?: string;
}> = ({ label, value, valueClassName = 'text-white' }) => (
  <Card>
    <h3 className="text-sm font-medium text-gray-400">{label}</h3>
    <p className={`mt-2 text-3xl font-bold ${valueClassName}`}>{value}%</p>
  </Card>
);

const StatCardCount: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <Card>
    <h3 className="text-sm font-medium text-gray-400">{label}</h3>
    <p className="mt-2 text-3xl font-bold text-white">{value}</p>
  </Card>
);

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

  const meta = [
    org.sector,
    `${t('org.dashboard.maturityLevel')}: ${t(`maturity.${org.maturityLevel}`)}`,
  ];

  const openPlan = (row: (typeof planRows)[number]) => {
    if (row.topCandidate) {
      navigate(
        `/organizations/${org.id}/candidates/${row.topCandidate.id}`
      );
      return;
    }
    navigate(`/organizations/${org.id}/functions/${row.fn.id}`);
  };

  return (
    <section className="space-y-8">
      <PageHeader
        title={t('org.dashboard.title')}
        subtitle={`${org.name} · ${meta.join(' · ')}`}
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCardCount label={t('org.dashboard.kpiFunctions')} value={kpis.criticalFunctions} />
        <StatCardCount label={t('org.dashboard.kpiReady')} value={kpis.readySuccessors} />
        <StatCard label={t('org.dashboard.kpiAvgReadiness')} value={kpis.avgReadiness} />
        <StatCard label={t('org.dashboard.kpiOrls')} value={kpis.orlsScore} />
        <StatCard
          label={t('org.dashboard.kpiCri')}
          value={kpis.avgCri}
          valueClassName="text-red-400"
        />
        <StatCard
          label={t('org.dashboard.kpiAei')}
          value={kpis.avgAei}
          valueClassName="text-green-400"
        />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{t('candidates.title')}</h2>
            <p className="mt-1 text-sm text-gray-400">{t('org.dashboard.candidateOverview')}</p>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{candidateStats.total}</p>
              <p className="text-xs text-gray-400">{t('org.dashboard.candidatesTotal')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{candidateStats.active}</p>
              <p className="text-xs text-gray-400">{t('org.dashboard.candidatesActive')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{candidateStats.selected}</p>
              <p className="text-xs text-gray-400">{t('org.dashboard.candidatesSelected')}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate(`/organizations/${org.id}/candidates`)}>
            {t('org.dashboard.manageCandidates')}
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="text-base font-semibold text-white">{t('org.dashboard.improvementThemes')}</h2>
          {improvementThemes.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {improvementThemes.map((theme) => (
                <li key={theme.id} className="text-sm text-gray-300">
                  {theme.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 py-8 text-center text-sm text-gray-500">
              {t('org.dashboard.noData')}
            </p>
          )}
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-white">{t('org.dashboard.learningLoop')}</h2>
          <ul className="mt-4 space-y-3">
            {learningLoop.map((item) => (
              <li key={item.id} className="text-sm text-gray-300 leading-relaxed">
                {item.text}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-white">{t('org.dashboard.latestInsights')}</h2>
          <ul className="mt-4 space-y-3">
            {latestInsights.map((item) => (
              <li key={item.id} className="text-sm text-gray-300 leading-relaxed">
                {item.text}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">{t('org.dashboard.successionPlans')}</h2>
          <Button
            variant="secondary"
            className="!px-3 !py-1.5 text-xs"
            onClick={() => navigate(`/organizations/${org.id}/functions`)}
          >
            {t('org.viewAllFunctions')}
          </Button>
        </div>

        <Card className="!p-0 overflow-hidden">
          {planRows.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">{t('org.noFunctions')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="border-b border-gray-800 bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-400">
                      {t('org.dashboard.colFunction')}
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-400">
                      {t('org.dashboard.colCandidate')}
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-400 min-w-[12rem]">
                      {t('org.dashboard.colReadiness')}
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-400">
                      {t('org.dashboard.colActions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {planRows.map((row) => (
                    <tr key={row.fn.id} className="border-b border-gray-800 last:border-b-0">
                      <td className="px-4 py-3 text-white whitespace-nowrap">{row.fn.title}</td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {row.topCandidate?.name ?? t('org.dashboard.noCandidate')}
                      </td>
                      <td className="px-4 py-3">
                        <ProgressBar value={row.topReadiness} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Button
                          variant="secondary"
                          className="!px-3 !py-1.5 text-xs"
                          onClick={() => openPlan(row)}
                        >
                          {t('org.dashboard.viewPlan')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};
