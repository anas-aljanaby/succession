import type { Organization, SuccessionPlan, ReflectionLog, Translations, LriAssessment } from '../types';
import { analyzeValuesFromReflections } from './valueAnalysisService';

const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

/**
 * Analyzes organizational data over the last 30 days and generates 3 actionable recommendations.
 * @returns An array of 3 recommendation strings.
 */
export const generateLearningLoopRecommendations = (
  org: Organization,
  plans: SuccessionPlan[],
  logs: ReflectionLog[],
  t: Translations
): string[] => {
  const recommendations: string[] = [];
  const recentLogs = logs.filter(log => new Date(log.timestamp) > THIRTY_DAYS_AGO);

  // 1. ORLS Check (High Priority)
  const orlsScores = Object.values(org.orlsAssessment) as number[];
  const orlsAverage = orlsScores.length > 0
    ? Math.round(orlsScores.reduce((sum, score) => sum + score, 0) / orlsScores.length)
    : 100; // Default to 100 if no assessment to avoid false trigger

  if (orlsAverage < 60) {
    recommendations.push(t.reco_orls_low);
  }

  // 2. LRI Check (High Priority)
  if (recommendations.length < 3) {
    const lowLriPlan = plans.find(p => p.readiness < 50);
    if (lowLriPlan) {
        recommendations.push(t.reco_lri_low.replace('{candidateName}', lowLriPlan.candidate.name));
    }
  }

  // 3. AEI Trend Check (High Priority)
  if (recommendations.length < 3) {
    // Only use reviewed reports and sort them by date to ensure correct order
    const reports = (org.monthly_reports || [])
        .filter(r => r.status === 'reviewed')
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
    if (reports.length >= 3) {
        const lastThreeReports = reports.slice(-3);
        const lastAei = lastThreeReports[2].summary_json.avgAei;
        const prevAei = lastThreeReports[1].summary_json.avgAei;
        const prevPrevAei = lastThreeReports[0].summary_json.avgAei;

        if (lastAei < prevAei && prevAei < prevPrevAei) {
            recommendations.push(t.reco_aei_decline);
        }
    }
  }

  // Analysis 4: Reflection Log Sentiment Trend
  if (recommendations.length < 3 && recentLogs.length > 2) {
      const positiveCount = recentLogs.filter(l => l.sentiment === 'positive').length;
      const negativeCount = recentLogs.filter(l => l.sentiment === 'negative').length;
      if (negativeCount > positiveCount) {
          recommendations.push(t.reco_sentiment_decline);
      }
  }

  // Analysis 5: LRI Score Stagnation
  if (recommendations.length < 3) {
      const stagnantCandidates: { name: string, dimension: keyof LriAssessment }[] = [];
      for (const plan of plans) {
          if (plan.previousLriAssessment) {
              let stagnantDimension: keyof LriAssessment | null = null;
              let minDiff = 2; // Only flag if change is less than 2%

              for (const key of Object.keys(plan.lriAssessment) as Array<keyof LriAssessment>) {
                  const current = plan.lriAssessment[key];
                  const previous = plan.previousLriAssessment[key];
                  if (current - previous < minDiff) {
                      stagnantDimension = key;
                      minDiff = current - previous;
                  }
              }
              if (stagnantDimension) {
                  stagnantCandidates.push({ name: plan.candidate.name, dimension: stagnantDimension });
              }
          }
      }

      if (stagnantCandidates.length > 0) {
          const mostCommonStagnantDim = stagnantCandidates[0].dimension; // Simplification
          recommendations.push(t.reco_lri_stagnant.replace('{dimension}', t[mostCommonStagnantDim]));
      }
  }

  // Analysis 6: Low Adoption & Engagement Index (AEI)
  if (recommendations.length < 3) {
      const lowAeiStages = org.stages.filter(s => s.aei && s.aei < 50).sort((a,b) => (a.aei || 0) - (b.aei || 0));
      if (lowAeiStages.length > 0) {
           recommendations.push(t.reco_low_aei.replace('{stageName}', lowAeiStages[0].name));
      }
  }
  
  // Analysis 7: Top values in action (if not many issues found)
   if (recommendations.length < 3) {
       const topValues = analyzeValuesFromReflections(recentLogs, org.language_pref);
       if (topValues.length > 0) {
           recommendations.push(t.reco_value_focus.replace('{value}', t[`value_${topValues[0].value}`]));
       }
   }

  // Fallback / Positive Reinforcement Recommendation
  while (recommendations.length < 3) {
      recommendations.push(t.reco_positive_trend);
  }
  
  return recommendations.slice(0, 3); // Ensure exactly 3 recommendations
};