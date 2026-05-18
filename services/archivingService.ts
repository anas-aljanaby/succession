import type { Organization, SuccessionPlan, Translations } from '../types';

/**
 * Generates a yearly summary insight string for an organization.
 * @param organization - The organization to generate the report for.
 * @param plans - All succession plans associated with the organization.
 * @param t - The translation object.
 * @returns A formatted summary string.
 */
export const generateYearlySummary = (
  organization: Organization,
  plans: SuccessionPlan[],
  t: Translations
): string => {
  // 1. Calculate average LRI
  const avgLri = plans.length > 0
    ? Math.round(plans.reduce((acc, p) => acc + p.readiness, 0) / plans.length)
    : 0;

  // 2. Calculate average BVI
  const avgBvi = plans.length > 0
    ? Math.round(plans.reduce((acc, p) => acc + p.bvi, 0) / plans.length)
    : 0;

  // 3. Calculate ORLS score
  const orlsScores = Object.values(organization.orlsAssessment) as number[];
  const orlsScore = orlsScores.length > 0
    ? Math.round(orlsScores.reduce((sum, score) => sum + score, 0) / orlsScores.length)
    : 0;

  // 4. Count completed plans
  const completedPlans = plans.filter(p => p.journey.every(m => m.status === 'Completed')).length;

  const currentYear = new Date().getFullYear();

  return t.insight_yearly_summary
    .replace('{year}', currentYear.toString())
    .replace('{avgLri}', avgLri.toString())
    .replace('{avgBvi}', avgBvi.toString())
    .replace('{orlsScore}', orlsScore.toString())
    .replace('{completedPlans}', completedPlans.toString());
};