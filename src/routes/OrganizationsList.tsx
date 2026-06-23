import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { orgReadiness } from '../lib/selectors';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const OrganizationsList: React.FC = () => {
  const { state } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section>
      <PageHeader
        title={t('orgs.title')}
        subtitle={t('orgs.subtitle')}
        actions={
          <Button onClick={() => navigate('/organizations/new')}>{t('orgs.new')}</Button>
        }
      />

      {state.organizations.length === 0 ? (
        <p className="text-sm text-gray-400">{t('orgs.empty')}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.organizations.map((org) => {
            const fnCount = state.functions.filter(
              (f) => f.organizationId === org.id
            ).length;
            const readiness = orgReadiness(org.id, state.functions, state.candidates);
            return (
              <Card key={org.id} to={`/organizations/${org.id}`}>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-white">{org.name}</h2>
                  <Badge
                    label={t(`status.${org.status}`)}
                    color={org.status === 'active' ? 'green' : 'gray'}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  {t(`type.${org.type}`)} · {org.sector}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-400">
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
