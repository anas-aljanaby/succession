

import React from 'react';
import type { Language } from '../../types';

interface LanguageSwitcherProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, setLanguage }) => {
  return (
    <div className="flex items-center space-x-1 rtl:space-x-reverse border border-gray-600 rounded-lg p-1">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${language === 'en' ? 'bg-primary-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        aria-label="Switch to English"
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('ar')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${language === 'ar' ? 'bg-primary-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        aria-label="Switch to Arabic"
        aria-pressed={language === 'ar'}
      >
        AR
      </button>
    </div>
  );
};