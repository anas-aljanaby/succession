import type {
  CandidatesState,
  Candidate,
  DevelopmentRecommendation,
  FeedbackMessage,
  InstitutionalConfirmationData,
  Language,
  Organization,
  ReflectionLog,
  SuccessionPlan,
  ToastData,
  Translations,
  User,
  UserRole,
  View,
} from '../../types';
import type { NavigateFn } from '../../lib/navigation/types';

export interface AppViewRouterBaseProps {
  currentView: View;
  t: Translations;
  navigate: NavigateFn;
}

export type AppViewRouterProps = AppViewRouterContext;

export interface AppViewRouterContext extends AppViewRouterBaseProps {
  language: Language;
  organizations: Organization[];
  selectedOrg?: Organization;
  selectedOrgId: number | null;
  localizedOrg: Organization;
  localizedPlans: SuccessionPlan[];
  localizedOrgPlans: SuccessionPlan[];
  localizedActivePlan: SuccessionPlan | null;
  plans: SuccessionPlan[];
  reflectionLogs: ReflectionLog[];
  currentUser: User;
  activeRole: UserRole | null;
  selectedStageCode: string | null;
  selectedStageCodeForDashboard: string | null;
  editingOrg: Organization | null;
  candidatesState: CandidatesState;
  processingPlanIds: Set<number>;
  setPlans: React.Dispatch<React.SetStateAction<SuccessionPlan[]>>;
  setActivePlan: (plan: SuccessionPlan | null) => void;
  setSelectedStageCodeForDashboard: (code: string | null) => void;
  setSelectedOrgId: (id: number | null) => void;
  setEditingOrg: (org: Organization | null) => void;
  setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
  setCandidatesState: React.Dispatch<React.SetStateAction<CandidatesState>>;
  setSurveyState: React.Dispatch<React.SetStateAction<{
    isOpen: boolean;
    planId: number | null;
    stageCode: string | null;
    title?: string;
    description?: string;
  }>>;
  handleUpdateOrganization: (updatedOrg: Organization) => void;
  handleApproveClosure: (planId: number) => void;
  handleReturnClosure: (planId: number) => void;
  handleSaveOrganization: (orgData: Omit<Organization, 'id'>) => void;
  handleSaveCandidate: (candidateData: Omit<Candidate, 'id'>) => void;
  handleDeleteCandidate: (candidateId: string) => void;
  handleUpdatePlan: (updatedPlan: SuccessionPlan) => void;
  handleConfirmClosure: (
    stageCode: string,
    lessonsLearned: string,
    finalRating: number,
    processRatings: { clarity: number; resources: number; feedback: number },
    signatures: { [key: string]: string | null },
    institutionalConfirmation: InstitutionalConfirmationData
  ) => void;
  onRunDailyAnalysis: () => Promise<void>;
  onAddReflectionLog: (log: Omit<ReflectionLog, 'id' | 'timestamp'>) => void;
  onFeedbackSubmit: (
    planId: number,
    stageCode: string,
    message: Omit<FeedbackMessage, 'id'>,
    recommendations: Omit<DevelopmentRecommendation, 'id'>[]
  ) => void;
  showNotification: (toastData: Omit<ToastData, 'id'>) => void;
  onEnterOrg: (orgId: number) => void;
}
