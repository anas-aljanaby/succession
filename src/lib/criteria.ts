import type { Criterion } from '../types';

// Recommended starter criteria (spec §4.1). A function may keep these, reweight them,
// or add custom ones. Labels are stored as data so they can be edited per function.
export const DEFAULT_CRITERIA: Criterion[] = [
  { key: 'competence', label: 'Competence', weight: 1 },
  { key: 'leadership', label: 'Leadership', weight: 1 },
  { key: 'strategic_thinking', label: 'Strategic Thinking', weight: 1 },
  { key: 'values_alignment', label: 'Values Alignment', weight: 1 },
  { key: 'learning_agility', label: 'Learning Agility', weight: 1 },
];

export const READY_THRESHOLD = 85;
