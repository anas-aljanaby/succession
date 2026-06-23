// Fix: Replaced incorrect file content with proper type definitions to be used across the application.
export type Language = 'en' | 'ar';

export type InstitutionType = 'corporate' | 'government' | 'education' | 'charity';

export type View = 'dashboard' | 'planner' | 'monitor' | 'consulting-house-dashboard' | 'journey-timeline-preview' | 'values-dashboard' | 'stage-detail-screen' | 'summary-screen' | 'setup-readiness' | 'candidate-plan' | 'welcome' | 'learning-experience' | 'stage-closure' | 'organizations-list' | 'organization-details' | 'organization-form' | 'candidates-management' | 'consultant-dashboard' | 'stage-dashboard' | 'plan-creation-wizard';

export type ClosureType = 'individual' | 'institutional';

export type ClosureStatus = 'pending' | 'readyForReview' | 'archived';

export type UserRole = 'CONSULTANT' | 'ORGANIZATION_ADMIN' | 'HR_MANAGER' | 'SUPERVISOR' | 'CANDIDATE' | 'VIEWER';

export type Sentiment = 'positive' | 'neutral' | 'negative';

export type TaskStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Delayed' | 'Cancelled';

export type Priority = 'High' | 'Medium' | 'Low';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  organizationId?: number;
  candidateId?: number;
}

export interface OrlsAssessment {
    governance: number;
    culture: number;
    systems: number;
    resources: number;
    strategic_support: number;
}

export interface SuccessionJourneyStage {
    code: string;
    name: string;
    type: 'planning' | 'development' | 'evaluation' | 'sustainability';
    duration_mode: "dynamic" | "fixed";
    base_duration_days: number;
    cri: number;
    aei: number;
    default_tasks?: string[];
}

export interface ReportData {
    avgLri: number;
    orls: number;
    avgAei: number;
    avgCri: number;
    avgBvi: number;
    insights: string[];
}

export interface MonthlyReport {
    date: string;
    summary_json: ReportData;
    summary_pdf_link: string;
    status: 'pending_review' | 'reviewed';
}

export interface InstitutionalArchiveEntry {
    archiveDate: string;
    planId: number;
    candidateName: string;
    roleTitle: string;
    stageCode: string;
    stageName: string;
    data: {
        expectedResults: string;
        actualResults: string;
        gapAnalysis: string;
        readinessIndex: number;
        maturityIndex: number;
        signatures: { [key: string]: string | null };
        lessonsLearned: string;
        finalRating: number;
        processRatings: {
            clarity: number;
            resources: number;
            feedback: number;
        };
    }
}

export interface CriticalFunction {
  id: string;
  title: string;
  department: string;
  priority: 'high' | 'medium' | 'low';
  candidateId?: string;
  planId?: number;
  status: 'vacant' | 'in-progress' | 'ready';
}

export interface Organization {
  id: number;
  name: string;
  sector: string;
  type: InstitutionType;
  language_pref: Language;
  maturity_level: 'Emerging' | 'Maturing' | 'Advanced';
  stages: SuccessionJourneyStage[];
  orlsAssessment: OrlsAssessment;
  insight_history?: string[];
  recommendations?: string[];
  last_recommendation_update?: string;
  monthly_reports?: MonthlyReport[];
  last_archive_date?: string;
  auto_pilot_enabled?: boolean;
  last_daily_analysis_date?: string;
  institutional_archive?: InstitutionalArchiveEntry[];
  demo?: boolean;
  // New fields for Organization Management
  description?: string;
  contactInfo?: {
    email: string;
    phone: string;
    address: string;
  };
  logo?: string;
  createdAt?: string;
  status?: 'active' | 'inactive';
  criticalFunctions?: CriticalFunction[];
}

export interface JourneyMilestone {
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    stageCode: string;
    ownerId?: string;
    duration?: number; // in days
    templateLink?: string;
}

export interface LriAssessment {
    competence: number;
    behavior: number;
    value_alignment: number;
    learning_agility: number;
}

export interface BehavioralIndicators {
    honesty: number;
    respect: number;
    innovation: number;
    collaboration: number;
    responsibility: number;
}

export interface ValueMirrorData {
    emoji: string;
    quote: string;
    feedback: string;
}

export interface FeedbackAttachment {
    type: 'link' | 'file';
    value: string;
    name?: string;
}

export interface FeedbackMessage {
    id: number;
    senderId: string;
    senderRole: UserRole;
    text: string;
    attachment?: FeedbackAttachment;
    timestamp: string;
}

export interface FeedbackThread {
    id: number;
    stageCode: string;
    messages: FeedbackMessage[];
    status: 'AwaitingReply' | 'Discussed';
}

