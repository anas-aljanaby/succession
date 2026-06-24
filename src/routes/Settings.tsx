import React from 'react';
import { useLanguage } from '../lib/i18n';
import { PageHeader } from '../ui/PageHeader';

export const Settings: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-[1180px]">
      <PageHeader title={t('nav.settings')} subtitle={t('settings.subtitle')} />
      <div className="surface-card p-5">
        <p className="text-sm text-[var(--text-faint)]">{t('settings.body')}</p>
      </div>
    </section>
  );
};
