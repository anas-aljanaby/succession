
import React, { useMemo, useState, useEffect } from 'react';
import type { SuccessionPlan, Organization, Translations, ReflectionLog, User, Language, TaskStatus, UserRole, ToastData, Sentiment } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import ReflectionLogView from './ReflectionLogView';
import { Select } from './common/Select';
import { SentimentPositiveIcon } from './icons/SentimentPositiveIcon';
import { SentimentNeutralIcon } from './icons/SentimentNeutralIcon';
import { SentimentNegativeIcon } from './icons/SentimentNegativeIcon';
import { Modal } from './common/Modal';
import { PlusIcon } from './icons/PlusIcon';
import StageSummaryCard from './StageSummaryCard';
import RemainingTasksCard from './RemainingTasksCard';
import CompletionTimelineCard from './CompletionTimelineCard';
import { StageTransitionBar } from './stage-transition/StageTransitionBar';

interface StageDetailScreenProps {
  plan: SuccessionPlan;
  organization: Organization;
  stageCode: string;
  t: Translations;
  onBack: () => void;
  reflectionLogs: ReflectionLog[];
  allUsers: User[];
  currentUser: User;
  activeRole: UserRole | null;
  onAddReflectionLog: (log: Omit<ReflectionLog, 'id' | 'timestamp'>) => void;
  language: Language;
  onUpdatePlan: (plan: SuccessionPlan) => void;
  onStartSurvey: (stageCode: string, options?: { title?: string, description?: string }) => void;
  showNotification: (toastData: Omit<ToastData, 'id'>) => void;
  onNavigateToLearningExperience: () => void;
  onNavigateToClosure: () => void;
  onNavigateToStageDashboard: (stageCode: string) => void;
}

const advancedStepsData: Record<string, { step: string; goal: string; R: string; A: string; C: string; I: string; }[]> = {
    'STG1': [
      { step: "تحليل الدور القيادي الحالي", goal: "تحديد الفجوات", R: "مسؤول المؤسسة", A: "مدير المشروع", C: "المستشار", I: "المرشح" },
      { step: "إقرار معايير اختيار المرشحين", goal: "اعتماد المعايير", R: "مدير المشروع", A: "المستشار", C: "مسؤول المؤسسة", I: "المرشح" },
      { step: "جدولة التقييمات والنماذج", goal: "تجهيز أدوات التقييم", R: "مسؤول المؤسسة", A: "مدير المشروع", C: "المستشار", I: "-" }
    ],
    'STG2': [
      { step: "تفعيل برامج التأهيل المتفق عليها", goal: "بدء تنفيذ الخطة", R: "مسؤول المؤسسة", A: "مدير المشروع", C: "المستشار", I: "المرشح" },
      { step: "جلسة إرشاد/توجيه مع المستشار", goal: "ضبط مسار التعلم", R: "المستشار", A: "مدير المشروع", C: "مسؤول المؤسسة", I: "المرشح" },
      { step: "توثيق تقدم المرشح", goal: "تحديث السجل", R: "مسؤول المؤسسة", A: "مدير المشروع", C: "المستشار", I: "-" }
    ],
    'STG3': [
      { step: "التطبيق التجريبي لخطة الانتقال", goal: "اختبار الجاهزية", R: "مسؤول المؤسسة", A: "مدير المشروع", C: "المستشار", I: "المرشح" },
      { step: "تقييم فعالية التدريب", goal: "قياس الأثر", R: "مدير المشروع", A: "المستشار", C: "مسؤول المؤسسة", I: "-" },
      { step: "تحسين الآليات", goal: "إدخال التعديلات", R: "المستشار", A: "مدير المشروع", C: "مسؤول المؤسسة", I: "-" }
    ],
    'STG4': [
      { step: "المتابعة بعد الانتقال", goal: "ضمان الاستقرار", R: "مسؤول المؤسسة", A: "مدير المشروع", C: "المستشار", I: "المرشح" },
      { step: "رصد الأثر", goal: "توثيق التحسن", R: "مدير المشروع", A: "المستشار", C: "مسؤول المؤسسة", I: "-" },
      { step: "التطوير المستمر", goal: "إغلاق الحلقة", R: "المستشار", A: "مدير المشروع", C: "مسؤول المؤسسة", I: "-" }
    ]
};

type AdvancedStepStatus = 'لم تبدأ' | 'جارية' | 'مكتملة';

