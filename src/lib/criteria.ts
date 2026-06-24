import type { Criterion, Language } from '../types';

const CRITERION_LABELS: Record<string, Record<Language, string>> = {
  competence: { en: 'Competence', ar: 'الكفاءة' },
  leadership: { en: 'Leadership', ar: 'القيادة' },
  strategic_thinking: { en: 'Strategic Thinking', ar: 'التفكير الاستراتيجي' },
  values_alignment: { en: 'Values Alignment', ar: 'التوافق مع القيم' },
  learning_agility: { en: 'Learning Agility', ar: 'مرونة التعلم' },
};

export const criterionLabel = (key: string, language: Language): string =>
  CRITERION_LABELS[key]?.[language] ?? key;

export const DEFAULT_CRITERIA: Criterion[] = [
  { key: 'competence', label: 'Competence', weight: 1 },
  { key: 'leadership', label: 'Leadership', weight: 1 },
  { key: 'strategic_thinking', label: 'Strategic Thinking', weight: 1 },
  { key: 'values_alignment', label: 'Values Alignment', weight: 1 },
  { key: 'learning_agility', label: 'Learning Agility', weight: 1 },
];

export const localizeCriteria = (criteria: Criterion[], language: Language): Criterion[] =>
  criteria.map((criterion) => ({
    ...criterion,
    label: criterionLabel(criterion.key, language),
  }));

export const READY_THRESHOLD = 85;
