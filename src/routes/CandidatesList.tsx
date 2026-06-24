import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { canAccessOrg, visibleCandidatesForOrg } from '../lib/permissions';
import { computeReadiness } from '../lib/selectors';
import { PageHeader } from '../ui/PageHeader';
import { Pill } from '../ui/Pill';
import { ProgressBar } from '../ui/ProgressBar';
import { candidateStatusTone } from '../ui/tone';

export const CandidatesList: React.FC = () => {
  const { orgId } = useParams();
  const { state } = useApp();
  const { t, locale } = useLanguage();
  const activeRole = state.session.activeRole;
  const activeUser = state.users.find((user) => user.id === state.session.userId);
  const ownCandidate = activeUser?.candidateId
    ? state.candidates.find((candidate) => candidate.id === activeUser.candidateId)
    : undefined;

  const org = state.organizations.find((item) => item.id === orgId);
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

  const functionsById = new Map(state.functions.map((fn) => [fn.id, fn]));
  const candidates = visibleCandidatesForOrg(
    state.candidates,
    activeRole,
    activeUser,
    org.id
  )
    .map((candidate) => {
      const fn = functionsById.get(candidate.criticalFunctionId);
      return {
        candidate,
        fn,
        readiness: fn ? computeReadiness(candidate, fn) : 0,
      };
    })
    .sort((a, b) => a.candidate.name.localeCompare(b.candidate.name, locale));

  return (
    <section className="mx-auto max-w-[1180px]">
      <PageHeader
        title={t('candidates.title')}
        subtitle={
          <>
            <span className="text-[var(--text)]">{org.name}</span>
            <span className="text-[var(--text-faint)]"> · </span>
            <span>{t('candidates.subtitle')}</span>
          </>
        }
      />

      {candidates.length === 0 ? (
        <p className="text-sm text-[var(--text-faint)]">{t('candidates.empty')}</p>
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-[11.5px] font-semibold text-[var(--text-faint)]">
                    {t('functions.candidate')}
                  </th>
                  <th className="px-4 py-3 text-[11.5px] font-semibold text-[var(--text-faint)]">
                    {t('candidates.currentToTarget')}
                  </th>
                  <th className="px-4 py-3 text-[11.5px] font-semibold text-[var(--text-faint)]">
                    {t('candidates.function')}
                  </th>
                  <th className="min-w-[14rem] px-4 py-3 text-[11.5px] font-semibold text-[var(--text-faint)]">
                    {t('functions.readiness')}
                  </th>
                  <th className="px-4 py-3 text-[11.5px] font-semibold text-[var(--text-faint)]">
                    {t('functions.status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(({ candidate, fn, readiness }) => (
                  <tr
                    key={candidate.id}
                    className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--card-2)]"
                  >
                    <td className="px-4 py-3.5 align-top">
                      <Link
                        to={`/organizations/${org.id}/candidates/${candidate.id}`}
                        className="font-medium text-[var(--text)] transition-colors hover:text-[var(--accent-bright)]"
                      >
                        {candidate.name}
                      </Link>
                      <p className="mt-1 text-xs text-[var(--text-faint)]">{candidate.department}</p>
                    </td>
                    <td className="px-4 py-3.5 align-top text-[var(--text-muted)]">
                      {candidate.currentPosition}
                      <span className="mx-2 text-[var(--text-faint)]">{t('candidates.to')}</span>
                      {candidate.targetPosition}
                    </td>
                    <td className="px-4 py-3.5 align-top text-[var(--text-muted)]">
                      {fn ? fn.title : t('candidates.noFunction')}
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <ProgressBar value={readiness} />
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <Pill tone={candidateStatusTone(candidate.status)}>
                        {t(`status.${candidate.status}`)}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
