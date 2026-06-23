export type Language = 'en' | 'ar';

export type InstitutionType = 'corporate' | 'government' | 'education' | 'charity';

export type UserRole =
  | 'CONSULTANT'
  | 'ORGANIZATION_ADMIN'
  | 'HR_MANAGER'
  | 'SUPERVISOR'
  | 'CANDIDATE'
  | 'VIEWER';

export type Priority = 'high' | 'medium' | 'low';
export type FunctionStatus = 'vacant' | 'in-progress' | 'ready';
export type CandidateStatus = 'active' | 'paused' | 'withdrawn' | 'selected';
export type TaskStatus = 'notStarted' | 'inProgress' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  organizationId?: string; // scope for non-consultant roles
  candidateId?: string; // for CANDIDATE role
}

export interface Organization {
  id: string;
  name: string;
  sector: string;
  type: InstitutionType; // drives accent color + default stages
  languagePref: Language;
  maturityLevel: 'Emerging' | 'Maturing' | 'Advanced';
  status: 'active' | 'inactive';
  description?: string;
  contactInfo?: { email: string; phone: string; address: string };
  createdAt: string;
}

export interface Criterion {
  key: string; // e.g. 'competence'
  label: string;
  weight: number; // relative weight in the readiness average
}

export interface CriticalFunction {
  id: string;
  organizationId: string;
  title: string;
  department: string;
  priority: Priority;
  status: FunctionStatus; // derived from pool readiness
  criteria: Criterion[]; // what candidates are scored against
  selectedCandidateId?: string; // chosen successor
}

export interface CriterionScore {
  criterionKey: string;
  value: number; // 0–100
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface JourneyStage {
  code: string; // 'STG1'…'STG4'
  name: string;
  tasks: Task[];
}

export interface Candidate {
  id: string;
  organizationId: string;
  criticalFunctionId: string; // one function per candidate
  supervisorId?: string; // for Supervisor scoping
  name: string;
  currentPosition: string;
  targetPosition: string;
  department: string;
  status: CandidateStatus;
  scores: CriterionScore[]; // against the function's criteria
  journey: JourneyStage[];
  // readiness is DERIVED, not stored — computed from scores + criteria weights
}

export interface AppState {
  users: User[];
  organizations: Organization[];
  functions: CriticalFunction[];
  candidates: Candidate[];
  session: { userId: string | null; activeRole: UserRole | null };
  ui: { language: Language };
}
