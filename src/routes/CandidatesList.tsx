import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { canAccessOrg, visibleCandidatesForOrg } from '../lib/permissions';
import { computeReadiness } from '../lib/selectors';
import { Badge, candidateStatusColor } from '../ui/Badge';
import { Card } from '../ui/Card';
import { PageHeader } from '../ui/PageHeader';
import { ProgressBar } from '../ui/ProgressBar';

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
    <section>
      <PageHeader
        title={t('candidates.title')}
        subtitle={`${org.name} · ${t('candidates.subtitle')}`}
      />

      {candidates.length === 0 ? (
        <p className="text-sm text-gray-400">{t('candidates.empty')}</p>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gray-700 bg-gray-900/60">
                <tr>
                  <th className="px-2 py-3 text-start font-medium text-gray-300">
                    {t('functions.candidate')}
                  </th>
                  <th className="px-2 py-3 text-start font-medium text-gray-300">
                    {t('candidates.currentToTarget')}
                  </th>
                  <th className="px-2 py-3 text-start font-medium text-gray-300">
                    {t('candidates.function')}
                  </th>
                  <th className="px-2 py-3 text-start font-medium text-gray-300">
                    {t('functions.readiness')}
                  </th>
                  <th className="px-2 py-3 text-start font-medium text-gray-300">
                    {t('functions.status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(({ candidate, fn, readiness }) => (
                  <tr
                    key={candidate.id}
                    className="border-b border-gray-700/70 last:border-b-0 hover:bg-gray-800/40"
                  >
                    <td className="px-2 py-3 align-top">
                      <Link
                        to={`/organizations/${org.id}/candidates/${candidate.id}`}
                        className="font-medium text-white transition-colors hover:text-primary-300"
                      >
                        {candidate.name}
                      </Link>
                      <p className="mt-1 text-xs text-gray-400">{candidate.department}</p>
                    </td>
                    <td className="px-2 py-3 align-top text-gray-300">
                      {candidate.currentPosition}
                      <span className="mx-2 text-gray-600">{t('candidates.to')}</span>
                      {candidate.targetPosition}
                    </td>
                    <td className="px-2 py-3 align-top text-gray-300">
                      {fn ? fn.title : t('candidates.noFunction')}
                    </td>
                    <td className="min-w-36 px-2 py-3 align-top">
                      <ProgressBar value={readiness} />
                    </td>
                    <td className="px-2 py-3 align-top">
                      <Badge
                        label={t(`status.${candidate.status}`)}
                        color={candidateStatusColor(candidate.status)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </section>
  );
};
