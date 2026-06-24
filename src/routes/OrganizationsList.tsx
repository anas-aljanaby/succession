import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { can, canAccessOrg, visibleCandidatesForOrg } from '../lib/permissions';
import { orgReadiness } from '../lib/selectors';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const OrganizationsList: React.FC = () => {
  const { state } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const activeRole = state.session.activeRole;
  const activeUser = state.users.find((user) => user.id === state.session.userId);
  const ownCandidate = activeUser?.candidateId
    ? state.candidates.find((candidate) => candidate.id === activeUser.candidateId)
    : undefined;
  const organizations = state.organizations.filter((org) =>
    canAccessOrg(activeRole, { user: activeUser, orgId: org.id })
  );

  if (activeRole === 'CANDIDATE' && ownCandidate) {
    return (
      <Navigate
        to={`/organizations/${ownCandidate.organizationId}/candidates/${ownCandidate.id}`}
        replace
      />
    );
  }

  return (
    <section>
      <PageHeader
        title={t('orgs.title')}
        subtitle={t('orgs.subtitle')}
        actions={
          can(activeRole, 'org.create', { user: activeUser }) ? (
            <Button onClick={() => navigate('/organizations/new')}>{t('orgs.new')}</Button>
          ) : null
        }
      />

      {organizations.length === 0 ? (
        <p className="text-sm text-gray-400">{t('orgs.empty')}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => {
            const fnCount = state.functions.filter(
              (f) => f.organizationId === org.id
            ).length;
            const visibleCandidates = visibleCandidatesForOrg(
              state.candidates,
              activeRole,
              activeUser,
              org.id
            );
            const readiness = orgReadiness(org.id, state.functions, visibleCandidates);
            return (
              <Card key={org.id} to={`/organizations/${org.id}`}>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-white">{org.name}</h2>
                  <Badge
                    label={t(`status.${org.status}`)}
                    color={org.status === 'active' ? 'green' : 'gray'}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-300">
                  {t(`type.${org.type}`)} · {org.sector}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-300">
                    {fnCount} {t('orgs.functionsLabel')}
                  </span>
                  <span className="text-gray-300">
                    {t('orgs.readinessLabel')}: {readiness}%
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};
