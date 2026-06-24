import type { Language } from '../types';

type LocalizedText = Record<Language, string>;

export const organizationContent: Record<
  string,
  {
    name: LocalizedText;
    sector: LocalizedText;
    description: LocalizedText;
    contactInfo?: {
      address: LocalizedText;
    };
  }
> = {
  'org-acme': {
    name: { en: 'ACME Corporation', ar: 'شركة ACME' },
    sector: { en: 'Technology', ar: 'التكنولوجيا' },
    description: {
      en: 'A leading innovator in cloud solutions and enterprise software.',
      ar: 'رائدة في حلول السحابة والبرمجيات المؤسسية.',
    },
    contactInfo: {
      address: { en: '123 Tech Way, CA', ar: '123 Tech Way, CA' },
    },
  },
  'org-gda': {
    name: {
      en: 'General Data Authority',
      ar: 'الهيئة العامة للبيانات',
    },
    sector: { en: 'Government', ar: 'القطاع الحكومي' },
    description: {
      en: 'The government body responsible for regulating and managing national data.',
      ar: 'الجهة الحكومية المسؤولة عن تنظيم وإدارة البيانات الوطنية.',
    },
    contactInfo: {
      address: { en: 'King Fahd Road, Riyadh', ar: 'طريق الملك فهد، الرياض' },
    },
  },
  'org-mubarra': {
    name: { en: 'Al-Mutamayzeen Charity', ar: 'مبرة المتميزين' },
    sector: { en: 'Charity', ar: 'القطاع الخيري' },
    description: {
      en: 'A charitable foundation supporting distinguished and talented individuals.',
      ar: 'مبرة خيرية تهدف إلى دعم المتميزين والموهوبين.',
    },
    contactInfo: {
      address: { en: 'Kuwait City', ar: 'مدينة الكويت' },
    },
  },
};

export const functionContent: Record<
  string,
  { title: LocalizedText; department: LocalizedText }
> = {
  'fn-cto': {
    title: { en: 'Chief Technology Officer', ar: 'مدير التكنولوجيا' },
    department: { en: 'Technology', ar: 'التكنولوجيا' },
  },
  'fn-cmo': {
    title: { en: 'Chief Marketing Officer', ar: 'مدير التسويق' },
    department: { en: 'Marketing', ar: 'التسويق' },
  },
  'fn-vpe': {
    title: { en: 'VP of Engineering', ar: 'نائب رئيس الهندسة' },
    department: { en: 'Technology', ar: 'التكنولوجيا' },
  },
  'fn-strategy': {
    title: { en: 'Strategy Director', ar: 'مدير إدارة الاستراتيجية' },
    department: { en: 'Strategy', ar: 'الاستراتيجية' },
  },
  'fn-ceo-charity': {
    title: { en: 'Chief Executive Officer', ar: 'رئيس تنفيذي' },
    department: { en: 'Executive', ar: 'الإدارة التنفيذية' },
  },
};

export const candidateContent: Record<
  string,
  {
    name: LocalizedText;
    currentPosition: LocalizedText;
    targetPosition: LocalizedText;
    department: LocalizedText;
  }
> = {
  'cand-khalid': {
    name: { en: 'Khalid Al-Ghamdi', ar: 'خالد الغامدي' },
    currentPosition: { en: 'Senior Developer', ar: 'مطور أول' },
    targetPosition: { en: 'Chief Technology Officer', ar: 'مدير التكنولوجيا' },
    department: { en: 'Technology', ar: 'التكنولوجيا' },
  },
  'cand-sara': {
    name: { en: 'Sara Mansour', ar: 'سارة منصور' },
    currentPosition: { en: 'Engineering Lead', ar: 'قائدة الهندسة' },
    targetPosition: { en: 'Chief Technology Officer', ar: 'مدير التكنولوجيا' },
    department: { en: 'Technology', ar: 'التكنولوجيا' },
  },
  'cand-omar': {
    name: { en: 'Omar Abdullah', ar: 'عمر عبد الله' },
    currentPosition: { en: 'Marketing Manager', ar: 'مدير التسويق' },
    targetPosition: { en: 'Chief Marketing Officer', ar: 'مدير التسويق' },
    department: { en: 'Marketing', ar: 'التسويق' },
  },
  'cand-layla': {
    name: { en: 'Layla Al-Qahtani', ar: 'ليلى القحطاني' },
    currentPosition: { en: 'Senior Strategy Analyst', ar: 'محلل استراتيجي أول' },
    targetPosition: { en: 'Strategy Director', ar: 'مدير إدارة الاستراتيجية' },
    department: { en: 'Strategy', ar: 'الاستراتيجية' },
  },
  'cand-abdullatif': {
    name: { en: 'Abdullatif Al-Kandari', ar: 'عبد اللطيف الكندري' },
    currentPosition: { en: 'Project Manager', ar: 'مدير مشاريع' },
    targetPosition: { en: 'Chief Executive Officer', ar: 'رئيس تنفيذي' },
    department: { en: 'Executive', ar: 'الإدارة التنفيذية' },
  },
};

export const userContent: Record<string, { name: LocalizedText }> = {
  'u-consultant': { name: { en: 'Dana Al-Mutairi', ar: 'دانا المطيري' } },
  'u-admin': { name: { en: 'Ahmed Al-Fahad', ar: 'أحمد الفهد' } },
  'u-hr': { name: { en: 'Fatima Al-Marzouq', ar: 'فاطمة المرزوق' } },
  'u-sup': { name: { en: 'Nasser Al-Jasser', ar: 'ناصر الجاسر' } },
  'u-cand': { name: { en: 'Khalid Al-Ghamdi', ar: 'خالد الغامدي' } },
  'u-viewer': { name: { en: 'Samira Adel', ar: 'سميرة عادل' } },
};

export const notificationContent: Record<
  string,
  { title: LocalizedText; message: LocalizedText }
> = {
  'notif-1': {
    title: {
      en: 'Stage closure ready for review',
      ar: 'إغلاق المرحلة جاهز للمراجعة',
    },
    message: {
      en: 'Khalid Al-Ghamdi — Building & Development stage',
      ar: 'خالد الغامدي — مرحلة البناء والتطوير',
    },
  },
  'notif-2': {
    title: {
      en: 'Readiness threshold reached',
      ar: 'تم بلوغ عتبة الجاهزية',
    },
    message: {
      en: 'Sara Mansour is now at 88% for CTO',
      ar: 'سارة منصور عند 88% لمنصب مدير التكنولوجيا',
    },
  },
  'notif-3': {
    title: { en: 'Survey reminder', ar: 'تذكير بالاستبيان' },
    message: {
      en: 'Mid-stage evaluation due this week',
      ar: 'تقييم منتصف المرحلة مستحق هذا الأسبوع',
    },
  },
};

export function pickLocalized(
  text: LocalizedText | undefined,
  language: Language,
  fallback: string
): string {
  return text?.[language] ?? fallback;
}
