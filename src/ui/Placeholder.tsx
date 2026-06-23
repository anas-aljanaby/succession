import React from 'react';
import { useLanguage } from '../lib/i18n';

interface Props {
  title: string;
  body?: string;
}

// Generic placeholder used for screens not yet implemented in the current phase.
export const Placeholder: React.FC<Props> = ({ title, body }) => {
  const { t } = useLanguage();
  return (
    <section>
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <p className="mt-2 text-sm text-gray-400">{body ?? t('placeholder.body')}</p>
    </section>
  );
};
