import React from 'react';
import { useLanguage } from '../lib/i18n';
import { Placeholder } from '../ui/Placeholder';

export const Home: React.FC = () => {
  const { t } = useLanguage();
  return <Placeholder title={t('home.title')} body={t('home.placeholder')} />;
};
