import React from 'react';
import { useLanguage } from '../lib/i18n';
import { PageHeader } from '../ui/PageHeader';

export const Settings: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section>
      <PageHeader title={t('nav.settings')} subtitle={t('settings.subtitle')} />
      <p className="text-sm text-gray-400">{t('settings.body')}</p>
    </section>
  );
};
