import type { SuccessionJourneyStage } from '../types';

/**
 * Calculates the estimated duration for a succession journey stage.
 * The formula increases the base duration based on organizational and individual readiness gaps.
 * @param stage - The succession journey stage object, which includes the base duration.
 * @param orlsScore - The overall Organizational Readiness Level Score (0-100).
 * @param lriScore - The candidate's Leadership Readiness Index score (0-100).
 * @returns The estimated duration in days, rounded to the nearest whole number.
 */
export const calculateStageDuration = (
  stage: SuccessionJourneyStage,
  orlsScore: number,
  lriScore: number
): number => {
  // The multipliers represent the "drag" caused by readiness gaps.
  // A score of 100 means no drag (multiplier of 1).
  // A score of 0 means a 100% increase in time (multiplier of 2).
  const orlsMultiplier = 1 + (100 - orlsScore) / 100;
  const lriMultiplier = 1 + (100 - lriScore) / 100;

  const duration = stage.base_duration_days * orlsMultiplier * lriMultiplier;

  return Math.round(duration);
};
