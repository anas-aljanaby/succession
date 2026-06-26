import React, { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { operationalSettingsFor } from '../lib/orgSettingsData';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { can, canAccessOrg } from '../lib/permissions';
import { READY_THRESHOLD } from '../lib/criteria';
import { orgReadiness } from '../lib/selectors';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { orgStatusTone } from '../ui/tone';

const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <dt className="text-xs font-medium text-[var(--text-faint)]">{label}</dt>
    <dd className="mt-1 text-sm text-[var(--text)]">{value}</dd>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="surface-card p-5">
    <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
    {children}
  </div>
);

export const OrgSettings: React.FC = () => {
  const { orgId } = useParams();
  const { state } = useApp();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  if (!orgId) return <Navigate to="/settings" replace />;

  const activeRole = state.session.activeRole;
  const activeUser = state.users.find((user) => user.id === state.session.userId);

  const org = state.organizations.find((item) => item.id === orgId);
  if (!org) return <Navigate to="/organizations" replace />;
  if (!canAccessOrg(activeRole, { user: activeUser, orgId: org.id })) {
    return <Navigate to="/" replace />;
  }

  const canEdit = can(activeRole, 'org.edit', { user: activeUser, orgId: org.id });
  const ops = useMemo(() => operationalSettingsFor(org), [org]);

  const functionCount = state.functions.filter((fn) => fn.organizationId === org.id).length;
  const candidateCount = state.candidates.filter((c) => c.organizationId === org.id).length;
  const readiness = orgReadiness(org.id, state.functions, state.candidates);
  const createdLabel = new Date(org.createdAt).toLocaleDateString(
    language === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const boolLabel = (value: boolean) => (value ? t('settings.enabled') : t('settings.disabled'));

  return (
    <section className="mx-auto max-w-[1180px] space-y-6">
      <PageHeader
        title={t('nav.settings')}
        subtitle={
          <>
            <span className="text-[var(--text)]">{org.name}</span>
            <span className="text-[var(--text-faint)]"> · </span>
            <span>{t('settings.subtitle')}</span>
          </>
        }
        actions={
          canEdit ? (
            <Button variant="secondary" onClick={() => navigate(`/organizations/${org.id}/edit`)}>
              {t('settings.editOrg')}
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title={t('settings.profile')}>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Detail label={t('form.name')} value={org.name} />
            <Detail label={t('form.sector')} value={org.sector} />
            <Detail
              label={t('form.type')}
              value={t(`type.${org.type}`)}
            />
            <Detail
              label={t('form.maturity')}
              value={t(`maturity.${org.maturityLevel}`)}
            />
            <Detail
              label={t('form.status')}
              value={
                <Pill tone={orgStatusTone(org.status)}>
                  {t(`status.${org.status}`)}
                </Pill>
              }
            />
            <Detail label={t('settings.createdAt')} value={createdLabel} />
          </dl>
          {org.description ? (
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <Detail label={t('form.description')} value={org.description} />
            </div>
          ) : null}
        </Section>

        <Section title={t('settings.contact')}>
          <dl className="mt-4 grid gap-4">
            <Detail label={t('form.email')} value={org.contactInfo?.email ?? '—'} />
            <Detail label={t('form.phone')} value={org.contactInfo?.phone ?? '—'} />
            <Detail label={t('form.address')} value={org.contactInfo?.address ?? '—'} />
          </dl>
        </Section>

        <Section title={t('settings.succession')}>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Detail
              label={t('settings.defaultLanguage')}
              value={t(`lang.${org.languagePref}`)}
            />
            <Detail
              label={t('settings.journeyTemplate')}
              value={t(`type.${org.type}`)}
            />
            <Detail
              label={t('settings.readinessThreshold')}
              value={`${ops.readinessThreshold}%`}
            />
            <Detail label={t('settings.platformDefault')} value={`${READY_THRESHOLD}%`} />
            <Detail label={t('settings.functions')} value={String(functionCount)} />
            <Detail label={t('settings.candidates')} value={String(candidateCount)} />
            <Detail label={t('settings.orgReadiness')} value={`${readiness}%`} />
          </dl>
          <p className="mt-4 text-xs text-[var(--text-faint)]">{t('settings.successionHint')}</p>
        </Section>

        <Section title={t('settings.notifications')}>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Detail
              label={t('settings.emailDigest')}
              value={
                <Pill tone={ops.emailDigest ? 'ok' : 'info'}>
                  {boolLabel(ops.emailDigest)}
                </Pill>
              }
            />
            <Detail
              label={t('settings.stageReminders')}
              value={
                <Pill tone={ops.stageReminders ? 'ok' : 'info'}>
                  {boolLabel(ops.stageReminders)}
                </Pill>
              }
            />
            <Detail
              label={t('settings.consultantReview')}
              value={
                <Pill tone={ops.consultantReviewRequired ? 'warn' : 'info'}>
                  {boolLabel(ops.consultantReviewRequired)}
                </Pill>
              }
            />
          </dl>
          <p className="mt-4 text-xs text-[var(--text-faint)]">{t('settings.notificationsHint')}</p>
        </Section>
      </div>
    </section>
  );
};
