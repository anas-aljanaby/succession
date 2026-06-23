import React from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';

export const ComingSoon: React.FC = () => {
  const { t } = useLanguage();
  const { feature } = useParams();
  const featureLabel = feature ? t(`comingSoon.feature.${feature}`) : undefined;

  return (
    <section className="flex flex-col items-center justify-center text-center py-24">
      <h1 className="text-xl font-semibold text-white">{t('comingSoon.title')}</h1>
      {featureLabel ? (
        <p className="mt-2 text-sm font-medium text-gray-200">{featureLabel}</p>
      ) : null}
      <p className="mt-2 text-sm text-gray-400">{t('comingSoon.body')}</p>
    </section>
  );
};
