import React from 'react';
import { useLanguage } from '../lib/i18n';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
      className="px-3 py-1.5 rounded-md text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
    >
      {t('topbar.language')}
    </button>
  );
};
