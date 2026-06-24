import type {
  AppState,
  Candidate,
  CriticalFunction,
  Organization,
  User,
} from '../types';
import { DEFAULT_CRITERIA } from '../lib/criteria';
import { defaultJourney } from '../lib/journey';
import { applyLanguageToState } from '../lib/localizeState';

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

const users: User[] = [
  { id: 'u-consultant', name: 'Dana Al-Mutairi', email: 'dana@consulting.com', roles: ['CONSULTANT'] },
  { id: 'u-admin', name: 'Ahmed Al-Fahad', email: 'ahmed@acme.com', roles: ['ORGANIZATION_ADMIN'], organizationId: 'org-acme' },
  { id: 'u-hr', name: 'Fatima Al-Marzouq', email: 'fatima@acme.com', roles: ['HR_MANAGER'], organizationId: 'org-acme' },
  { id: 'u-sup', name: 'Nasser Al-Jasser', email: 'nasser@acme.com', roles: ['SUPERVISOR'], organizationId: 'org-acme' },
  { id: 'u-cand', name: 'Khalid Al-Ghamdi', email: 'khalid@acme.com', roles: ['CANDIDATE'], organizationId: 'org-acme', candidateId: 'cand-khalid' },
  { id: 'u-viewer', name: 'Samira Adel', email: 'samira@acme.com', roles: ['VIEWER'], organizationId: 'org-acme' },
];

const organizations: Organization[] = [
  {
    id: 'org-acme',
    name: 'ACME Corporation',
    sector: 'Technology',
    type: 'corporate',
    languagePref: 'en',
    maturityLevel: 'Maturing',
    status: 'active',
    description: 'A leading innovator in cloud solutions and enterprise software.',
    contactInfo: { email: 'contact@acme.com', phone: '+1-202-555-0149', address: '123 Tech Way, CA' },
    createdAt: daysAgo(100),
  },
  {
    id: 'org-gda',
    name: 'General Data Authority',
    sector: 'Government',
    type: 'government',
    languagePref: 'ar',
    maturityLevel: 'Advanced',
    status: 'active',
    description: 'The government body responsible for regulating and managing national data.',
    contactInfo: { email: 'info@gda.gov.sa', phone: '+966-11-555-0182', address: 'King Fahd Road, Riyadh' },
    createdAt: daysAgo(250),
  },
  {
    id: 'org-mubarra',
    name: 'Al-Mutamayzeen Charity',
    sector: 'Charity',
    type: 'charity',
    languagePref: 'ar',
    maturityLevel: 'Emerging',
    status: 'active',
    description: 'A charitable foundation supporting distinguished and talented individuals.',
    contactInfo: { email: 'info@mubarra.org', phone: '+965-222-555-01', address: 'Kuwait City' },
    createdAt: daysAgo(15),
  },
];

const functions: CriticalFunction[] = [
  {
    id: 'fn-cto',
    organizationId: 'org-acme',
    title: 'Chief Technology Officer',
    department: 'Technology',
    priority: 'high',
    status: 'in-progress',
    criteria: DEFAULT_CRITERIA.map((c) => ({ ...c })),
  },
  {
    id: 'fn-cmo',
    organizationId: 'org-acme',
    title: 'Chief Marketing Officer',
    department: 'Marketing',
    priority: 'medium',
    status: 'in-progress',
    criteria: DEFAULT_CRITERIA.map((c) => ({ ...c })),
  },
  {
    id: 'fn-vpe',
    organizationId: 'org-acme',
    title: 'VP of Engineering',
    department: 'Technology',
    priority: 'high',
    status: 'vacant',
    criteria: DEFAULT_CRITERIA.map((c) => ({ ...c })),
  },
  {
    id: 'fn-strategy',
    organizationId: 'org-gda',
    title: 'Strategy Director',
    department: 'Strategy',
    priority: 'high',
    status: 'in-progress',
    criteria: DEFAULT_CRITERIA.map((c) => ({ ...c })),
  },
  {
    id: 'fn-ceo-charity',
    organizationId: 'org-mubarra',
    title: 'Chief Executive Officer',
    department: 'Executive',
    priority: 'high',
    status: 'in-progress',
    criteria: DEFAULT_CRITERIA.map((c) => ({ ...c })),
  },
];

