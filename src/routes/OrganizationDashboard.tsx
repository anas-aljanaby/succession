import React from 'react';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { can, canAccessOrg, visibleCandidatesForOrg } from '../lib/permissions';
import { orgReadiness, functionStatusFor, candidatesForFunction } from '../lib/selectors';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge, statusColor, priorityColor } from '../ui/Badge';

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

  const fns = state.functions.filter((f) => f.organizationId === org.id);
  const visibleCandidates = visibleCandidatesForOrg(
    state.candidates,
    activeRole,
    activeUser,
    org.id
  );
  const readiness = orgReadiness(org.id, state.functions, visibleCandidates);
  const canEditOrg = can(activeRole, 'org.edit', { user: activeUser, orgId: org.id });

  const meta = [
    `${t(`type.${org.type}`)}`,
    org.sector,
    t(`maturity.${org.maturityLevel}`),
    `${t('orgs.readinessLabel')}: ${readiness}%`,
  ];

  return (
    <section>
      <PageHeader
        title={org.name}
        subtitle={meta.join(' · ')}
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

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          {t('org.functionsSummary')}
        </h2>
        <Link
          to={`/organizations/${org.id}/functions`}
          className="text-sm text-primary-400 hover:text-primary-300"
        >
          {t('org.viewAllFunctions')}
        </Link>
      </div>

      {fns.length === 0 ? (
        <p className="text-sm text-gray-400">{t('org.noFunctions')}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {fns.map((fn) => {
            const status = functionStatusFor(fn, visibleCandidates);
            const poolSize = candidatesForFunction(fn.id, visibleCandidates).length;
            return (
              <Card key={fn.id} to={`/organizations/${org.id}/functions/${fn.id}`}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-white">{fn.title}</h3>
                  <Badge label={t(`fnStatus.${status}`)} color={statusColor(status)} />
                </div>
                <p className="mt-1 text-sm text-gray-400">{fn.department}</p>
                <div className="mt-3 flex items-center gap-3 text-xs">
                  <Badge label={t(`priority.${fn.priority}`)} color={priorityColor(fn.priority)} />
                  <span className="text-gray-400">
                    {t('org.poolSize')}: {poolSize}
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
