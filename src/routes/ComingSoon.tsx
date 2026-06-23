import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { COMING_SOON_FEATURES } from '../lib/comingSoonFeatures';
import { useLanguage } from '../lib/i18n';
import { Card } from '../ui/Card';

export const ComingSoon: React.FC = () => {
  const { t } = useLanguage();
  const { feature } = useParams();

  if (!feature) {
    return (
      <section>
        <h1 className="text-xl font-semibold text-white">{t('comingSoon.hubTitle')}</h1>
        <p className="mt-2 text-sm text-gray-400">{t('comingSoon.hubSubtitle')}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {COMING_SOON_FEATURES.map((item) => (
            <li key={item}>
              <Card to={`/coming-soon/${item}`}>
                <span className="font-medium text-gray-100">
                  {t(`comingSoon.feature.${item}`)}
                </span>
                <span className="mt-1 block text-xs text-gray-500">{t('nav.soon')}</span>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const featureLabel = t(`comingSoon.feature.${feature}`);

  return (
    <section className="flex flex-col items-center justify-center text-center py-24">
      <Link
        to="/coming-soon"
        className="mb-6 text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        {t('comingSoon.backToHub')}
      </Link>
      <h1 className="text-xl font-semibold text-white">{t('comingSoon.title')}</h1>
      <p className="mt-2 text-sm font-medium text-gray-200">{featureLabel}</p>
      <p className="mt-2 text-sm text-gray-400">{t('comingSoon.body')}</p>
    </section>
  );
};