const scores = (vals: Record<string, number>) =>
  Object.entries(vals).map(([criterionKey, value]) => ({ criterionKey, value }));

const candidates: Candidate[] = [
  {
    id: 'cand-khalid',
    organizationId: 'org-acme',
    criticalFunctionId: 'fn-cto',
    supervisorId: 'u-sup',
    name: 'Khalid Al-Ghamdi',
    currentPosition: 'Senior Developer',
    targetPosition: 'Chief Technology Officer',
    department: 'Technology',
    status: 'active',
    scores: scores({ competence: 60, leadership: 50, strategic_thinking: 45, values_alignment: 70, learning_agility: 55 }),
    journey: defaultJourney(
      [
        ['completed', 'completed', 'completed'],
        ['inProgress', 'notStarted', 'notStarted'],
      ],
      'corporate',
      'en'
    ),
  },
  {
    id: 'cand-sara',
    organizationId: 'org-acme',
    criticalFunctionId: 'fn-cto',
    supervisorId: 'u-sup',
    name: 'Sara Mansour',
    currentPosition: 'Engineering Lead',
    targetPosition: 'Chief Technology Officer',
    department: 'Technology',
    status: 'active',
    scores: scores({ competence: 88, leadership: 90, strategic_thinking: 85, values_alignment: 92, learning_agility: 86 }),
    journey: defaultJourney(
      [
        ['completed', 'completed', 'completed'],
        ['completed', 'completed', 'inProgress'],
      ],
      'corporate',
      'en'
    ),
  },
  {
    id: 'cand-omar',
    organizationId: 'org-acme',
    criticalFunctionId: 'fn-cmo',
    name: 'Omar Abdullah',
    currentPosition: 'Marketing Manager',
    targetPosition: 'Chief Marketing Officer',
    department: 'Marketing',
    status: 'active',
    scores: scores({ competence: 72, leadership: 68, strategic_thinking: 70, values_alignment: 75, learning_agility: 65 }),
    journey: defaultJourney([['completed', 'completed', 'inProgress']], 'corporate', 'en'),
  },
  {
    id: 'cand-layla',
    organizationId: 'org-gda',
    criticalFunctionId: 'fn-strategy',
    name: 'Layla Al-Qahtani',
    currentPosition: 'Senior Strategy Analyst',
    targetPosition: 'Strategy Director',
    department: 'Strategy',
    status: 'active',
    scores: scores({ competence: 75, leadership: 65, strategic_thinking: 80, values_alignment: 78, learning_agility: 60 }),
    journey: defaultJourney(
      [['completed', 'completed', 'completed'], ['inProgress']],
      'government',
      'en'
    ),
  },
  {
    id: 'cand-abdullatif',
    organizationId: 'org-mubarra',
    criticalFunctionId: 'fn-ceo-charity',
    name: 'Abdullatif Al-Kandari',
    currentPosition: 'Project Manager',
    targetPosition: 'Chief Executive Officer',
    department: 'Executive',
    status: 'active',
    scores: scores({ competence: 30, leadership: 25, strategic_thinking: 40, values_alignment: 55, learning_agility: 35 }),
    journey: defaultJourney([['inProgress']], 'charity', 'en'),
  },
];

export const seedState = (): AppState =>
  applyLanguageToState(
    {
      users,
      organizations,
      functions,
      candidates,
      session: { userId: 'u-consultant', activeRole: 'CONSULTANT' },
      ui: { language: 'ar' },
    },
    'ar'
  );
