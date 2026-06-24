import type {
  AppState,
  Candidate,
  CriticalFunction,
  Language,
  Organization,
  User,
} from '../types';
import {
  candidateContent,
  functionContent,
  organizationContent,
  pickLocalized,
  userContent,
} from './contentCatalog';
import { localizeCriteria } from './criteria';
import { localizeJourney } from './journey';

function localizeOrganization(org: Organization, language: Language): Organization {
  const content = organizationContent[org.id];
  if (!content) return org;

  return {
    ...org,
    name: pickLocalized(content.name, language, org.name),
    sector: pickLocalized(content.sector, language, org.sector),
    description: pickLocalized(content.description, language, org.description ?? ''),
    contactInfo: org.contactInfo
      ? {
          ...org.contactInfo,
          address: content.contactInfo
            ? pickLocalized(content.contactInfo.address, language, org.contactInfo.address)
            : org.contactInfo.address,
        }
      : org.contactInfo,
  };
}

function localizeFunction(fn: CriticalFunction, language: Language): CriticalFunction {
  const content = functionContent[fn.id];

  return {
    ...fn,
    title: content ? pickLocalized(content.title, language, fn.title) : fn.title,
    department: content
      ? pickLocalized(content.department, language, fn.department)
      : fn.department,
    criteria: localizeCriteria(fn.criteria, language),
  };
}

function localizeCandidate(
  candidate: Candidate,
  language: Language,
  orgType: Organization['type']
): Candidate {
  const content = candidateContent[candidate.id];

  return {
    ...candidate,
    name: content ? pickLocalized(content.name, language, candidate.name) : candidate.name,
    currentPosition: content
      ? pickLocalized(content.currentPosition, language, candidate.currentPosition)
      : candidate.currentPosition,
    targetPosition: content
      ? pickLocalized(content.targetPosition, language, candidate.targetPosition)
      : candidate.targetPosition,
    department: content
      ? pickLocalized(content.department, language, candidate.department)
      : candidate.department,
    journey: localizeJourney(candidate.journey, orgType, language),
  };
}

function localizeUser(user: User, language: Language): User {
  const content = userContent[user.id];
  if (!content) return user;
  return {
    ...user,
    name: pickLocalized(content.name, language, user.name),
  };
}

export function applyLanguageToState(state: AppState, language: Language): AppState {
  const orgTypes = new Map(state.organizations.map((org) => [org.id, org.type]));

  return {
    ...state,
    ui: { language },
    organizations: state.organizations.map((org) => localizeOrganization(org, language)),
    functions: state.functions.map((fn) => localizeFunction(fn, language)),
    candidates: state.candidates.map((candidate) =>
      localizeCandidate(candidate, language, orgTypes.get(candidate.organizationId) ?? 'corporate')
    ),
    users: state.users.map((user) => localizeUser(user, language)),
  };
}
