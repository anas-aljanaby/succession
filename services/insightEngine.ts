import type { SuccessionPlan, Organization, Translations, LriAssessment, SuccessionJourneyStage, ReflectionLog } from '../types';
import { generateOrgLevelInsightSummary } from './geminiService';

const SIGNIFICANT_LRI_IMPROVEMENT = 5; // A 5% increase is considered significant
const READINESS_THRESHOLDS = [50, 75, 90];

/**
 * Generates an insight if a significant change is detected between two versions of a succession plan.
 * @returns A formatted insight string or null if no significant change is found.
 */
export const generatePlanInsights = (
  previousPlan: SuccessionPlan,
  currentPlan: SuccessionPlan,
  organization: Organization,
  t: Translations
): string | null => {
  // 1. Check for stage completion
  for (const stage of organization.stages) {
    const prevMilestones = previousPlan.journey.filter(m => m.stageCode === stage.code);
    const currentMilestones = currentPlan.journey.filter(m => m.stageCode === stage.code);
    
    if (currentMilestones.length === 0) continue;

    // Fix: Changed 'm.completed' to 'm.status === "Completed"' to match JourneyMilestone type.
    const wasComplete = prevMilestones.every(m => m.status === 'Completed');
    const isNowComplete = currentMilestones.every(m => m.status === 'Completed');

    if (!wasComplete && isNowComplete) {
      return t.insight_stage_completed
        .replace('{candidateName}', currentPlan.candidate.name)
        .replace('{stageName}', stage.name);
    }
  }

  // 2. Check for significant LRI dimension improvement
  for (const key of Object.keys(currentPlan.lriAssessment) as Array<keyof LriAssessment>) {
    const prevScore = previousPlan.lriAssessment[key];
    const currentScore = currentPlan.lriAssessment[key];
    const change = currentScore - prevScore;

    if (change >= SIGNIFICANT_LRI_IMPROVEMENT) {
      return t.insight_lri_improvement
        .replace('{candidateName}', currentPlan.candidate.name)
        .replace('{change}', change.toString())
        .replace('{dimension}', t[key]);
    }
  }

  // 3. Check for readiness threshold milestones
  for (const threshold of READINESS_THRESHOLDS) {
    if (previousPlan.readiness < threshold && currentPlan.readiness >= threshold) {
      return t.insight_readiness_milestone
        .replace('{candidateName}', currentPlan.candidate.name)
        .replace('{roleTitle}', currentPlan.roleTitle)
        .replace('{readiness}', currentPlan.readiness.toString());
    }
  }

  // 4. Check for LQM change from reflections
  if (previousPlan.lqm !== currentPlan.lqm) {
    return t.insight_lqm_update
      .replace('{candidateName}', currentPlan.candidate.name)
      .replace('{lqm}', currentPlan.lqm.toString());
  }

  return null;
};


/**
 * Generates an insight if a significant change is detected between two versions of an organization's settings.
 * @returns A formatted insight string or null if no significant change is found.
 */
export const generateOrgInsights = (
  previousOrg: Organization,
  currentOrg: Organization,
  t: Translations
): string | null => {
  // Check for CRI/AEI updates
  for (const currentStage of currentOrg.stages) {
    const previousStage = previousOrg.stages.find(s => s.code === currentStage.code);
    if (!previousStage) continue;

    if (currentStage.cri !== previousStage.cri) {
      return t.insight_cri_update
        .replace('{stageName}', currentStage.name)
        .replace('{value}', currentStage.cri?.toString() || '0');
    }

    if (currentStage.aei !== previousStage.aei) {
      return t.insight_aei_update
        .replace('{stageName}', currentStage.name)
        .replace('{value}', currentStage.aei?.toString() || '0');
    }
  }

  return null;
};

/**
 * Simulates a daily background job to analyze reflection logs and generate insights.
 * @returns A promise that resolves to an array of updated Organization objects.
 */
export const runDailyAnalysis = async (
  allLogs: ReflectionLog[],
  allOrganizations: Organization[],
  t: Translations
): Promise<Organization[]> => {
  console.log("Running daily analysis background job simulation...");

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentLogs = allLogs.filter(log => new Date(log.timestamp) > twentyFourHoursAgo);

  if (recentLogs.length === 0) {
    console.log("No recent logs to analyze.");
    return [];
  }

  const logsByOrg = recentLogs.reduce((acc, log) => {
    if (!acc.has(log.org_id)) {
      acc.set(log.org_id, []);
    }
    acc.get(log.org_id)!.push(log);
    return acc;
  }, new Map<number, ReflectionLog[]>());

  const updatedOrganizations: Organization[] = [];
  const orgMap = new Map(allOrganizations.map(org => [org.id, org]));

  for (const [orgId, logs] of logsByOrg.entries()) {
    const organization = orgMap.get(orgId);
    if (!organization) continue;

    const notes = logs.map(l => l.note);
    const summary = await generateOrgLevelInsightSummary(notes, organization.name, organization.language_pref);
    
    const insight = t.insight_daily_summary.replace('{summary}', summary);

    const updatedOrg = {
      ...organization,
      insight_history: [insight, ...(organization.insight_history || [])].slice(0, 10)
    };
    updatedOrganizations.push(updatedOrg);
  }

  console.log(`Daily analysis complete. Generated insights for ${updatedOrganizations.length} organizations.`);
  return updatedOrganizations;
};