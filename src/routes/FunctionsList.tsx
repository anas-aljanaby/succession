import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { candidatesForFunction, functionStatusFor } from '../lib/selectors';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge, priorityColor, statusColor } from '../ui/Badge';

export const FunctionsList: React.FC = () => {
  const { orgId } = useParams();
  const { state } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const org = state.organizations.find((item) => item.id === orgId);
  if (!org) return <Navigate to="/organizations" replace />;

  const functions = state.functions.filter((fn) => fn.organizationId === org.id);

  return (
    <section>
      <PageHeader
        title={t('functions.title')}
        subtitle={`${org.name} · ${t('functions.subtitle')}`}
        actions={
          <Button onClick={() => navigate(`/organizations/${org.id}/functions/new`)}>
            {t('functions.new')}
          </Button>
        }
      />

      {functions.length === 0 ? (
        <p className="text-sm text-gray-400">{t('functions.empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {functions.map((fn) => {
            const status = functionStatusFor(fn, state.candidates);
            const poolSize = candidatesForFunction(fn.id, state.candidates).length;

            return (
              <Card key={fn.id} to={`/organizations/${org.id}/functions/${fn.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-white">{fn.title}</h2>
                    <p className="mt-1 text-sm text-gray-400">{fn.department}</p>
                  </div>
                  <Badge label={t(`fnStatus.${status}`)} color={statusColor(status)} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <Badge
                    label={t(`priority.${fn.priority}`)}
                    color={priorityColor(fn.priority)}
                  />
                  <span className="text-gray-400">
                    {t('functions.poolSize')}: {poolSize}
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
