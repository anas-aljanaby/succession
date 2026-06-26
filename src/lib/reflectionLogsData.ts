import { mockReflectionLogs, mockUsers } from '../../constants';
import type { Candidate, Language } from '../types';
import type { ReflectionLog, SuccessionJourneyStage, Translations, User as LegacyUser } from '../../types';
import {
  legacyUserContent,
  pickLocalized,
  reflectionLogContent,
} from './contentCatalog';

const MOCK_ORG_ID_BY_ROUTE: Record<string, number> = {
  'org-acme': 1,
  'org-gda': 2,
  'org-mubarra': 4,
};

const NEW_TO_LEGACY_USER: Record<string, string> = {
  'u-consultant': '1',
  'u-admin': '2',
  'u-hr': '3',
  'u-cand': '4',
  'u-sup': '7',
  'u-viewer': '8',
};

const STAGE_TYPE_BY_CODE: Record<string, SuccessionJourneyStage['type']> = {
  STG1: 'planning',
  STG2: 'development',
  STG3: 'evaluation',
  STG4: 'sustainability',
};

export function legacyOrgId(orgRouteId: string): number | undefined {
  return MOCK_ORG_ID_BY_ROUTE[orgRouteId];
}

export function reflectionLogsForOrg(
  orgRouteId: string,
  language: Language
): ReflectionLog[] {
  const legacyId = legacyOrgId(orgRouteId);
  if (legacyId === undefined) return [];

  return mockReflectionLogs
    .filter((log) => log.org_id === legacyId)
    .map((log) => ({
      ...log,
      note: pickLocalized(reflectionLogContent[log.id]?.note, language, log.note),
    }));
}

export function legacyUsersForOrg(orgRouteId: string, language: Language): LegacyUser[] {
  const legacyId = legacyOrgId(orgRouteId);
  if (legacyId === undefined) return [];

  return mockUsers
    .filter((user) => user.roles.includes('CONSULTANT') || user.organizationId === legacyId)
    .map((user) => ({
      ...user,
      name: pickLocalized(legacyUserContent[user.id]?.name, language, user.name),
    }));
}

export function legacyUserForSession(
  userId: string | undefined,
  language: Language
): LegacyUser | undefined {
  const legacyId = userId ? NEW_TO_LEGACY_USER[userId] : undefined;
  if (!legacyId) return undefined;

  const user = mockUsers.find((item) => item.id === legacyId);
  if (!user) return undefined;

  return {
    ...user,
    name: pickLocalized(legacyUserContent[user.id]?.name, language, user.name),
  };
}

export function toLegacyStage(stage: { code: string; name: string }): SuccessionJourneyStage {
  return {
    code: stage.code,
    name: stage.name,
    type: STAGE_TYPE_BY_CODE[stage.code] ?? 'planning',
    duration_mode: 'dynamic',
    base_duration_days: 30,
    cri: 0,
    aei: 0,
  };
}

export function legacyUserIdForSession(userId: string | undefined): string {
  return (userId && NEW_TO_LEGACY_USER[userId]) || '1';
}

export function reflectionTranslations(t: (key: string) => string): Translations {
  return {
    reflectionLog: t('reflectionLogs.logTitle'),
    addReflection: t('reflectionLogs.addReflection'),
    yourNote: t('reflectionLogs.yourNote'),
    sentiment: t('reflectionLogs.sentiment'),
    addNote: t('reflectionLogs.addNote'),
    summarizeReflections: t('reflectionLogs.summarize'),
    aiSummary: t('reflectionLogs.aiSummary'),
    summarizing: t('reflectionLogs.summarizing'),
    noReflections: t('reflectionLogs.noReflections'),
  };
}

export function currentJourneyStage(candidate: Candidate) {
  const incomplete = candidate.journey.find((stage) =>
    stage.tasks.some((task) => task.status !== 'completed')
  );
  return incomplete ?? candidate.journey[candidate.journey.length - 1] ?? candidate.journey[0];
}
