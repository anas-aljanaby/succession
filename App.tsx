
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Language, Organization, SuccessionPlan, User, SuccessionJourneyStage, ReflectionLog, UserRole, ChatMessage, View, ToastData, FeedbackMessage, FeedbackThread, DevelopmentRecommendation, SurveyResult, InstitutionalArchiveEntry, InstitutionalConfirmationData, InstitutionType, CandidatesState, Candidate } from './types';
import { translations, mockOrganizations, mockSuccessionPlans, mockUsers, mockReflectionLogs, leadershipBuildingSurvey, journeyConfig } from './constants';
import { mockCandidates } from './data/mockCandidates';
import { mockPlanTemplates } from './data/mockPlanTemplates';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SuccessionPlanner from './components/SuccessionPlanner';
import JourneyMonitor from './components/JourneyMonitor';
import JourneyTimelinePreview from './components/JourneyTimelinePreview';
import ValuesDashboard from './components/ValuesDashboard';
import StageDetailScreen from './components/StageDetailScreen';
import ConsultingHouseDashboard from './components/ConsultingHouseDashboard';
import { LanguageSwitcher } from './components/common/LanguageSwitcher';
import { Button } from './components/common/Button';
import { Spinner } from './components/common/Spinner';
import { Toast } from './components/common/Toast';
import { generatePlanInsights, generateOrgInsights, runDailyAnalysis } from './services/insightEngine';
import { generateLearningLoopRecommendations } from './services/learningLoopService';
import { generateJwt, decodeJwt } from './services/authService';
import { getChatbotResponse, generateOrgLevelInsightSummary } from './services/geminiService';
import WelcomeMessage from './components/WelcomeMessage';
import AiChatbot from './components/AiChatbot';
import { updateBehavioralIndicators } from './services/behaviorTracker';
import { generateValueMirrorFeedback } from './services/valueMirrorService';
import { generateMonthlyReport } from './services/reportingService';
import SummaryScreen from './components/SummaryScreen';
import { generateYearlySummary } from './services/archivingService';
// import SetupReadinessScreen from './components/SetupReadinessScreen';
import { Modal } from './components/common/Modal';
import SurveyModal from './components/SurveyModal';
import CandidatePlanView from './components/CandidatePlanView';
import LearningExperienceView from './components/LearningExperienceView';
import StageClosurePage from './components/StageClosurePage';
import { getClosureType } from './services/hybridClosureFlowController';
import OrganizationsList from './components/organizations/OrganizationsList';
import OrganizationDetails from './components/organizations/OrganizationDetails';
import OrganizationForm from './components/organizations/OrganizationForm';
import { PermissionProvider } from './lib/permissions/PermissionProvider';
import CandidatesManagement from './components/candidates/CandidatesManagement';
import ConsultantDashboard from './components/consultant/ConsultantDashboard';
import StageDashboard from './components/stage-dashboard/StageDashboard';
import PlanCreationWizard from './components/plan-flow/PlanCreationWizard';
import { NotificationProvider } from './lib/notifications/NotificationContext';


const getInitialLanguage = (): Language => {
    return 'ar';
};

