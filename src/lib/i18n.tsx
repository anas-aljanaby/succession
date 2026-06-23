import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Language } from '../types';

type Dict = Record<string, string>;

const translations: Record<Language, Dict> = {
  en: {
    appName: 'Succession',
    'nav.home': 'Home',
    'nav.organizations': 'Organizations',
    'nav.dashboard': 'Dashboard',
    'nav.functions': 'Critical Functions',
    'nav.candidates': 'Candidates',
    'nav.reports': 'Reports',
    'nav.soon': 'soon',
    'topbar.switchRole': 'Role',
    'topbar.language': 'العربية',
    'role.CONSULTANT': 'Consultant',
    'role.ORGANIZATION_ADMIN': 'Organization Admin',
    'role.HR_MANAGER': 'HR Manager',
    'role.SUPERVISOR': 'Supervisor',
    'role.CANDIDATE': 'Candidate',
    'role.VIEWER': 'Viewer',
    'login.title': 'Leadership Succession',
    'login.subtitle': 'Choose a role to continue',
    'home.title': 'Home',
    'home.placeholder': 'Portfolio overview will appear here.',
    'comingSoon.title': 'Coming soon',
    'comingSoon.body': 'This area is not available yet.',
    'placeholder.body': 'This screen is being built.',
  },
  ar: {
    appName: 'التعاقب',
    'nav.home': 'الرئيسية',
    'nav.organizations': 'المؤسسات',
    'nav.dashboard': 'لوحة المعلومات',
    'nav.functions': 'الوظائف الحرجة',
    'nav.candidates': 'المرشحون',
    'nav.reports': 'التقارير',
    'nav.soon': 'قريباً',
    'topbar.switchRole': 'الدور',
    'topbar.language': 'English',
    'role.CONSULTANT': 'المستشار',
    'role.ORGANIZATION_ADMIN': 'مدير المؤسسة',
    'role.HR_MANAGER': 'مدير الموارد البشرية',
    'role.SUPERVISOR': 'المشرف',
    'role.CANDIDATE': 'المرشح',
    'role.VIEWER': 'مطّلع',
    'login.title': 'تعاقب القيادات',
    'login.subtitle': 'اختر دوراً للمتابعة',
    'home.title': 'الرئيسية',
    'home.placeholder': 'ستظهر نظرة عامة على المحفظة هنا.',
    'comingSoon.title': 'قريباً',
    'comingSoon.body': 'هذه الصفحة غير متاحة بعد.',
    'placeholder.body': 'هذه الصفحة قيد الإنشاء.',
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const t = (key: string) => translations[language][key] ?? key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
