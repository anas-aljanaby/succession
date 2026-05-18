import type { ReflectionLog, Language, Translations, ValueMirrorData } from '../types';
import { valueMirrorMessages, valueKeywords } from '../constants';

const RECENT_DAYS = 7;

/**
 * Generates qualitative feedback based on recent logs and BVI trend.
 * @returns A ValueMirrorData object with emoji, quote, and feedback.
 */
export const generateValueMirrorFeedback = (
  allLogs: ReflectionLog[],
  bviTrend: number,
  language: Language,
  t: Translations
): ValueMirrorData => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.setDate(now.getDate() - RECENT_DAYS));

  const recentLogs = allLogs.filter(log => new Date(log.timestamp) > sevenDaysAgo);

  // Rule 1: Strong positive momentum
  if (bviTrend > 5 && recentLogs.some(l => l.sentiment === 'positive')) {
    return language === 'ar' ? valueMirrorMessages.PROACTIVE_MOMENTUM.ar : valueMirrorMessages.PROACTIVE_MOMENTUM.en;
  }
  
  // Rule 2: Negative trend
  if (bviTrend < -5 || recentLogs.filter(l => l.sentiment === 'negative').length > 1) {
    return language === 'ar' ? valueMirrorMessages.NEGATIVE_TREND.ar : valueMirrorMessages.NEGATIVE_TREND.en;
  }

  // Rule 3: Check for collaboration keywords in positive logs
  const collaborationNote = recentLogs.find(l => 
    l.sentiment === 'positive' && (valueKeywords[language].collaboration.keywords.some(k => l.note.toLowerCase().includes(k)))
  );
  if (collaborationNote) {
    return language === 'ar' ? valueMirrorMessages.COLLABORATION_GROWTH.ar : valueMirrorMessages.COLLABORATION_GROWTH.en;
  }

  // Rule 4: Check for learning keywords in positive logs
  const learningNote = recentLogs.find(l =>
    l.sentiment === 'positive' && (valueKeywords[language].learning.keywords.some(k => l.note.toLowerCase().includes(k)))
  );
  if (learningNote) {
     return language === 'ar' ? valueMirrorMessages.LEARNING_AGILITY_UP.ar : valueMirrorMessages.LEARNING_AGILITY_UP.en;
  }

  // Default Rule: General encouragement
  return language === 'ar' ? valueMirrorMessages.DEFAULT_ENCOURAGEMENT.ar : valueMirrorMessages.DEFAULT_ENCOURAGEMENT.en;
};