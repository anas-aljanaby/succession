
import type { ReflectionLog, Language, ValueInsight } from '../types';
import { valueKeywords } from '../constants';

/**
 * Analyzes positive reflection logs to find and count keywords related to core values.
 * @returns An array of the top 3 value insights, sorted by count.
 */
export const analyzeValuesFromReflections = (
  allLogs: ReflectionLog[],
  language: Language
): ValueInsight[] => {
  const positiveLogs = allLogs.filter(log => log.sentiment === 'positive');
  if (positiveLogs.length === 0) return [];

  const valueCounts: { [key: string]: { count: number; emoji: string } } = {};
  const keywordsByLang = valueKeywords[language];

  // Initialize counts
  for (const value in keywordsByLang) {
    valueCounts[value] = { count: 0, emoji: keywordsByLang[value].emoji };
  }

  // Count keyword occurrences
  for (const log of positiveLogs) {
    const note = log.note.toLowerCase();
    for (const value in keywordsByLang) {
      if (keywordsByLang[value].keywords.some(kw => note.includes(kw))) {
        valueCounts[value].count++;
      }
    }
  }

  // Format and sort the results
  const results: ValueInsight[] = Object.entries(valueCounts)
    .map(([value, data]) => ({
      value: value,
      count: data.count,
      emoji: data.emoji,
    }))
    .sort((a, b) => b.count - a.count);

  return results.slice(0, 3);
};