interface AdvancedStep {
  step: string;
  goal: string;
  category: string;
  R: string;
  A: string;
  C: string;
  I: string;
  status: AdvancedStepStatus;
  targetDate?: string | null;
}

const StageDetailScreen: React.FC<StageDetailScreenProps> = (props) => {
  const { 
    plan, 
    organization, 
    stageCode, 
    t, 
    onBack, 
    reflectionLogs, 
    allUsers, 
    currentUser,
    activeRole,
    onAddReflectionLog, 
    language,
    onUpdatePlan,
    onStartSurvey,
    showNotification,
    onNavigateToLearningExperience,
    onNavigateToClosure,
    onNavigateToStageDashboard,
  } = props;

  const [advancedSteps, setAdvancedSteps] = useState<AdvancedStep[]>([]);
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [experienceSentiment, setExperienceSentiment] = useState<Sentiment>('neutral');
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [newStepData, setNewStepData] = useState({
    step: '',
    goal: '',
    category: 'إجرائية',
    R: '-',
    A: '-',
    C: '-',
    I: '-',
    targetDate: ''
  });

  useEffect(() => {
    const initialData = (advancedStepsData[stageCode] || []).map(d => ({
        ...d,
        category: t.stepCategory_operational,
        status: 'لم تبدأ' as AdvancedStepStatus,
        targetDate: null,
    }));
    setAdvancedSteps(initialData);
  }, [stageCode, t.stepCategory_operational]);


  const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

  const { stage, milestones, stageLogs } = useMemo(() => {
    const stage = organization.stages.find(s => s.code === stageCode);
    const milestones = plan.journey.filter(m => m.stageCode === stageCode);
    const stageLogs = reflectionLogs.filter(log => log.stage_code === stageCode);
    return { stage, milestones, stageLogs };
  }, [stageCode, organization.stages, plan.journey, reflectionLogs]);
  
  const canAddAdvancedStep = useMemo(() => 
    ['ORGANIZATION_ADMIN', 'HR_MANAGER', 'CONSULTANT'].includes(activeRole || ''), 
  [activeRole]);

  const isCandidate = activeRole === 'CANDIDATE';
  const isEvaluationStage = stage?.type === 'evaluation';
  const isReadOnlyForCandidate = isCandidate && isEvaluationStage;

  const canCloseStage = useMemo(() => 
    ['ORGANIZATION_ADMIN', 'CONSULTANT'].includes(activeRole || ''), 
  [activeRole]);

  const handleStatusChange = (milestoneId: number, newStatus: TaskStatus) => {
      const updatedJourney = plan.journey.map(m => 
          m.id === milestoneId ? { ...m, status: newStatus } : m
      );

      const oldStatus = plan.journey.find(m => m.id === milestoneId)?.status;
      let bviChange = 0;
      if (newStatus === 'Completed' && oldStatus !== 'Completed') {
          bviChange = 1;
      } else if (newStatus !== 'Completed' && oldStatus === 'Completed') {
          bviChange = -1;
      }
      
      const newBvi = Math.max(0, Math.min(100, plan.bvi + bviChange));
      
      const updatedPlan = { ...plan, journey: updatedJourney, bvi: newBvi };
      onUpdatePlan(updatedPlan);
  };
  
  const statusOptions: { value: TaskStatus; label: string }[] = [
      { value: 'NotStarted', label: t.status_NotStarted },
      { value: 'InProgress', label: t.status_InProgress },
      { value: 'Completed', label: t.status_Completed },
      { value: 'Delayed', label: t.status_Delayed },
      { value: 'Cancelled', label: t.status_Cancelled },
  ];
  
  const getStatusColorClass = (status: TaskStatus) => {
    switch (status) {
        case 'Completed': return 'text-green-400';
        case 'InProgress': return 'text-yellow-400';
        case 'Delayed': return 'text-red-400';
        case 'Cancelled': return 'text-red-400';
        default: return 'text-gray-400';
    }
  };
  
  const hasSubmittedSurvey = useMemo(() => {
    return plan.evaluations?.some(
      ev => ev.stageCode === stageCode && ev.surveyId === 'Leadership_Succession_Building_Phase_Survey'
    );
  }, [plan.evaluations, stageCode]);

  const showEvaluationButton = activeRole === 'CANDIDATE' && stageCode === 'STG2' && !hasSubmittedSurvey;
  
  const advancedStatusOptions: { value: AdvancedStepStatus; label: string }[] = useMemo(() => [
      { value: 'لم تبدأ', label: t.advancedStepStatus_NotStarted },
      { value: 'جارية', label: t.advancedStepStatus_InProgress },
      { value: 'مكتملة', label: t.advancedStepStatus_Completed },
  ], [t]);

  const notifyAdvancedStep = (stepName: string) => {
      return new Promise<void>((resolve) => {
        showNotification({
          type: 'info',
          title: t.alertSentTitle,
          subtitle: t.alertSentSubtitle.replace('{stepName}', stepName),
        });
        resolve();
      });
  };

  const handleAdvancedStatusChange = (stepNameToUpdate: string, newStatus: AdvancedStepStatus) => {
    setAdvancedSteps(prev => 
        prev.map(step => 
            step.step === stepNameToUpdate ? { ...step, status: newStatus } : step
        )
    );
  };
  
  const handleOpenAddStepModal = () => {
    if (!canAddAdvancedStep) {
        showNotification({ type: 'warning', title: t.unauthorized, subtitle: t.unauthorized_add_step });
        return;
    }
    setIsAddStepModalOpen(true);
  };

  const handleSaveNewStep = () => {
    try {
        if (!newStepData.step.trim() || !newStepData.goal.trim()) {
            showNotification({ type: 'warning', title: t.incomplete_data, subtitle: t.incomplete_data_add_step });
            return;
        }

        const newStepObject: AdvancedStep = {
            step: newStepData.step,
            goal: newStepData.goal,
            category: newStepData.category,
            R: newStepData.R,
            A: newStepData.A,
            C: newStepData.C,
            I: newStepData.I,
            status: 'لم تبدأ',
            targetDate: newStepData.targetDate || null,
        };

        setAdvancedSteps(prev => [...prev, newStepObject]);
        setIsAddStepModalOpen(false);
        setNewStepData({
            step: '',
            goal: '',
            category: t.stepCategory_operational,
            R: '-',
            A: '-',
            C: '-',
            I: '-',
            targetDate: '',
        });
    } catch (error) {
        showNotification({ type: 'error', title: t.error, subtitle: t.error_add_step });
        console.error("Error saving new step:", error);
    }
  };

  const raciRoles = useMemo(() => [t.raci_org_admin, t.raci_project_manager, t.raci_consultant, t.raci_candidate, t.raci_none], [t]);
  const stepCategories = useMemo(() => [t.stepCategory_operational, t.stepCategory_developmental, t.stepCategory_followup], [t]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    try {
        return new Intl.DateTimeFormat(language, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString));
    } catch (e) {
        return dateString;
    }
  };

  if (!stage) {
    return (
      <div className="text-center">
        <p>{t.stage_not_found}</p>
        <Button onClick={onBack} className="mt-4">{t.go_back}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Button onClick={onBack} variant="secondary">
        <ArrowLeftIcon />
        {t.backToTimeline}
      </Button>
      
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
            <h2 className="text-3xl font-bold text-primary-400">
            {language === 'ar' ? `مرحلة ${stage.name}` : `${t.stage} ${stage.name}`}
            </h2>
            <p className="text-lg text-gray-400">{plan.candidate.name}</p>
        </div>
        <div className="flex items-center gap-4">
            <Button onClick={() => onNavigateToStageDashboard(stageCode)} variant="secondary">
              {t.viewStageDashboard}
            </Button>
            {canCloseStage && (
              <Button onClick={onNavigateToClosure} variant="primary">
                  {t.closeStage}
              </Button>
            )}
        </div>
      </div>
      
      {isReadOnlyForCandidate && (
          <Card className="my-4 bg-amber-900/50 border-amber-500/30 text-amber-300 text-sm p-4">
              {t.evaluationStageReadOnlyMessage}
          </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-xl font-semibold text-white mb-4">{t.tasks}</h3>
            <div className="overflow-x-auto">
              {milestones.length > 0 ? (
                <table className="w-full text-sm text-left rtl:text-right text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                    <tr>
                      <th scope="col" className="px-6 py-3">{t.task_name}</th>
                      <th scope="col" className="px-6 py-3">{t.owner}</th>
                      <th scope="col" className="px-6 py-3">{t.duration}</th>
                      <th scope="col" className="px-6 py-3">{t.template}</th>
                      <th scope="col" className="px-6 py-3">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.map(milestone => (
                      <tr key={milestone.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                        <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{milestone.title}</th>
                        <td className="px-6 py-4">{userMap.get(milestone.ownerId || "") || t.no_owner}</td>
                        <td className="px-6 py-4">{milestone.duration ? `${milestone.duration} ${t.days}` : '-'}</td>
                        <td className="px-6 py-4">
                          {milestone.templateLink ? (
                            <a href={milestone.templateLink} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-500 hover:underline">{t.view_template}</a>
                          ) : t.no_template}
                        </td>
                        <td className="px-6 py-4">
                          <Select
                            options={statusOptions}
                            value={milestone.status}
                            onChange={(e) => handleStatusChange(milestone.id, e.target.value as TaskStatus)}
                            disabled={isReadOnlyForCandidate}
                            className={`!py-1.5 !text-xs !ring-0 !border-gray-600 ${getStatusColorClass(milestone.status)}`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : stage?.default_tasks && stage.default_tasks.length > 0 ? (
                <ul className="space-y-3 p-4">
                  {stage.default_tasks.map((taskTitle, index) => (
                    <li key={index} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-md">
                      <div className="w-2 h-2 bg-gray-600 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-300">{taskTitle}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">{t.noTasksForStage}</p>
              )}
            </div>
          </Card>
          
          <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">{t.advancedStageManagement}</h3>
                {canAddAdvancedStep && (
                    <Button onClick={handleOpenAddStepModal} variant="secondary" size="sm" className="!p-2 opacity-80 hover:opacity-100">
                        <PlusIcon />
                    </Button>
                )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left rtl:text-right text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3">{t.step}</th>
                    <th className="px-4 py-3">{t.goal}</th>
                    <th className="px-2 py-3 text-center">R</th>
                    <th className="px-2 py-3 text-center">A</th>
                    <th className="px-2 py-3 text-center">C</th>
                    <th className="px-2 py-3 text-center">I</th>
                    <th className="px-4 py-3">{t.status}</th>
                    <th className="px-4 py-3">{t.alert}</th>
                    <th className="px-4 py-3">{t.category}</th>
                    <th className="px-4 py-3">{t.targetDate}</th>
                  </tr>
                </thead>
                <tbody>
                  {advancedSteps.map(step => (
                      <tr key={step.step} className="border-b border-gray-700 hover:bg-gray-800/50">
                          <td className="px-4 py-2 font-medium text-white">{step.step}</td>
                          <td className="px-4 py-2">{step.goal}</td>
                          <td className="px-2 py-2 text-center text-xs">{step.R}</td>
                          <td className="px-2 py-2 text-center text-xs">{step.A}</td>
                          <td className="px-2 py-2 text-center text-xs">{step.C}</td>
                          <td className="px-2 py-2 text-center text-xs">{step.I}</td>
                          <td className="px-4 py-2 w-32">
                              <Select
                                  options={advancedStatusOptions}
                                  value={step.status}
                                  onChange={(e) => handleAdvancedStatusChange(step.step, e.target.value as AdvancedStepStatus)}
                                  className="!py-1 !text-xs !ring-0 !border-gray-600"
                              />
                          </td>
                          <td className="px-4 py-2">
                              {step.status !== 'مكتملة' && (
                                  <Button onClick={() => notifyAdvancedStep(step.step)} size="sm" variant="secondary">{t.send}</Button>
                              )}
                          </td>
                          <td className="px-4 py-2">{step.category}</td>
                          <td className="px-4 py-2">{formatDate(step.targetDate)}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-xl font-semibold text-white mb-4">{t.stageClosure_lessonsLearned}</h3>
            <textarea
                value={lessonsLearned}
                onChange={e => setLessonsLearned(e.target.value)}
                rows={4}
                className="block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder={t.lessonsLearnedPlaceholder}
            />
          </Card>
          
          <Card>
            <h3 className="text-xl font-semibold text-white mb-4">{t.evaluateStageExperience}</h3>
             <div className="flex justify-center items-center gap-2">
                <div className="flex gap-2 bg-gray-900/50 p-2 rounded-lg">
                    <button onClick={() => setExperienceSentiment('positive')} className={`p-2 rounded-lg transition-colors ${experienceSentiment === 'positive' ? 'bg-green-500/30' : 'hover:bg-gray-700'}`} aria-label="Positive"><SentimentPositiveIcon /></button>
                    <button onClick={() => setExperienceSentiment('neutral')} className={`p-2 rounded-lg transition-colors ${experienceSentiment === 'neutral' ? 'bg-yellow-500/30' : 'hover:bg-gray-700'}`} aria-label="Neutral"><SentimentNeutralIcon /></button>
                    <button onClick={() => setExperienceSentiment('negative')} className={`p-2 rounded-lg transition-colors ${experienceSentiment === 'negative' ? 'bg-red-500/30' : 'hover:bg-gray-700'}`} aria-label="Negative"><SentimentNegativeIcon /></button>
                </div>
            </div>
          </Card>
          
        </div>

        <div className="space-y-6">
          <StageSummaryCard stageCode={stage.code} t={t} />
          <CompletionTimelineCard plan={plan} t={t} />
          <RemainingTasksCard plan={plan} allUsers={allUsers} t={t} />
          <ReflectionLogView
              stage={stage}
              logs={stageLogs}
              allUsers={allUsers}
              currentUser={currentUser}
              orgId={plan.orgId}
              onAddLog={onAddReflectionLog}
              t={t}
              language={language}
              disabled={isReadOnlyForCandidate}
          />
        </div>
      </div>
       {activeRole === 'CANDIDATE' && (
        <div className="flex justify-end mt-4">
            <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 shadow-lg font-semibold transition-all transform hover:scale-105"
                onClick={onNavigateToLearningExperience}
            >
                <span className="text-xl mr-2 rtl:mr-0 rtl:ml-2" role="img" aria-label="graduation cap">🎓</span>
                الأنشطة التعليمية والمهمات التفاعلية
            </Button>
        </div>
      )}
      
      {showEvaluationButton && (
        <button 
          onClick={() => onStartSurvey(stageCode, {
            title: t.evaluateBuildingPhase,
            description: t.surveyBuildingPhaseDescription,
          })} 
          className="smart-action-button animate-fade-in-up"
        >
          {t.evaluateBuildingPhase}
        </button>
      )}

      <Modal isOpen={isAddStepModalOpen} onClose={() => setIsAddStepModalOpen(false)} title={t.addAdvancedStepTitle}>
        <div className="space-y-4 text-gray-300">
            <div>
                <label className="block text-sm font-medium">{t.step}</label>
                <input type="text" value={newStepData.step} onChange={e => setNewStepData({...newStepData, step: e.target.value})} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium">{t.goal}</label>
                <input type="text" value={newStepData.goal} onChange={e => setNewStepData({...newStepData, goal: e.target.value})} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium">{t.stepCategory}</label>
                <Select options={stepCategories.map(c => ({label: c, value: c}))} value={newStepData.category} onChange={e => setNewStepData({...newStepData, category: e.target.value})} className="mt-1" />
            </div>
            <div>
                <label className="block text-sm font-medium">{t.targetCompletionDate}</label>
                <input type="date" value={newStepData.targetDate} onChange={e => setNewStepData({...newStepData, targetDate: e.target.value})} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium">R</label>
                    <Select options={raciRoles.map(r => ({label: r, value: r}))} value={newStepData.R} onChange={e => setNewStepData({...newStepData, R: e.target.value})} className="mt-1" />
                </div>
                 <div>
                    <label className="block text-sm font-medium">A</label>
                    <Select options={raciRoles.map(r => ({label: r, value: r}))} value={newStepData.A} onChange={e => setNewStepData({...newStepData, A: e.target.value})} className="mt-1" />
                </div>
                 <div>
                    <label className="block text-sm font-medium">C</label>
                    <Select options={raciRoles.map(r => ({label: r, value: r}))} value={newStepData.C} onChange={e => setNewStepData({...newStepData, C: e.target.value})} className="mt-1" />
                </div>
                 <div>
                    <label className="block text-sm font-medium">I</label>
                    <Select options={raciRoles.map(r => ({label: r, value: r}))} value={newStepData.I} onChange={e => setNewStepData({...newStepData, I: e.target.value})} className="mt-1" />
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4 pt-4">
                <Button variant="secondary" onClick={() => setIsAddStepModalOpen(false)}>{t.cancel}</Button>
                <Button onClick={handleSaveNewStep}>{t.save}</Button>
            </div>
        </div>
      </Modal>

      <StageTransitionBar
        currentStageId={stageCode}
        candidateId={plan.candidate.id.toString()}
      />
    </div>
  );
};

export default StageDetailScreen;