export interface DevelopmentRecommendation {
    id: string; // e.g., IMP-20240729-12345
    stageCode: string;
    consultantId: string;
    improvementArea: string; // key from improvementAreas constant
    recommendationText: string;
    priority: Priority;
    timestamp: string;
}

export type SurveyQuestionType = 'rating' | 'text';

export interface SurveyQuestion {
  id: string;
  text: string;
  type: SurveyQuestionType;
}

export interface SurveySection {
  title: string;
  questions: SurveyQuestion[];
}

export interface Survey {
  id: string;
  name: string;
  sections: SurveySection[];
}

export interface SurveyAnswer {
  questionId: string;
  value: number | string;
}

export interface SurveyResult {
  surveyId: string;
  stageCode: string;
  submittedBy: string; // user id
  submittedAt: string; // ISO date string
  answers: SurveyAnswer[];
}

export interface InstitutionalConfirmationData {
    expectedResults: string;
    actualResults: string;
    gapAnalysis: string;
}

export interface SuccessionPlan {
    id: number;
    orgId: number;
    roleTitle: string;
    candidate: { id: number; name: string; currentRole: string };
    readiness: number;
    maturity: number;
    closureStatus: ClosureStatus;
    lriAssessment: LriAssessment;
    previousLriAssessment?: LriAssessment;
    bvi: number;
    lqm: number;
    previousBvi?: number;
    previousMaturity?: number;
    behavioralIndicators: BehavioralIndicators;
    aiGeneratedPlan: string;
    journey: JourneyMilestone[];
    lastBehavioralUpdate?: string;
    weeklyValueMirror?: ValueMirrorData;
    feedbackThreads?: FeedbackThread[];
    developmentRecommendations?: DevelopmentRecommendation[];
    evaluations?: SurveyResult[];
    stageClosureData?: {
        [stageCode: string]: {
            lessonsLearned?: string;
            finalRating?: number;
            processRatings?: { clarity: number; resources: number; feedback: number };
            signatures?: { [key: string]: string | null };
            institutionalConfirmation?: InstitutionalConfirmationData;
        }
    };
}

export interface ReflectionLog {
    id: number;
    user_id: string;
    org_id: number;
    stage_code: string;
    note: string;
    sentiment: Sentiment;
    timestamp: string;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

export interface JourneyDashboardData {
    currentStageName: string;
    lriScore: number;
    orlsScore: number;
    cri: number;
    aei: number;
    stageTasks: {
        completed: number;
        total: number;
    };
}

export interface ValueInsight {
    value: string;
    count: number;
    emoji: string;
}

export interface Translations {
  [key: string]: string;
}

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export type ToastData = {
    id: string;
    type: ToastType;
    title: string;
    subtitle?: string;
};

export interface NotificationData {
  id: string;
  type: ToastType;
  title: string;
  subtitle?: string;
  timestamp: Date;
  read: boolean;
  sendTo: UserRole[];
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  currentPosition: string;
  targetPosition: string;
  department: string;
  organizationId: number;
  profileImage?: string;
  startDate: string;
  
  planId?: number;
  currentStageId?: string;
  journeyProgress: number;
  status: 'active' | 'paused' | 'completed' | 'archived';
  
  supervisor?: string;
  lastActivityDate: string;
  nextMilestone?: {
    title: string;
    dueDate: string;
  };
}

export interface CandidatesState {
  candidates: Candidate[];
  selectedCandidateId: string | null;
  filters: {
    search: string;
    stage?: string;
    status?: 'active' | 'paused' | 'completed' | 'archived';
    department?: string;
    progressRange?: [number, number];
  };
  viewMode: 'grid' | 'table';
  isFormOpen: boolean;
  editingCandidate: Candidate | null;
}

export interface ConsultantDashboardState {
  selectedOrganizations: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  viewSettings: {
    showInactiveOrgs: boolean;
    groupBy: 'organization' | 'stage' | 'progress';
    sortBy: 'name' | 'activity' | 'progress';
    sortOrder: 'asc' | 'desc';
  };
}

export interface StageCandidateRow {
  id: string;
  name: string;
  targetPosition?: string;
  progress: number;
  status: 'active' | 'paused' | 'completed';
  nextAction?: string;
  lastActivity?: string;
  planId?: number;
}

export interface StageActivity {
  id: string;
  title: string;
  candidateName: string;
  time: string;
  type: string;
}

export interface StageDashboardData {
  stageName: string;
  totalCandidates: number;
  activeCandidates: number;
  completionRate: number;
  avgProgress: number;
  pendingTasks: number;
  candidates: StageCandidateRow[];
}
