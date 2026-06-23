import type { Language } from '../types';
import { useApp } from '../store/AppContext';

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

interface LanguageApi {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

// Language lives in the app store (so it persists). This hook is the stable read/write
// surface used across the UI.
export const useLanguage = (): LanguageApi => {
  const { state, dispatch } = useApp();
  const language = state.ui.language;
  return {
    language,
    setLanguage: (lang) => dispatch({ type: 'SET_LANGUAGE', language: lang }),
    t: (key) => translations[language][key] ?? key,
    dir: language === 'ar' ? 'rtl' : 'ltr',
  };
};
