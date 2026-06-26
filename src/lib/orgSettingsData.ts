import type { InstitutionType, Organization } from '../types';

export interface OrgOperationalSettings {
  readinessThreshold: number;
  emailDigest: boolean;
  stageReminders: boolean;
  consultantReviewRequired: boolean;
}

const DEFAULTS: Record<InstitutionType, OrgOperationalSettings> = {
  corporate: {
    readinessThreshold: 85,
    emailDigest: true,
    stageReminders: true,
    consultantReviewRequired: false,
  },
  government: {
    readinessThreshold: 85,
    emailDigest: true,
    stageReminders: true,
    consultantReviewRequired: true,
  },
  education: {
    readinessThreshold: 80,
    emailDigest: false,
    stageReminders: true,
    consultantReviewRequired: false,
  },
  charity: {
    readinessThreshold: 75,
    emailDigest: true,
    stageReminders: false,
    consultantReviewRequired: false,
  },
};

export function operationalSettingsFor(org: Organization): OrgOperationalSettings {
  return DEFAULTS[org.type];
}
