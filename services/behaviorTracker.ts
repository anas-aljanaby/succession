import type { BehavioralIndicators, ReflectionLog, Language } from '../types';
import { valueKeywords } from '../constants';

const KEYWORD_SCORE_IMPACT = {
  positive: 3,
  neutral: 1,
  negative: -5,
};

/**
 * Updates behavioral indicator scores based on keywords found in recent reflection logs.
 * @param currentIndicators - The current set of behavioral scores for the candidate.
 * @param recentLogs - An array of reflection logs from the past week.
 * @param language - The current language for keyword matching.
 * @returns A new BehavioralIndicators object with updated scores.
 */
export const updateBehavioralIndicators = (
  currentIndicators: BehavioralIndicators,
  recentLogs: ReflectionLog[],
  language: Language
): BehavioralIndicators => {
  const newIndicators = { ...currentIndicators };
  const keywordsByLang = valueKeywords[language];

  // Map from behavioral indicator to keyword set
  const indicatorKeywordMap: Record<keyof BehavioralIndicators, { emoji: string; keywords: string[] } | undefined> = {
    honesty: keywordsByLang.honesty,
    respect: keywordsByLang.respect,
    innovation: keywordsByLang.innovation,
    collaboration: keywordsByLang.collaboration,
    responsibility: keywordsByLang.responsibility,
  };

  for (const log of recentLogs) {
    const note = log.note.toLowerCase();
    for (const key of Object.keys(indicatorKeywordMap) as Array<keyof BehavioralIndicators>) {
      const keywordData = indicatorKeywordMap[key];
      if (keywordData && keywordData.keywords.some(kw => note.includes(kw))) {
        const currentScore = newIndicators[key];
        const impact = KEYWORD_SCORE_IMPACT[log.sentiment];
        const newScore = Math.max(0, Math.min(100, currentScore + impact));
        newIndicators[key] = newScore;
      }
    }
  }
  return newIndicators;
};
