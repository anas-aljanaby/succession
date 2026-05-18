import type { SuccessionJourneyStage, ClosureType, SuccessionPlan, Translations } from '../types';

/**
 * Manages hybrid closure logic by determining the type of closure process for a stage.
 * 'planning' and 'sustainability' stages require a full institutional closure.
 * 'development' and 'evaluation' stages use a simpler, individual-focused closure.
 */
export const getClosureType = (stage: SuccessionJourneyStage): ClosureType => {
  switch (stage.type) {
    case 'planning':
    case 'sustainability':
      return 'institutional';
    case 'development':
    case 'evaluation':
    default:
      return 'individual';
  }
};

export interface IndividualClosureValidationResult {
  isReady: boolean;
  pendingRequirements: string[];
}

/**
 * Validates if an 'individual' stage closure is ready based on defined rules.
 * @param plan - The succession plan.
 * @param stage - The stage being closed.
 * @returns An object indicating readiness and a list of pending requirements.
 */
export const validateIndividualClosure = (
  plan: SuccessionPlan,
  stage: SuccessionJourneyStage
): IndividualClosureValidationResult => {
  const result: IndividualClosureValidationResult = {
    isReady: true,
    pendingRequirements: [],
  };

  // Rule: tasksCompleted >= 90%
  const milestones = plan.journey.filter(m => m.stageCode === stage.code);
  const completedCount = milestones.filter(m => m.status === 'Completed').length;
  const totalCount = milestones.length;
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 100;
  
  if (percentage < 90) {
    result.isReady = false;
    result.pendingRequirements.push('validation_tasksNotCompleted');
  }

  // Rule: dataValidated & signaturesComplete (interpreted as required feedback provided)
  const closureData = plan.stageClosureData?.[stage.code];
  if (!closureData?.lessonsLearned?.trim()) {
    result.isReady = false;
    result.pendingRequirements.push('validation_lessonsLearnedMissing');
  }
  if (!closureData?.finalRating || closureData.finalRating === 0) {
    result.isReady = false;
    result.pendingRequirements.push('validation_finalRatingMissing');
  }
  const processRatings = closureData?.processRatings;
  if (!processRatings || Object.values(processRatings).some(r => r === 0)) {
    result.isReady = false;
    result.pendingRequirements.push('validation_processRatingsMissing');
  }

  return result;
};

export interface InstitutionalStageValidationResult {
  isReady: boolean;
  pendingRequirements: string[];
}

/**
 * Validates if an 'institutional' stage closure can proceed based on organization-wide rules.
 * @param allOrgPlans - All succession plans for the organization.
 * @param currentPlan - The specific plan initiating the closure.
 * @returns An object indicating readiness and a list of pending requirements.
 */
export const validateInstitutionalStageClosure = (
  allOrgPlans: SuccessionPlan[],
  currentPlan: SuccessionPlan
): InstitutionalStageValidationResult => {
  const result: InstitutionalStageValidationResult = {
    isReady: true,
    pendingRequirements: [],
  };

  // Rule: minReadyCandidates >= 80%
  // A "ready candidate" is defined as having a readiness score of 85% or more.
  const readyCandidates = allOrgPlans.filter(p => p.readiness >= 85).length;
  const totalCandidates = allOrgPlans.length;
  if (totalCandidates > 0) {
    const readyPercentage = (readyCandidates / totalCandidates) * 100;
    if (readyPercentage < 80) {
      result.isReady = false;
      result.pendingRequirements.push('validation_minReadyCandidatesNotMet');
    }
  }

  // Rule: allCriticalRolesClosed: true
  // Interpreted as: No other plans should be in 'readyForReview' status.
  const otherPlans = allOrgPlans.filter(p => p.id !== currentPlan.id);
  const hasPendingReviews = otherPlans.some(p => p.closureStatus === 'readyForReview');
  if (hasPendingReviews) {
    result.isReady = false;
    result.pendingRequirements.push('validation_pendingReviews');
  }

  return result;
};