export const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [plans, setPlans] = useState<SuccessionPlan[]>(mockSuccessionPlans);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [activePlan, setActivePlan] = useState<SuccessionPlan | null>(null);
  const [selectedStageCode, setSelectedStageCode] = useState<string | null>(null);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [reflectionLogs, setReflectionLogs] = useState<ReflectionLog[]>(mockReflectionLogs);
  
  // Chatbot State
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState<ToastData[]>([]);
  
  // Modal State
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Survey State
  const [surveyState, setSurveyState] = useState<{
    isOpen: boolean, 
    planId: number | null, 
    stageCode: string | null,
    title?: string,
    description?: string
  }>({
    isOpen: false,
    planId: null,
    stageCode: null,
  });

  // Org Management State
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  // Closure flow protection state
  const [processingPlanIds, setProcessingPlanIds] = useState<Set<number>>(new Set());
  
  // Candidate Management State
  const [candidatesState, setCandidatesState] = useState<CandidatesState>({
    candidates: mockCandidates,
    selectedCandidateId: null,
    filters: { search: '' },
    viewMode: 'grid',
    isFormOpen: false,
    editingCandidate: null,
  });

  // Stage Dashboard State
  const [selectedStageCodeForDashboard, setSelectedStageCodeForDashboard] = useState<string | null>(null);

  const t = translations[language];

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(t => t.id !== id));
  }, []);

  const showNotification = useCallback((
    toastData: Omit<ToastData, 'id'>
  ) => {
    const newToast = { ...toastData, id: Date.now().toString() + Math.random() };
    setToasts(prevToasts => [...prevToasts, newToast].slice(-3));

    if (newToast.type !== 'error') {
      setTimeout(() => {
        removeToast(newToast.id);
      }, 6000);
    }
  }, [removeToast]);

  const selectedOrg = useMemo(() => {
    return organizations.find(org => org.id === selectedOrgId);
  }, [selectedOrgId, organizations]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    const body = document.querySelector('body');
    if (body) {
        if (!isAuthenticated) {
            body.classList.add('welcome-body');
            body.classList.remove('bg-gray-900');
        } else {
            body.classList.remove('welcome-body');
            body.classList.add('bg-gray-900');
        }
    }
  }, [language, isAuthenticated]);

  useEffect(() => {
    if (selectedOrg) {
      document.documentElement.className = `theme-${selectedOrg.type}`;
    } else {
      document.documentElement.className = isAuthenticated ? 'theme-corporate' : '';
    }
  }, [selectedOrg, isAuthenticated]);
  
  // Fix: Defined handleSuccessfulLogin to manage user session and authentication state.
  const handleSuccessfulLogin = (user: User) => {
    const token = generateJwt(user);
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
    setCurrentUser(user);
    const initialRole = user.roles[0] || null;
    setActiveRole(initialRole);
    if (initialRole === 'ORGANIZATION_ADMIN') {
      setSelectedOrgId(4);
    } else if (user.organizationId) {
      setSelectedOrgId(user.organizationId);
    }
    setCurrentView('dashboard');
  };
  
  // Check for JWT on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
        const decoded = decodeJwt(token);
        if (decoded && decoded.exp > Date.now()) {
            const user = mockUsers.find(u => u.id === decoded.id);
            if (user) {
                handleSuccessfulLogin(user);
            }
        } else {
            localStorage.removeItem('authToken');
        }
    }
  }, []);

  // Fix: Defined handleUpdateOrganization to update organization state.
  const handleUpdateOrganization = (updatedOrg: Organization) => {
    setOrganizations(prevOrgs =>
      prevOrgs.map(org => (org.id === updatedOrg.id ? updatedOrg : org))
    );
  };
  
  // Continuous Learning Loop Trigger (30 days) - for non-autopilot orgs
  useEffect(() => {
    if (isAuthenticated && selectedOrg) {
        if (selectedOrg.auto_pilot_enabled) return;

        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const lastUpdate = selectedOrg.last_recommendation_update ? new Date(selectedOrg.last_recommendation_update).getTime() : 0;
        const now = new Date().getTime();

        if (now - lastUpdate > thirtyDaysInMs) {
            console.log(`Running learning loop for ${selectedOrg.name}...`);
            const orgPlans = plans.filter(p => p.orgId === selectedOrg.id);
            const orgLogs = reflectionLogs.filter(r => r.org_id === selectedOrg.id);
            const newRecommendations = generateLearningLoopRecommendations(selectedOrg, orgPlans, orgLogs, translations[selectedOrg.language_pref]);
            
            handleUpdateOrganization({
                ...selectedOrg,
                recommendations: newRecommendations,
                last_recommendation_update: new Date().toISOString()
            });
        }
    }
  }, [isAuthenticated, selectedOrg, plans, reflectionLogs]);

  // Weekly Behavior Tracker Trigger (7 days)
  useEffect(() => {
    if (isAuthenticated) {
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        const now = new Date().getTime();

        const plansToUpdate = plans.filter(plan => {
            const lastUpdate = plan.lastBehavioralUpdate ? new Date(plan.lastBehavioralUpdate).getTime() : 0;
            return now - lastUpdate > sevenDaysInMs;
        });

        if (plansToUpdate.length > 0) {
            console.log(`Running weekly behavior tracker for ${plansToUpdate.length} plans...`);
            
            const updatedPlans = plans.map(plan => {
                if (!plansToUpdate.find(p => p.id === plan.id)) {
                    return plan;
                }

                const lastWeekLogs = reflectionLogs.filter(r => {
                    const logDate = new Date(r.timestamp).getTime();
                    // Check for plan-specific logs, not just org-specific
                    const planCandidateId = plan.candidate.id;
                    const logAuthor = mockUsers.find(u => u.id === r.user_id);
                    const isCandidateLog = logAuthor?.candidateId === planCandidateId;
                    
                    return (r.org_id === plan.orgId && now - logDate < sevenDaysInMs) && (isCandidateLog || !logAuthor?.candidateId); // include candidate and non-candidate logs
                });
                
                if(lastWeekLogs.length === 0) return plan; // No new data to process

                const org = organizations.find(o => o.id === plan.orgId);
                if (!org) return plan;

                const newIndicators = updateBehavioralIndicators(plan.behavioralIndicators, lastWeekLogs, org.language_pref);

                const indicatorScores = Object.values(newIndicators) as number[];
                const newBvi = Math.round(indicatorScores.reduce((a, b) => a + b, 0) / indicatorScores.length);
                
                const bviTrend = newBvi - plan.bvi;
                
                const mirrorData = generateValueMirrorFeedback(lastWeekLogs, bviTrend, org.language_pref, translations[org.language_pref]);

                return {
                    ...plan,
                    behavioralIndicators: newIndicators,
                    previousBvi: plan.bvi,
                    bvi: newBvi,
                    lastBehavioralUpdate: new Date().toISOString(),
                    weeklyValueMirror: mirrorData,
                };
            });
            
            setPlans(updatedPlans);
        }
    }
  }, [isAuthenticated, plans, reflectionLogs, organizations]);

  // Monthly Reporting Trigger (30 days) - for non-autopilot orgs
  useEffect(() => {
      if (isAuthenticated && activeRole === 'CONSULTANT') {
          const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
          const now = new Date().getTime();

          const updatedOrgs = organizations
            .filter(org => !org.auto_pilot_enabled) // Ignore orgs on autopilot
            .map(org => {
              const orgPlans = plans.filter(p => p.orgId === org.id);
              if (orgPlans.length === 0) return org;

              const reports = org.monthly_reports || [];
              const lastReportDate = reports.length > 0 ? new Date(reports[reports.length - 1].date).getTime() : 0;

              if (now - lastReportDate > thirtyDaysInMs) {
                  console.log(`Generating monthly report for ${org.name}...`);
                  const newReport = generateMonthlyReport(org, orgPlans);
                  const updatedOrg = {
                      ...org,
                      monthly_reports: [...reports, newReport],
                  };
                  
                  showNotification({ 
                      type: 'info', 
                      title: 'New Monthly Report', 
                      subtitle: t.monthlyReportGenerated.replace('{orgName}', org.name) 
                  });

                  return updatedOrg;
              }
              return org;
          });

          setOrganizations(prevOrgs => 
              prevOrgs.map(o => updatedOrgs.find(uo => uo.id === o.id) || o)
          );
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeRole, plans]); // Run only when auth state changes
  
  // Yearly Archiving Trigger
  useEffect(() => {
    if (isAuthenticated) {
        const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
        const now = new Date().getTime();
        const oneYearAgo = new Date(now - oneYearInMs);

        const logsToArchiveIds = new Set<number>();
        const updatedOrgs: Organization[] = [];

        organizations.forEach(org => {
            const lastArchive = org.last_archive_date ? new Date(org.last_archive_date).getTime() : 0;
            if (now - lastArchive > oneYearInMs) {
                console.log(`Running yearly archive for ${org.name}...`);
                
                const orgLogs = reflectionLogs.filter(log => log.org_id === org.id);
                const oldLogs = orgLogs.filter(log => new Date(log.timestamp) < oneYearAgo);
                oldLogs.forEach(log => logsToArchiveIds.add(log.id));

                const orgPlans = plans.filter(p => p.orgId === org.id);
                const summaryInsight = generateYearlySummary(org, orgPlans, t);

                const updatedOrg = {
                    ...org,
                    last_archive_date: new Date().toISOString(),
                    insight_history: [summaryInsight, ...(org.insight_history || [])].slice(0, 10),
                };
                updatedOrgs.push(updatedOrg);
                
                showNotification({ 
                    type: 'success', 
                    title: t.toast_archive_title, 
                    subtitle: t.toast_archive_complete.replace('{orgName}', org.name) 
                });
            }
        });

        if (updatedOrgs.length > 0) {
            setOrganizations(prevOrgs => 
                prevOrgs.map(o => updatedOrgs.find(uo => uo.id === o.id) || o)
            );
            setReflectionLogs(prevLogs => prevLogs.filter(log => !logsToArchiveIds.has(log.id)));
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, organizations]); // Run only when auth state changes

  const handleUpdatePlan = (updatedPlan: SuccessionPlan) => {
    setPlans(prevPlans => prevPlans.map(p => {
        if (p.id !== updatedPlan.id) return p;

        // The updatedPlan might have translated titles. We need to preserve the original titles from `p`.
        const journeyWithOriginalTitles = updatedPlan.journey.map(updatedMilestone => {
            const originalMilestone = p.journey.find(m => m.id === updatedMilestone.id);
            if (originalMilestone) {
                return { ...updatedMilestone, title: originalMilestone.title };
            }
            return updatedMilestone;
        });
        
        return { ...updatedPlan, journey: journeyWithOriginalTitles };
    }));

    if (activePlan?.id === updatedPlan.id) {
        // Also update activePlan, ensuring its journey titles are not the translated ones
        const originalPlanFromState = plans.find(p => p.id === updatedPlan.id);
        if (originalPlanFromState) {
            const journeyWithOriginalTitles = updatedPlan.journey.map(updatedMilestone => {
                const originalMilestone = originalPlanFromState.journey.find(m => m.id === updatedMilestone.id);
                if (originalMilestone) {
                    return { ...updatedMilestone, title: originalMilestone.title };
                }
                return updatedMilestone;
            });
            setActivePlan({ ...updatedPlan, journey: journeyWithOriginalTitles });
        } else {
            setActivePlan(updatedPlan);
        }
    }
};
  
  const handleConfirmClosure = (
    stageCode: string, 
    lessonsLearned: string, 
    finalRating: number,
    processRatings: { clarity: number; resources: number; feedback: number },
    signatures: { [key: string]: string | null },
    institutionalConfirmation: InstitutionalConfirmationData
  ) => {
      if (!activePlan || !selectedOrg || !activeRole) return;

      const stage = selectedOrg.stages.find(s => s.code === stageCode);
      if (!stage) return;

      const closureType = getClosureType(stage);

      if (closureType === 'institutional') {
          // V2 Verification: Recalculate key metrics at the time of closure to ensure data freshness for the archive.
          const completedMilestones = activePlan.journey.filter(m => m.status === 'Completed').length;
          const totalMilestones = activePlan.journey.length;
          const currentMaturityIndex = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
          
          const lriScores = Object.values(activePlan.lriAssessment) as number[];
          const currentReadinessIndex = lriScores.length > 0 ? Math.round(lriScores.reduce((a, b) => a + b, 0) / lriScores.length) : 0;

          const newArchiveEntry: InstitutionalArchiveEntry = {
              archiveDate: new Date().toISOString(),
              planId: activePlan.id,
              candidateName: activePlan.candidate.name,
              roleTitle: activePlan.roleTitle,
              stageCode: stage.code,
              stageName: stage.name,
              data: {
                  expectedResults: institutionalConfirmation.expectedResults,
                  actualResults: institutionalConfirmation.actualResults,
                  gapAnalysis: institutionalConfirmation.gapAnalysis,
                  readinessIndex: currentReadinessIndex,
                  maturityIndex: currentMaturityIndex,
                  signatures: signatures,
                  lessonsLearned: lessonsLearned,
                  finalRating: finalRating,
                  processRatings: processRatings,
              }
          };
          
          const updatedOrg: Organization = {
              ...selectedOrg,
              institutional_archive: [...(selectedOrg.institutional_archive || []), newArchiveEntry]
          };

          setOrganizations(prevOrgs => prevOrgs.map(org => org.id === updatedOrg.id ? updatedOrg : org));
          
          showNotification({
              type: 'success',
              title: t.toast_archive_success_title,
              subtitle: t.toast_archive_success_subtitle.replace('{stageName}', stage.name)
          });
          
          const lessonsInsight = t.insight_lessons_learned
            .replace('{stageName}', stage.name)
            .replace('{candidateName}', activePlan.candidate.name)
            .replace('{lessons}', lessonsLearned.substring(0, 50) + '...');
        
          const orgWithNewInsight = {
              ...updatedOrg,
              insight_history: [lessonsInsight, ...(updatedOrg.insight_history || [])].slice(0, 10),
          };
          
          handleUpdateOrganization(orgWithNewInsight);
      } else { // 'individual' closure
        showNotification({
            type: 'success',
            title: t.stageClosedTitle,
            subtitle: t.stageClosedSubtitle.replace('{stageName}', stage.name)
        });
      }
      
      setCurrentView('dashboard');
      setActivePlan(null);
      setSelectedStageCode(null);
  };
  
  const onRunDailyAnalysis = useCallback(async () => {
    const updatedOrgs = await runDailyAnalysis(reflectionLogs, organizations, t);
    if (updatedOrgs.length > 0) {
        setOrganizations(prevOrgs => 
            prevOrgs.map(o => updatedOrgs.find(uo => uo.id === o.id) || o)
        );
    }
  }, [reflectionLogs, organizations, t]);

  const onAddReflectionLog = useCallback((log: Omit<ReflectionLog, 'id' | 'timestamp'>) => {
      const newLog: ReflectionLog = {
          ...log,
          id: Date.now(),
          timestamp: new Date().toISOString()
      };

      // Update logs
      setReflectionLogs(prev => [newLog, ...prev]);

      // Update plan LQM
      const planToUpdate = plans.find(p => p.orgId === log.org_id && p.candidate.id === currentUser?.candidateId);
      if (planToUpdate) {
          const lqmChange = log.sentiment === 'positive' ? 2 : (log.sentiment === 'negative' ? -3 : 0);
          const newLqm = Math.max(0, Math.min(100, planToUpdate.lqm + lqmChange));
          
          const updatedPlan: SuccessionPlan = {...planToUpdate, lqm: newLqm};

          const oldPlan = {...planToUpdate};
          handleUpdatePlan(updatedPlan);

          if (selectedOrg) {
             const insight = generatePlanInsights(oldPlan, updatedPlan, selectedOrg, t);
             if (insight) {
                 handleUpdateOrganization({
                    ...selectedOrg,
                    insight_history: [insight, ...(selectedOrg.insight_history || [])].slice(0, 10),
                 });
             }
          }
      }
  }, [plans, currentUser, selectedOrg, t, handleUpdatePlan]);

  const onFeedbackSubmit = useCallback((
    planId: number, 
    stageCode: string, 
    message: Omit<FeedbackMessage, 'id'>, 
    recommendations: Omit<DevelopmentRecommendation, 'id'>[]
  ) => {
      setPlans(prevPlans => prevPlans.map(p => {
          if (p.id !== planId) return p;

          let updatedThreads = [...(p.feedbackThreads || [])];
          let thread = updatedThreads.find(t => t.stageCode === stageCode);
          
          if (thread) {
              // Add to existing thread
              thread.messages.push({ ...message, id: Date.now() });
              thread.status = 'AwaitingReply';
          } else if (message.text) {
              // Create new thread
              thread = { id: Date.now(), stageCode, messages: [{ ...message, id: Date.now() }], status: 'AwaitingReply' };
              updatedThreads.push(thread);
          }
          
          let updatedRecommendations = [...(p.developmentRecommendations || [])];
          recommendations.forEach(rec => {
             updatedRecommendations.push({
                 ...rec,
                 id: `IMP-${new Date().toISOString()}-${Math.random().toString(36).substring(2, 9)}`,
             });
          });

          return { ...p, feedbackThreads: updatedThreads, developmentRecommendations: updatedRecommendations };
      }));
  }, []);

  const onSurveySubmit = useCallback((result: Omit<SurveyResult, 'submittedBy'>) => {
      if (!currentUser || !surveyState.planId) return;
      
      const fullResult: SurveyResult = {
          ...result,
          submittedBy: currentUser.id,
      };

      setPlans(prevPlans => prevPlans.map(p => {
          if (p.id === surveyState.planId) {
              const updatedEvaluations = [...(p.evaluations || []), fullResult];
              return { ...p, evaluations: updatedEvaluations };
          }
          return p;
      }));

      showNotification({
          type: 'success',
          title: t.surveySubmittedTitle,
          subtitle: t.surveySubmittedSubtitle,
      });

      setSurveyState({ isOpen: false, planId: null, stageCode: null });
  }, [currentUser, surveyState.planId, showNotification, t]);

  const handleApproveClosure = (planId: number) => {
    if (!selectedOrg) return;

    setProcessingPlanIds(prev => new Set(prev).add(planId));

    // Simulate async operation for protection
    setTimeout(() => {
        const plan = plans.find(p => p.id === planId);
        if (!plan || plan.closureStatus !== 'readyForReview') {
            setProcessingPlanIds(prev => { const newSet = new Set(prev); newSet.delete(planId); return newSet; });
            return;
        }

        const stageCode = Object.keys(plan.stageClosureData || {}).find(code => {
            const data = plan.stageClosureData?.[code];
            const stage = selectedOrg.stages.find(s => s.code === code);
            if (!data || !stage || getClosureType(stage) !== 'institutional') return false;
            
            return data.signatures?.candidate && data.signatures?.consultant && data.signatures?.orgAdmin;
        });

        if (!stageCode) {
            console.error("Could not find stage to approve/archive for plan:", planId);
            setProcessingPlanIds(prev => { const newSet = new Set(prev); newSet.delete(planId); return newSet; });
            return;
        }

        const stage = selectedOrg.stages.find(s => s.code === stageCode);
        const stageData = plan.stageClosureData?.[stageCode];
        if (!stage || !stageData) {
            setProcessingPlanIds(prev => { const newSet = new Set(prev); newSet.delete(planId); return newSet; });
            return;
        }
        
        const completedMilestones = plan.journey.filter(m => m.status === 'Completed').length;
        const totalMilestones = plan.journey.length;
        const currentMaturityIndex = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
        
        const lriScores = Object.values(plan.lriAssessment) as number[];
        const currentReadinessIndex = lriScores.length > 0 ? Math.round(lriScores.reduce((a, b) => a + b, 0) / lriScores.length) : 0;

        const newArchiveEntry: InstitutionalArchiveEntry = {
            archiveDate: new Date().toISOString(),
            planId: plan.id,
            candidateName: plan.candidate.name,
            roleTitle: plan.roleTitle,
            stageCode: stage.code,
            stageName: stage.name,
            data: {
                expectedResults: stageData.institutionalConfirmation?.expectedResults || '',
                actualResults: stageData.institutionalConfirmation?.actualResults || '',
                gapAnalysis: stageData.institutionalConfirmation?.gapAnalysis || '',
                readinessIndex: currentReadinessIndex,
                maturityIndex: currentMaturityIndex,
                signatures: stageData.signatures || {},
                lessonsLearned: stageData.lessonsLearned || '',
                finalRating: stageData.finalRating || 0,
                processRatings: stageData.processRatings || { clarity: 0, resources: 0, feedback: 0 },
            }
        };
        
        const updatedOrg: Organization = {
            ...selectedOrg,
            institutional_archive: [...(selectedOrg.institutional_archive || []), newArchiveEntry]
        };

        const archiveInsight = t.insight_stage_archived
            .replace('{stageName}', stage.name)
            .replace('{candidateName}', plan.candidate.name);
        
        const orgWithNewInsight = {
            ...updatedOrg,
            insight_history: [archiveInsight, ...(updatedOrg.insight_history || [])].slice(0, 10),
        };
        
        handleUpdateOrganization(orgWithNewInsight);
        setOrganizations(prevOrgs => prevOrgs.map(org => org.id === orgWithNewInsight.id ? orgWithNewInsight : org));

        const updatedPlan = { ...plan, closureStatus: 'archived' as const };
        handleUpdatePlan(updatedPlan);

        // Notify administrators/consultants
        showNotification({
            type: 'success',
            title: t.toast_stage_closure_approved_title,
            subtitle: t.toast_stage_closure_approved_subtitle.replace('{stageName}', stage.name)
        });
        
        // Notify the candidate
        showNotification({
            type: 'success',
            title: t.toast_stage_closure_approved_title,
            subtitle: t.toast_stage_closure_approved_candidate_subtitle.replace('{stageName}', stage.name)
        });

        setProcessingPlanIds(prev => { const newSet = new Set(prev); newSet.delete(planId); return newSet; });
    }, 1000);
  };

  const handleReturnClosure = (planId: number) => {
    if (!selectedOrg) return;
    setProcessingPlanIds(prev => new Set(prev).add(planId));
    
    // Simulate async operation for protection
    setTimeout(() => {
        const plan = plans.find(p => p.id === planId);
        if (!plan || plan.closureStatus !== 'readyForReview') {
            setProcessingPlanIds(prev => { const newSet = new Set(prev); newSet.delete(planId); return newSet; });
            return;
        }

        const stageCode = Object.keys(plan.stageClosureData || {}).find(code => {
            const data = plan.stageClosureData?.[code];
            const stage = selectedOrg.stages.find(s => s.code === code);
            if (!data || !stage || getClosureType(stage) !== 'institutional') return false;
            
            return data.signatures?.candidate && data.signatures?.consultant && data.signatures?.orgAdmin;
        });

        if (!stageCode) {
            console.error("Could not find stage to return for review for plan:", planId);
            setProcessingPlanIds(prev => { const newSet = new Set(prev); newSet.delete(planId); return newSet; });
            return;
        }

        const updatedPlan = {
          ...plan,
          closureStatus: 'pending' as const,
          stageClosureData: {
            ...plan.stageClosureData,
            [stageCode]: {
                ...plan.stageClosureData?.[stageCode],
                signatures: { candidate: null, consultant: null, orgAdmin: null },
            }
          }
        };
        handleUpdatePlan(updatedPlan);

        showNotification({
          type: 'info',
          title: t.toast_closure_returned_title,
          subtitle: t.toast_closure_returned_subtitle.replace('{candidateName}', plan.candidate.name),
        });

        setProcessingPlanIds(prev => { const newSet = new Set(prev); newSet.delete(planId); return newSet; });
    }, 1000);
  };

  const handleSaveOrganization = (orgData: Omit<Organization, 'id'>) => {
    if (editingOrg) {
        // Update
        setOrganizations(prev => prev.map(o => o.id === editingOrg.id ? { ...o, ...orgData } : o));
    } else {
        // Create
        const newOrg: Organization = {
            ...mockOrganizations[0], // Use a base template
            ...orgData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
        };
        setOrganizations(prev => [...prev, newOrg]);
    }
    setCurrentView('organizations-list');
    setEditingOrg(null);
  };

  const handleSaveCandidate = (candidateData: Omit<Candidate, 'id'>) => {
    if (candidatesState.editingCandidate) {
      // Update
      setCandidatesState(prev => ({
        ...prev,
        candidates: prev.candidates.map(c => c.id === prev.editingCandidate?.id ? { ...c, ...candidateData } : c),
        isFormOpen: false,
        editingCandidate: null,
      }));
    } else {
      // Create
      const newCandidate: Candidate = { ...candidateData, id: `cand-${Date.now()}` };
      setCandidatesState(prev => ({
        ...prev,
        candidates: [...prev.candidates, newCandidate],
        isFormOpen: false,
      }));
    }
  };

  const handleDeleteCandidate = (candidateId: string) => {
    if (window.confirm(t.confirm_deleteCandidate)) {
      setCandidatesState(prev => ({
        ...prev,
        candidates: prev.candidates.filter(c => c.id !== candidateId),
      }));
    }
  };

  const localizedOrg = useMemo(() => {
    if (!selectedOrg) return undefined;
    const translatedStages = journeyConfig[selectedOrg.type]?.[language];
    if (!translatedStages) return selectedOrg;
    return { ...selectedOrg, stages: translatedStages };
  }, [selectedOrg, language]);

  const orgMap = useMemo(() => new Map(organizations.map(o => [o.id, o])), [organizations]);

  const localizedPlans = useMemo(() => {
    return plans.map(plan => {
      const planOrg = orgMap.get(plan.orgId);
      if (!planOrg) return plan;
      const sourceLang = planOrg.language_pref;
      if (sourceLang === language) return plan;
      const targetLang = language;
      const orgType = planOrg.type;
      const sourceStages = journeyConfig[orgType]?.[sourceLang];
      const targetStages = journeyConfig[orgType]?.[targetLang];
      if (!sourceStages || !targetStages) return plan;
      const translationMaps = new Map<string, Map<string, string>>();
      for (const sourceStage of sourceStages) {
          const targetStage = targetStages.find(s => s.code === sourceStage.code);
          if (targetStage && sourceStage.default_tasks && targetStage.default_tasks) {
              const taskMap = new Map<string, string>();
              for (let i = 0; i < sourceStage.default_tasks.length; i++) {
                  if (targetStage.default_tasks[i]) {
                      taskMap.set(sourceStage.default_tasks[i], targetStage.default_tasks[i]);
                  }
              }
              translationMaps.set(sourceStage.code, taskMap);
          }
      }
      const translatedJourney = plan.journey.map(milestone => {
          const taskMap = translationMaps.get(milestone.stageCode);
          const translatedTitle = taskMap?.get(milestone.title);
          return { ...milestone, title: translatedTitle || milestone.title };
      });
      return { ...plan, journey: translatedJourney };
    });
  }, [plans, language, orgMap]);
  
  const localizedActivePlan = useMemo(() => {
    if (!activePlan) return null;
    return localizedPlans.find(p => p.id === activePlan.id) || activePlan;
  }, [activePlan, localizedPlans]);

  // Expose API for new components
  useEffect(() => {
    (window as any).appApi = {
      ...((window as any).appApi || {}),
      getCandidatesForOrganization: (orgId: number) => candidatesState.candidates.filter(c => c.organizationId === orgId),
      getCandidateById: (candidateId: string) => candidatesState.candidates.find(c => c.id === candidateId),
      getPlanTemplates: () => mockPlanTemplates,
      createCandidatePlan: (planData: any) => {
        // This is a simplified creation logic
        console.log("Creating new plan with data:", planData);
        const candidate = candidatesState.candidates.find(c => c.id === planData.candidateId);
        if (!candidate) {
          console.error("Candidate not found for new plan");
          return;
        }

        const newPlan: SuccessionPlan = {
          id: Date.now(),
          orgId: planData.organizationId,
          roleTitle: candidate.targetPosition,
          candidate: { id: Date.now() + 1, name: candidate.name, currentRole: candidate.currentPosition },
          readiness: 10, maturity: 0, closureStatus: 'pending',
          lriAssessment: { competence: 10, behavior: 10, value_alignment: 10, learning_agility: 10 },
          bvi: 50, lqm: 50,
          behavioralIndicators: { honesty: 50, respect: 50, innovation: 50, collaboration: 50, responsibility: 50 },
          aiGeneratedPlan: "Plan generated via new flow.",
          journey: [], // In a real app, this would be populated based on the template
        };
        
        setPlans(prev => [...prev, newPlan]);
        setCandidatesState(prev => ({
          ...prev,
          candidates: prev.candidates.map(c => c.id === candidate.id ? {...c, planId: newPlan.id} : c)
        }));

        showNotification({ type: 'success', title: t.toast_planCreated_title, subtitle: t.toast_planCreated_subtitle.replace('{candidateName}', candidate.name) });
      },
      navigateTo: (view: View, params: any) => {
        // Handle plan and candidate context first
        if (params?.planId) {
            const plan = plans.find(p => p.id === params.planId);
            if (plan) {
                setActivePlan(plan);
                // Also try to sync selected candidate
                const candidate = candidatesState.candidates.find(c => c.planId === params.planId);
                if (candidate) {
                    setCandidatesState(prev => ({ ...prev, selectedCandidateId: candidate.id }));
                }
            }
        } else if (params?.candidateId) {
          setCandidatesState(prev => ({ ...prev, selectedCandidateId: params.candidateId }));
          const candidate = candidatesState.candidates.find(c => c.id === params.candidateId);
          if (candidate?.planId) {
            const plan = plans.find(p => p.id === candidate.planId);
            setActivePlan(plan || null);
          } else {
            setActivePlan(null);
          }
        }
        
        // Handle view-specific context
        if (params?.stageId) {
          setSelectedStageCode(params.stageId);
        }
        
        // Finally, change the view
        setCurrentView(view);
      },
      setCurrentView: (view: View, params?: any) => {
        if (params?.stageId) {
          setSelectedStageCode(params.stageId);
        }
        if (params?.candidateId) {
          setCandidatesState(prev => ({ ...prev, selectedCandidateId: params.candidateId }));
        }
        setCurrentView(view);
      },
      // Stage Transition Controller APIs
      getStageStatus: (stageId: string, candidateId?: string) => {
        const plan = plans.find(p => p.candidate.id.toString() === candidateId);
        if (!plan) return Promise.resolve({ pendingTasks: [] });
        const pendingTasks = plan.journey.filter(m => m.stageCode === stageId && m.status !== 'Completed');
        return Promise.resolve({ pendingTasks });
      },
      getStageClosureStatus: (stageId: string, candidateId?: string) => {
          const plan = plans.find(p => p.candidate.id.toString() === candidateId);
          const stage = organizations.find(o => o.id === plan?.orgId)?.stages.find(s => s.code === stageId);
          if (!plan || !stage) return Promise.resolve({ approved: false });
          
          if (getClosureType(stage) === 'institutional') {
              return Promise.resolve({ approved: plan.closureStatus === 'archived' });
          }
          const allTasksDone = plan.journey.filter(m => m.stageCode === stageId).every(m => m.status === 'Completed');
          return Promise.resolve({ approved: allTasksDone });
      },
      getNextStageForCandidate: (currentStageId: string, candidateId?: string) => {
          const plan = plans.find(p => p.candidate.id.toString() === candidateId);
          const org = organizations.find(o => o.id === plan?.orgId);
          if (!org) return Promise.resolve(null);
          
          const currentIndex = org.stages.findIndex(s => s.code === currentStageId);
          if (currentIndex > -1 && currentIndex < org.stages.length - 1) {
              return Promise.resolve({ id: org.stages[currentIndex + 1].code });
          }
          return Promise.resolve(null);
      },
      moveCandidateToStage: (nextStageId: string, candidateId?: string) => {
          console.log(`Transitioning candidate ${candidateId} to stage ${nextStageId}. This action is handled by navigation.`);
          return Promise.resolve(true);
      },
    };
  }, [candidatesState.candidates, showNotification, plans, currentUser, organizations, t]);

  if (!isAuthenticated) {
    const handleStart = (role: UserRole) => {
        const user = mockUsers.find(u => u.roles.includes(role));
        if (user) {
            handleSuccessfulLogin(user);
        } else {
            alert(t.alert_noDemoUserForRole);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
          <div className="absolute top-6 left-6 rtl:left-auto rtl:right-6">
            <LanguageSwitcher language={language} setLanguage={setLanguage} />
          </div>
          <WelcomeMessage t={t} onStart={handleStart} language={language} />
        </div>
    );
  }

  if (isLoading || !currentUser) {
      return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  }
  
  if (!localizedOrg && (currentView !== 'consulting-house-dashboard' && !currentView.startsWith('organization') && currentView !== 'candidates-management' && currentView !== 'consultant-dashboard' && currentView !== 'plan-creation-wizard')) {
    if (activeRole === 'CONSULTANT') {
        return (
            <NotificationProvider>
                <PermissionProvider user={currentUser} activeRole={activeRole}>
                 <div className="min-h-screen">
                    <Header 
                        t={t} language={language} setLanguage={setLanguage}
                        orgs={organizations} selectedOrgId={selectedOrgId}
                        onOrgChange={(id) => setSelectedOrgId(id)}
                        user={currentUser} activeRole={activeRole}
                        onRoleSwitch={(role) => setActiveRole(role)}
                        onLogout={() => setIsLogoutModalOpen(true)}
                        onNavigateToGlobalDashboard={() => setCurrentView('consulting-house-dashboard')}
                        onNavigateToConsultantDashboard={() => setCurrentView('consultant-dashboard')}
                        onNavigateToOrganizations={() => setCurrentView('organizations-list')}
                        onToggleChatbot={() => setIsChatbotOpen(!isChatbotOpen)}
                        activePlan={activePlan}
                        onNavigateToJourneyTimelinePreview={() => {if(activePlan) setCurrentView('journey-timeline-preview')}}
                        onNavigateToValuesDashboard={() => {if(activePlan) setCurrentView('values-dashboard')}}
                        onSettingsClick={() => alert(t.alert_settingsClicked)}
                        candidates={candidatesState.candidates}
                        selectedCandidateId={candidatesState.selectedCandidateId}
                        onSelectCandidate={(id) => setCandidatesState(prev => ({ ...prev, selectedCandidateId: id }))}
                    />
                    <main className="p-8">
                        <ConsultingHouseDashboard 
                            allPlans={localizedPlans} 
                            allOrganizations={organizations}
                            allReflectionLogs={reflectionLogs}
                            t={t}
                            language={language}
                            onRunDailyAnalysis={onRunDailyAnalysis}
                            onUpdateOrganization={handleUpdateOrganization}
                        />
                    </main>
                </div>
                </PermissionProvider>
            </NotificationProvider>
        )
    }
    return <div>{t.error_no_org}</div>;
  }
  
  const localizedOrgPlans = localizedPlans.filter(p => p.orgId === localizedOrg?.id);

  let mainContent;
  if (currentView === 'dashboard') {
    mainContent = (
      <Dashboard
        plans={localizedOrgPlans}
        organization={localizedOrg!}
        t={t}
        viewPlan={(plan) => {
            setActivePlan(plan);
            setCurrentView('candidate-plan');
        }}
        createPlan={() => setCurrentView('planner')}
        onUpdateOrganization={handleUpdateOrganization}
        activeRole={activeRole}
        onApproveClosure={handleApproveClosure}
        onReturnClosure={handleReturnClosure}
        processingPlanIds={processingPlanIds}
        candidates={candidatesState.candidates.filter(c => c.organizationId === localizedOrg?.id)}
        onNavigateToCandidates={() => setCurrentView('candidates-management')}
        onNavigateToPlanWizard={(candidateId?: string) => {
          setCandidatesState(prev => ({...prev, selectedCandidateId: candidateId || null}));
          setCurrentView('plan-creation-wizard');
        }}
      />
    );
  } else if (currentView === 'planner') {
      mainContent = (
          <SuccessionPlanner 
              t={t}
              onSave={(newPlanData) => {
                  const newPlan: SuccessionPlan = {
                      ...newPlanData,
                      id: Date.now(),
                      orgId: localizedOrg!.id,
                  };
                  setPlans([...plans, newPlan]);
                  setCurrentView('dashboard');
              }}
              onCancel={() => setCurrentView('dashboard')}
              organization={localizedOrg!}
          />
      );
  } else if (currentView === 'plan-creation-wizard') {
    mainContent = (
        <PlanCreationWizard
            organizationId={selectedOrgId?.toString()}
            preselectedCandidateId={candidatesState.selectedCandidateId || undefined}
            t={t}
            onCancel={() => {
              setCandidatesState(prev => ({...prev, selectedCandidateId: null}));
              setCurrentView('dashboard');
            }}
            onComplete={(plan) => {
              // Logic to add the plan and navigate
              setPlans(prev => [...prev, plan]);
              setCandidatesState(prev => ({...prev, selectedCandidateId: null}));
              setActivePlan(plan);
              setCurrentView('candidate-plan');
            }}
        />
    );
  } else if (currentView === 'organizations-list') {
      mainContent = (
          <OrganizationsList
              organizations={organizations}
              plans={plans}
              t={t}
              onAdd={() => { setEditingOrg(null); setCurrentView('organization-form'); }}
              onEdit={(org) => { setEditingOrg(org); setCurrentView('organization-form'); }}
              onView={(org) => { setSelectedOrgId(org.id); setCurrentView('organization-details'); }}
              onDelete={(orgId) => setOrganizations(orgs => orgs.filter(o => o.id !== orgId))}
          />
      );
  } else if (currentView === 'organization-form') {
      mainContent = (
          <OrganizationForm
              organization={editingOrg}
              t={t}
              onSave={handleSaveOrganization}
              onCancel={() => setCurrentView('organizations-list')}
          />
      );
  } else if (currentView === 'organization-details' && selectedOrg) {
      mainContent = (
          <OrganizationDetails
              organization={selectedOrg}
              plans={plans.filter(p => p.orgId === selectedOrg.id)}
              t={t}
              onBack={() => { setSelectedOrgId(null); setCurrentView('organizations-list'); }}
              onEdit={(org) => { setEditingOrg(org); setCurrentView('organization-form'); }}
          />
      );
  } else if (currentView === 'consulting-house-dashboard') {
       mainContent = (
            <ConsultingHouseDashboard 
                allPlans={localizedPlans} 
                allOrganizations={organizations}
                allReflectionLogs={reflectionLogs}
                t={t}
                language={language}
                onRunDailyAnalysis={onRunDailyAnalysis}
                onUpdateOrganization={handleUpdateOrganization}
            />
       );
  } else if (currentView === 'consultant-dashboard') {
    mainContent = (
         <ConsultantDashboard
             allPlans={localizedPlans} 
             allOrganizations={organizations}
             t={t}
         />
    );
  } else if (currentView === 'candidates-management') {
    mainContent = (
      <CandidatesManagement
        candidatesState={candidatesState}
        setCandidatesState={setCandidatesState}
        plans={plans}
        stages={localizedOrg?.stages || []}
        t={t}
        onSave={handleSaveCandidate}
        onDelete={handleDeleteCandidate}
        onViewPlan={(planId) => {
          const plan = plans.find(p => p.id === planId);
          if (plan) {
            setActivePlan(plan);
            setCurrentView('candidate-plan');
          }
        }}
        onMonitorJourney={(planId) => {
          const plan = plans.find(p => p.id === planId);
          if (plan) {
            setActivePlan(plan);
            setCurrentView('monitor');
          }
        }}
        onCreatePlan={(candidateId) => {
            setCandidatesState(prev => ({...prev, selectedCandidateId: candidateId}));
            setCurrentView('plan-creation-wizard');
        }}
      />
    );
  } else if (currentView === 'monitor' && localizedActivePlan) {
      mainContent = (
          <JourneyMonitor
              plan={localizedActivePlan}
              organization={localizedOrg!}
              t={t}
              onBack={() => {
                  setCurrentView('dashboard');
                  setActivePlan(null);
              }}
              onUpdatePlan={handleUpdatePlan}
              currentUser={currentUser}
              activeRole={activeRole}
              allUsers={mockUsers}
              reflectionLogs={reflectionLogs}
              onAddReflectionLog={onAddReflectionLog}
              onFeedbackSubmit={onFeedbackSubmit}
              language={language}
              onNavigateToJourneyTimelinePreview={() => setCurrentView('journey-timeline-preview')}
              onNavigateToValuesDashboard={() => setCurrentView('values-dashboard')}
              onIndicatorsUpdate={() => console.log("Indicators updated!")}
              onStageComplete={() => showNotification({ type: 'success', title: 'Stage Complete!', subtitle: 'Great work moving to the next phase.' })}
              onJourneyComplete={() => setCurrentView('summary-screen')}
              onStartSurvey={(planId, stageCode, options) => setSurveyState({ isOpen: true, planId, stageCode, ...options })}
          />
      );
  } else if (currentView === 'journey-timeline-preview' && localizedActivePlan) {
      mainContent = (
          <JourneyTimelinePreview 
              plan={localizedActivePlan}
              organization={localizedOrg!}
              t={t}
              onBack={() => {
                  setActivePlan(null);
                  setCurrentView('dashboard');
              }}
              onStageSelect={(stageCode) => {
                  setSelectedStageCode(stageCode);
                  setCurrentView('stage-detail-screen');
              }}
              activeRole={activeRole}
          />
      );
  } else if (currentView === 'values-dashboard' && localizedActivePlan) {
      mainContent = (
          <ValuesDashboard
              plan={localizedActivePlan}
              organization={localizedOrg!}
              t={t}
              onBack={() => setCurrentView('monitor')}
              reflectionLogs={reflectionLogs.filter(r => r.org_id === localizedOrg!.id)}
              allUsers={mockUsers}
              currentUser={currentUser}
              onAddReflectionLog={onAddReflectionLog}
              language={language}
              activeRole={activeRole}
          />
      );
  } else if (currentView === 'stage-detail-screen' && localizedActivePlan && selectedStageCode) {
      mainContent = (
          <StageDetailScreen
              plan={localizedActivePlan}
              organization={localizedOrg!}
              stageCode={selectedStageCode}
              t={t}
              onBack={() => setCurrentView('journey-timeline-preview')}
              reflectionLogs={reflectionLogs}
              allUsers={mockUsers}
              currentUser={currentUser}
              activeRole={activeRole}
              onAddReflectionLog={onAddReflectionLog}
              language={language}
              onUpdatePlan={handleUpdatePlan}
              onStartSurvey={(stageCode, options) => setSurveyState({ isOpen: true, planId: localizedActivePlan.id, stageCode, ...options })}
              showNotification={showNotification}
              onNavigateToLearningExperience={() => setCurrentView('learning-experience')}
              onNavigateToClosure={() => { setCurrentView('stage-closure'); }}
              onNavigateToStageDashboard={(stageCode) => {
                setSelectedStageCodeForDashboard(stageCode);
                setCurrentView('stage-dashboard');
              }}
          />
      )
  } else if (currentView === 'stage-dashboard' && selectedStageCodeForDashboard && localizedOrg) {
    mainContent = (
        <StageDashboard
            stageCode={selectedStageCodeForDashboard}
            organization={localizedOrg}
            plans={localizedOrgPlans}
            candidates={candidatesState.candidates.filter(c => c.organizationId === localizedOrg.id)}
            t={t}
            onBack={() => {
                setCurrentView('journey-timeline-preview');
                setSelectedStageCodeForDashboard(null);
            }}
            onNavigateToCandidate={(planId) => {
                const plan = plans.find(p => p.id === planId);
                if (plan) {
                    setActivePlan(plan);
                    setCurrentView('monitor');
                }
            }}
        />
    );
  } else if (currentView === 'summary-screen' && localizedActivePlan) {
      mainContent = (
          <SummaryScreen
              plan={localizedActivePlan}
              organization={localizedOrg!}
              t={t}
              onBackToDashboard={() => {
                  setCurrentView('dashboard');
                  setActivePlan(null);
              }}
          />
      )
  } else if (currentView === 'candidate-plan') {
       const planToView = localizedActivePlan || localizedPlans.find(p => p.candidate.id === currentUser.candidateId);
       if (planToView) {
           mainContent = (
               <CandidatePlanView 
                  plan={planToView}
                  organization={localizedOrg!}
                  t={t}
                  onBack={() => {
                    setActivePlan(null);
                    setCurrentView('dashboard');
                  }}
                  reflectionLogs={reflectionLogs}
               />
           );
       } else if (activeRole === 'CANDIDATE' && planToView) {
            setActivePlan(planToView);
            setCurrentView('journey-timeline-preview');
       } else {
            mainContent = <div>{t.noPlanAssigned}</div>
       }
  } else if (currentView === 'learning-experience' && localizedActivePlan && selectedStageCode) {
       const stage = localizedOrg!.stages.find(s => s.code === selectedStageCode);
       mainContent = (
           <LearningExperienceView
              onBack={() => setCurrentView('stage-detail-screen')}
              t={t}
              stageCode={selectedStageCode}
              stageName={stage?.name}
           />
       );
} else if (currentView === 'stage-closure' && localizedActivePlan && selectedStageCode) {
    mainContent = (
        <StageClosurePage
            plan={localizedActivePlan}
            organization={localizedOrg!}
            stageCode={selectedStageCode}
            t={t}
            onBack={() => setCurrentView('stage-detail-screen')}
            currentUser={currentUser}
            activeRole={activeRole}
            onConfirmClosure={handleConfirmClosure}
            onUpdatePlan={handleUpdatePlan}
            showNotification={showNotification}
            allPlans={localizedOrgPlans}
            reflectionLogs={reflectionLogs}
        />
    )
}

const candidatesForHeader = selectedOrgId
    ? candidatesState.candidates.filter(c => c.organizationId === selectedOrgId)
    : [];

  return (
    <NotificationProvider>
        <PermissionProvider user={currentUser} activeRole={activeRole}>
        <div className="min-h-screen">
        <Header 
            t={t} language={language} setLanguage={setLanguage}
            orgs={organizations} selectedOrgId={selectedOrgId}
            onOrgChange={(id) => setSelectedOrgId(id)}
            user={currentUser} activeRole={activeRole}
            onRoleSwitch={(role) => setActiveRole(role)}
            onLogout={() => setIsLogoutModalOpen(true)}
            onNavigateToGlobalDashboard={() => setCurrentView('dashboard')}
            onNavigateToConsultantDashboard={() => setCurrentView('consultant-dashboard')}
            onNavigateToOrganizations={() => setCurrentView('organizations-list')}
            onToggleChatbot={() => setIsChatbotOpen(!isChatbotOpen)}
            activePlan={activePlan}
            onNavigateToJourneyTimelinePreview={() => {if(activePlan) setCurrentView('journey-timeline-preview')}}
            onNavigateToValuesDashboard={() => {if(activePlan) setCurrentView('values-dashboard')}}
            onSettingsClick={() => alert(t.alert_settingsClicked)}
            candidates={candidatesForHeader}
            selectedCandidateId={candidatesState.selectedCandidateId}
            onSelectCandidate={(id) => {
              const candidate = candidatesState.candidates.find(c => c.id === id);
              if (candidate?.planId) {
                const plan = plans.find(p => p.id === candidate.planId);
                if (plan) setActivePlan(plan);
                else setActivePlan(null);
              } else {
                setActivePlan(null);
              }
              setCandidatesState(prev => ({ ...prev, selectedCandidateId: id }));
            }}
        />
        <main className="p-4 sm:p-6 lg:p-8">
            {mainContent}
        </main>
        <AiChatbot 
            isOpen={isChatbotOpen}
            onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
            messages={chatMessages}
            onSendMessage={async (message) => {
                const newHistory: ChatMessage[] = [...chatMessages, { sender: 'user', text: message }];
                setChatMessages(newHistory);
                setIsChatbotLoading(true);
                const aiResponse = await getChatbotResponse(newHistory, currentUser, activeRole, localizedOrg, language);
                setChatMessages([...newHistory, { sender: 'ai', text: aiResponse }]);
                setIsChatbotLoading(false);
            }}
            isLoading={isChatbotLoading}
            t={t}
            language={language}
        />
        <Toast toasts={toasts} onClose={removeToast} />
         <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title={t.logoutConfirmTitle}>
                <p>{t.logoutConfirmMessage}</p>
                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="secondary" onClick={() => setIsLogoutModalOpen(false)}>{t.cancel}</Button>
                    <Button onClick={() => {
                        localStorage.removeItem('authToken');
                        setIsAuthenticated(false);
                        setCurrentUser(null);
                        setActiveRole(null);
                        setSelectedOrgId(null);
                        setIsLogoutModalOpen(false);
                        setCurrentView('dashboard');
                        setActivePlan(null);
                        setCandidatesState(prev => ({ ...prev, selectedCandidateId: null }));
                    }}>{t.confirm}</Button>
                </div>
            </Modal>

            {surveyState.isOpen && (
                <SurveyModal 
                    isOpen={surveyState.isOpen}
                    onClose={() => setSurveyState({ isOpen: false, planId: null, stageCode: null })}
                    survey={leadershipBuildingSurvey}
                    t={t}
                    onSubmit={onSurveySubmit}
                    stageCode={surveyState.stageCode}
                    stageName={localizedOrg?.stages.find(s => s.code === surveyState.stageCode)?.name}
                    title={surveyState.title}
                    description={surveyState.description}
                />
            )}
        </div>
        </PermissionProvider>
    </NotificationProvider>
  );
};
