import React, { useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@/components/icons/ArrowLeftIcon';
import { LightBulbIcon } from '@/components/icons/LightBulbIcon';
import { AcademicCapIcon } from '@/components/icons/AcademicCapIcon';
import { orgInsightsContent } from '../lib/orgInsightsData';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { canAccessOrg } from '../lib/permissions';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { PageHeader } from '../ui/PageHeader';
import type { Tone } from '../ui/tone';

const InsightsPanel: React.FC<{
  icon: React.ReactNode;
  tone: Tone;
  title: string;
  items: string[];
  empty: string;
}> = ({ icon, tone, title, items, empty }) => (
  <div className="surface-card p-5">
    <div className="mb-4 flex items-center gap-2.5">
      <Chip tone={tone}>{icon}</Chip>
      <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
    </div>
    {items.length > 0 ? (
      <ul className="flex flex-col gap-3">
        {items.map((text, index) => (
          <li
            key={index}
            className="flex gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--card-2)] p-3 text-[13px] leading-relaxed text-[var(--text-muted)]"
          >
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="py-8 text-center text-sm text-[var(--text-faint)]">{empty}</p>
    )}
  </div>
);

export const OrgAiInsights: React.FC = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { state } = useApp();

  const activeRole = state.session.activeRole;
  const activeUser = state.users.find((user) => user.id === state.session.userId);

  const org = state.organizations.find((item) => item.id === orgId);
  if (!org) return <Navigate to="/organizations" replace />;
  if (!canAccessOrg(activeRole, { user: activeUser, orgId: org.id })) {
    return <Navigate to="/" replace />;
  }

  const { insights, recommendations } = useMemo(
    () => orgInsightsContent(org.id),
    [org.id]
  );

  return (
    <section className="mx-auto max-w-[1180px] space-y-6">
      <PageHeader
        title={t('aiInsights.title')}
        subtitle={
          <>
            <span className="text-[var(--text)]">{org.name}</span>
            <span className="text-[var(--text-faint)]"> · </span>
            <span>{t('aiInsights.subtitle')}</span>
          </>
        }
        actions={
          <Button variant="secondary" onClick={() => navigate(`/organizations/${org.id}`)}>
            <span className="inline-flex items-center gap-2">
              <ArrowLeftIcon />
              {t('aiInsights.backToDashboard')}
            </span>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <InsightsPanel
          icon={<LightBulbIcon />}
          tone="info"
          title={t('org.dashboard.latestInsights')}
          items={insights}
          empty={t('org.dashboard.noInsights')}
        />
        <InsightsPanel
          icon={<AcademicCapIcon />}
          tone="ok"
          title={t('org.dashboard.learningLoop')}
          items={recommendations}
          empty={t('aiInsights.noRecommendations')}
        />
      </div>
    </section>
  );
};

interface OrgPickerProps {
  organizations: { id: string; name: string }[];
}

export const OrgAiInsightsPicker: React.FC<OrgPickerProps> = ({ organizations }) => {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-[640px] space-y-6">
      <PageHeader title={t('aiInsights.title')} subtitle={t('aiInsights.pickOrg')} />
      <ul className="grid gap-3 sm:grid-cols-2">
        {organizations.map((org) => (
          <li key={org.id}>
            <Link
              to={`/organizations/${org.id}/ai-insights`}
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
