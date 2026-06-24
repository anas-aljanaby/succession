import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { can, canAccessOrg, visibleCandidatesForOrg } from '../lib/permissions';
import { orgReadiness } from '../lib/selectors';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { orgStatusTone } from '../ui/tone';

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
    <section className="mx-auto max-w-[1180px]">
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
        <p className="text-sm text-[var(--text-faint)]">{t('orgs.empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <Link
                key={org.id}
                to={`/organizations/${org.id}`}
                className="surface-card block p-5 transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-[var(--text)]">{org.name}</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {t(`type.${org.type}`)} · {org.sector}
                    </p>
                  </div>
                  <Pill tone={orgStatusTone(org.status)}>{t(`status.${org.status}`)}</Pill>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">
                    {fnCount} {t('orgs.functionsLabel')}
                  </span>
                  <span className="text-[var(--text-muted)]">
                    {t('orgs.readinessLabel')}: {readiness}%
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};
