import React from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { can, canAccessOrg, visibleCandidatesForOrg } from '../lib/permissions';
import { candidatesForFunction, functionStatusFor } from '../lib/selectors';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { functionStatusTone, priorityTone } from '../ui/tone';

export const FunctionsList: React.FC = () => {
  const { orgId } = useParams();
  const { state } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const activeRole = state.session.activeRole;
  const activeUser = state.users.find((user) => user.id === state.session.userId);

  const org = state.organizations.find((item) => item.id === orgId);
  if (!org) return <Navigate to="/organizations" replace />;
  if (!canAccessOrg(activeRole, { user: activeUser, orgId: org.id })) {
    return <Navigate to="/organizations" replace />;
  }

  const functions = state.functions.filter((fn) => fn.organizationId === org.id);
  const visibleCandidates = visibleCandidatesForOrg(
    state.candidates,
    activeRole,
    activeUser,
    org.id
  );
  const canCreateFunction = can(activeRole, 'fn.create', {
    user: activeUser,
    orgId: org.id,
  });

  return (
    <section className="mx-auto max-w-[1180px]">
      <PageHeader
        title={t('functions.title')}
        subtitle={
          <>
            <span className="text-[var(--text)]">{org.name}</span>
            <span className="text-[var(--text-faint)]"> · </span>
            <span>{t('functions.subtitle')}</span>
          </>
        }
        actions={
          canCreateFunction ? (
            <Button onClick={() => navigate(`/organizations/${org.id}/functions/new`)}>
              {t('functions.new')}
            </Button>
          ) : null
        }
      />

      {functions.length === 0 ? (
        <p className="text-sm text-[var(--text-faint)]">{t('functions.empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {functions.map((fn) => {
            const status = functionStatusFor(fn, visibleCandidates);
            const poolSize = candidatesForFunction(fn.id, visibleCandidates).length;

            return (
              <Link
                key={fn.id}
                to={`/organizations/${org.id}/functions/${fn.id}`}
                className="surface-card block p-5 transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-[var(--text)]">{fn.title}</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{fn.department}</p>
                  </div>
                  <Pill tone={functionStatusTone(status)}>{t(`fnStatus.${status}`)}</Pill>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <Pill tone={priorityTone(fn.priority)}>{t(`priority.${fn.priority}`)}</Pill>
                  <span className="text-[var(--text-muted)]">
                    {t('functions.poolSize')}: {poolSize}
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
