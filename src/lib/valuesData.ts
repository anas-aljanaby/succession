import type { Language } from '../types';

export type BehavioralIndicatorKey =
  | 'honesty'
  | 'respect'
  | 'innovation'
  | 'collaboration'
  | 'responsibility';

export type BehavioralIndicators = Record<BehavioralIndicatorKey, number>;

export interface ValueMirrorData {
  emoji: string;
  quote: string;
  feedback: string;
}

const BEHAVIORAL_BY_CANDIDATE: Record<string, BehavioralIndicators> = {
  'cand-khalid': { honesty: 70, respect: 80, innovation: 60, collaboration: 75, responsibility: 65 },
  'cand-sara': { honesty: 88, respect: 90, innovation: 85, collaboration: 92, responsibility: 88 },
  'cand-omar': { honesty: 88, respect: 90, innovation: 85, collaboration: 92, responsibility: 88 },
  'cand-layla': { honesty: 85, respect: 75, innovation: 65, collaboration: 80, responsibility: 90 },
  'cand-abdullatif': { honesty: 60, respect: 70, innovation: 50, collaboration: 65, responsibility: 55 },
};

const DEFAULT_BEHAVIORAL: BehavioralIndicators = {
  honesty: 65,
  respect: 70,
  innovation: 60,
  collaboration: 70,
  responsibility: 65,
};

const VALUE_MIRROR_BY_PROGRESS: Record<
  'high' | 'mid' | 'low',
  { en: ValueMirrorData; ar: ValueMirrorData }
> = {
  high: {
    en: {
      emoji: '🚀',
      quote: 'Momentum is building this week!',
      feedback: 'Your increased activity and positive reflections are driving great progress.',
    },
    ar: {
      emoji: '🚀',
      quote: 'الزخم يتزايد هذا الأسبوع!',
      feedback: 'نشاطك المتزايد وتأملاتك الإيجابية تدفع تقدمًا كبيرًا.',
    },
  },
  mid: {
    en: {
      emoji: '🌿',
      quote: 'A spirit of collaboration is growing.',
      feedback: 'Recent logs highlight strong teamwork and mutual support.',
    },
    ar: {
      emoji: '🌿',
      quote: 'روح التعاون تنمو.',
      feedback: 'السجلات الأخيرة تبرز العمل الجماعي القوي والدعم المتبادل.',
    },
  },
  low: {
    en: {
      emoji: '🌱',
      quote: 'Every step forward is progress.',
      feedback: 'Consistency is key. Keep engaging with your development journey.',
    },
    ar: {
      emoji: '🌱',
      quote: 'كل خطوة للأمام هي تقدم.',
      feedback: 'الاستمرارية هي المفتاح. استمر في التفاعل مع رحلة تطورك.',
    },
  },
};

export function behavioralIndicatorsFor(candidateId: string): BehavioralIndicators {
  return BEHAVIORAL_BY_CANDIDATE[candidateId] ?? DEFAULT_BEHAVIORAL;
}

export function valueMirrorFor(progress: number, language: Language): ValueMirrorData {
  const tier = progress >= 60 ? 'high' : progress >= 25 ? 'mid' : 'low';
  return VALUE_MIRROR_BY_PROGRESS[tier][language];
}
