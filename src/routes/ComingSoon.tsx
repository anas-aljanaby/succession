import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { COMING_SOON_FEATURES } from '../lib/comingSoonFeatures';
import { useResolvedOrgId } from '../lib/activeOrg';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { canAccessOrg } from '../lib/permissions';
import { PageHeader } from '../ui/PageHeader';

export const ComingSoonLegacyRedirect: React.FC = () => {
  const { feature } = useParams();
  const orgId = useResolvedOrgId();

  if (!orgId) return <Navigate to="/" replace />;

  const target = feature
    ? `/organizations/${orgId}/more/${feature}`
    : `/organizations/${orgId}/more`;

  return <Navigate to={target} replace />;
};

export const ComingSoon: React.FC = () => {
  const { orgId, feature } = useParams();
  const { t } = useLanguage();
  const { state } = useApp();

  const activeRole = state.session.activeRole;
  const activeUser = state.users.find((user) => user.id === state.session.userId);
  const org = state.organizations.find((item) => item.id === orgId);

  if (!org) return <Navigate to="/organizations" replace />;
  if (!canAccessOrg(activeRole, { user: activeUser, orgId: org.id })) {
    return <Navigate to="/" replace />;
  }

  const moreBase = `/organizations/${org.id}/more`;

  if (!feature) {
    return (
      <section className="mx-auto max-w-[1180px] space-y-6">
        <PageHeader
          title={t('comingSoon.hubTitle')}
          subtitle={
            <>
              <span className="text-[var(--text)]">{org.name}</span>
              <span className="text-[var(--text-faint)]"> · </span>
              <span>{t('comingSoon.hubSubtitle')}</span>
            </>
          }
        />
        <ul className="grid gap-3 sm:grid-cols-2">
          {COMING_SOON_FEATURES.map((item) => (
            <li key={item}>
              <Link
                to={`${moreBase}/${item}`}
                className="surface-card block p-4 transition-colors hover:border-[var(--border-strong)]"
              >
                <span className="font-medium text-[var(--text)]">
                  {t(`comingSoon.feature.${item}`)}
                </span>
                <span className="mt-1 block text-xs text-[var(--text-faint)]">{t('nav.soon')}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const featureLabel = t(`comingSoon.feature.${feature}`);

  return (
    <section className="mx-auto max-w-[640px] space-y-6 py-12 text-center">
      <Link
        to={moreBase}
        className="text-sm text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
      >
        {t('comingSoon.backToHub')}
      </Link>
      <PageHeader title={t('comingSoon.title')} subtitle={featureLabel} />
      <p className="text-sm text-[var(--text-muted)]">{t('comingSoon.body')}</p>
    </section>
  );
};
