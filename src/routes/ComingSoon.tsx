import React from 'react';
import { useLanguage } from '../lib/i18n';

export const ComingSoon: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section className="flex flex-col items-center justify-center text-center py-24">
      <h1 className="text-xl font-semibold text-white">{t('comingSoon.title')}</h1>
      <p className="mt-2 text-sm text-gray-400">{t('comingSoon.body')}</p>
    </section>
  );
};
