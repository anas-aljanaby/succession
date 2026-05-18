import type { Organization, SuccessionPlan, MonthlyReport, ReportData } from '../types';

/**
 * Generates a monthly summary report for a single organization.
 * @param organization - The organization to generate the report for.
 * @param plans - All succession plans associated with the organization.
 * @returns A MonthlyReport object.
 */
export const generateMonthlyReport = (
  organization: Organization,
  plans: SuccessionPlan[]
): MonthlyReport => {
  // 1. Calculate average LRI
  const avgLri = plans.length > 0
    ? Math.round(plans.reduce((acc, p) => acc + p.readiness, 0) / plans.length)
    : 0;

  // 2. Calculate average ORLS
  const orlsScores = Object.values(organization.orlsAssessment) as number[];
  const orls = orlsScores.length > 0
    ? Math.round(orlsScores.reduce((sum, score) => sum + score, 0) / orlsScores.length)
    : 0;

  // 3. Calculate average AEI and CRI
  const stagesWithMetrics = organization.stages.filter(s => typeof s.cri === 'number' && typeof s.aei === 'number');
  const { avgCri, avgAei } = stagesWithMetrics.length > 0
    ? {
        avgCri: Math.round(stagesWithMetrics.reduce((acc, stage) => acc + stage.cri!, 0) / stagesWithMetrics.length),
        avgAei: Math.round(stagesWithMetrics.reduce((acc, stage) => acc + stage.aei!, 0) / stagesWithMetrics.length)
      }
    : { avgCri: 0, avgAei: 0 };
    
  // 4. Calculate average BVI
  const avgBvi = plans.length > 0
    ? Math.round(plans.reduce((acc, p) => acc + p.bvi, 0) / plans.length)
    : 0;

  // 5. Collect recent insights
  const insights = organization.insight_history || [];

  const reportData: ReportData = {
    avgLri,
    orls,
    avgAei,
    avgCri,
    avgBvi,
    insights,
  };

  const currentDate = new Date().toISOString();
  
  const report: MonthlyReport = {
    date: currentDate,
    summary_json: reportData,
    summary_pdf_link: `/reports/summary_${organization.id}_${currentDate.split('T')[0]}.pdf`, // Simulated link
    status: 'pending_review',
  };

  return report;
};
