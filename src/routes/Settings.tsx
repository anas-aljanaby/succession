import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAccessibleOrganizations, useResolvedOrgId } from '../lib/activeOrg';
import { useLanguage } from '../lib/i18n';
import { PageHeader } from '../ui/PageHeader';

export const SettingsLegacyRedirect: React.FC = () => {
  const orgId = useResolvedOrgId();
  const accessibleOrgs = useAccessibleOrganizations();

  if (!orgId) {
    return <OrgSettingsPicker organizations={accessibleOrgs} />;
  }

  return <Navigate to={`/organizations/${orgId}/settings`} replace />;
};

interface OrgPickerProps {
  organizations: { id: string; name: string }[];
}

export const OrgSettingsPicker: React.FC<OrgPickerProps> = ({ organizations }) => {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-[640px] space-y-6">
      <PageHeader title={t('nav.settings')} subtitle={t('settings.pickOrg')} />
      <ul className="grid gap-3 sm:grid-cols-2">
        {organizations.map((org) => (
          <li key={org.id}>
            <Link
              to={`/organizations/${org.id}/settings`}
              className="surface-card block p-4 transition-colors hover:border-[var(--border-strong)]"
            >
              <span className="font-medium text-[var(--text)]">{org.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/" className="text-sm text-[var(--text-faint)] hover:text-[var(--text-muted)]">
        {t('nav.home')}
      </Link>
    </section>
  );
};
