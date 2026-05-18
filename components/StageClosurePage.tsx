
import React, { useState, useMemo, useEffect } from 'react';
import type { SuccessionPlan, Organization, Translations, UserRole, User, InstitutionalConfirmationData, ToastData, ReflectionLog } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { generateGapAnalysis, generateNextStageRecommendations } from '../services/geminiService';
import { Spinner } from './common/Spinner';
import { getClosureType, validateIndividualClosure, validateInstitutionalStageClosure } from '../services/hybridClosureFlowController';
import { StatusBadge } from './common/StatusBadge';
import { calculateStageDuration } from '../services/durationEstimator';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { TrendingDownIcon } from './icons/TrendingDownIcon';
import { ScaleIcon } from './icons/ScaleIcon';
import { usePermissions } from '../lib/permissions/PermissionContext';
import { PERMISSIONS } from '../lib/permissions/roles';

// --- START: Inlined Icon Components (lucide-react style) ---
const FileDownIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);
const BriefcaseIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
);
const UserCircleIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const ArchiveBoxIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
);
const LightBulbIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${className} text-yellow-400`}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 3 2 5 2 7h10c0-2 2-4 2-7a7 7 0 0 0-7-7Z"/></svg>
);
const PencilSquareIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /><path d="M15 5l4 4" /></svg>
);
const SparklesIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 21l1.9-5.8 5.8-1.9-5.8-1.9L12 3z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);
const Building2: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
    </svg>
);
// --- END: Inlined Icon Components ---

interface StageClosurePageProps {
  plan: SuccessionPlan;
  organization: Organization;
  stageCode: string;
  t: Translations;
  onBack: () => void;
  currentUser: User;
  activeRole: UserRole | null;
  onConfirmClosure: (stageCode: string, lessonsLearned: string, finalRating: number, processRatings: { clarity: number; resources: number; feedback: number }, signatures: { [key: string]: string | null }, institutionalConfirmation: InstitutionalConfirmationData) => void;
  onUpdatePlan: (plan: SuccessionPlan) => void;
  showNotification: (toastData: Omit<ToastData, 'id'>) => void;
  allPlans: SuccessionPlan[];
  reflectionLogs: ReflectionLog[];
}

const StarIconRating: React.FC<{ filled: boolean; onClick?: () => void; disabled?: boolean }> = ({ filled, onClick, disabled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-8 w-8 transition-all duration-200 ${filled ? 'text-amber-400 scale-110' : 'text-gray-600'} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:text-amber-400/50 hover:scale-125'}`} onClick={disabled ? undefined : onClick}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
    </svg>
);

const RatingBar: React.FC<{ rating: number; onRate: (rating: number) => void; disabled?: boolean }> = ({ rating, onRate, disabled }) => (
    <div className="flex items-center gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map(r => (
            <div key={r} onClick={disabled ? undefined : () => onRate(r)} className={`h-3 flex-1 rounded transition-all ${rating >= r ? 'bg-primary-500' : 'bg-gray-700'} ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-gray-600'}`} />
        ))}
    </div>
);

const PendingRequirements: React.FC<{ requirements: string[], t: Translations }> = ({ requirements, t }) => (
    <Card className="bg-red-900/50 border-red-500/30 mb-4">
        <h4 className="font-semibold text-red-300 mb-2">{t.pendingRequirementsTitle}</h4>
        <ul className="list-disc ps-5 text-red-300 text-sm space-y-1">
            {requirements.map((reqKey, i) => <li key={i}>{t[reqKey] || reqKey}</li>)}
        </ul>
    </Card>
);

const CandidateSnapshot: React.FC<{ plan: SuccessionPlan, t: Translations }> = ({ plan, t }) => (
    <Card className="transition-all duration-300 hover:border-primary-500/30 hover:-translate-y-1">
        <h3 className="text-xl font-semibold text-white mb-4">{t.candidateOverview}</h3>
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="neo-tech-icon"><UserCircleIcon className="h-5 w-5 text-gray-300" /></div>
                <div>
                    <p className="font-semibold text-gray-100">{plan.candidate.name}</p>
                    <p className="text-sm text-gray-400">{plan.candidate.currentRole}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="neo-tech-icon"><BriefcaseIcon className="h-5 w-5 text-gray-300" /></div>
                <div>
                    <p className="font-semibold text-gray-100">{plan.roleTitle}</p>
                    <p className="text-sm text-gray-400">{t.role}</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center pt-4 border-t border-gray-700/50">
                <div className="tooltip-container">
                    <p className="text-2xl font-bold text-primary-400">{plan.readiness}%</p>
                    <p className="text-xs text-gray-400">{t.lriScore}</p>
                    <span className="tooltip-text">{t.tooltip_lri}</span>
                </div>
                <div className="tooltip-container">
                    <p className="text-2xl font-bold text-sky-400">{plan.bvi}%</p>
                    <p className="text-xs text-gray-400">{t.bvi}</p>
                    <span className="tooltip-text">{t.tooltip_bvi}</span>
                </div>
                <div className="tooltip-container">
                    <p className="text-2xl font-bold text-rose-400">{plan.lqm}%</p>
                    <p className="text-xs text-gray-400">{t.lqm}</p>
                    <span className="tooltip-text">{t.tooltip_lqm}</span>
                </div>
            </div>
        </div>
    </Card>
);


const StageClosurePage: React.FC<StageClosurePageProps> = (props) => {
  const { plan, organization, stageCode, t, onBack, onConfirmClosure, currentUser, activeRole, onUpdatePlan, showNotification, allPlans, reflectionLogs } = props;
  const { hasPermission } = usePermissions();
  
  if (!activeRole) {
    return (
        <div className="max-w-xl mx-auto text-center">
            <Card>
                <h3 className="text-xl font-semibold text-red-400 mb-4">{t.error}</h3>
                <p className="text-gray-300">{t.stageClosure_roleContextError}</p>
                <Button onClick={onBack} className="mt-6">{t.backToTimeline}</Button>
            </Card>
        </div>
    );
  }

  const [lessonsLearned, setLessonsLearned] = useState(plan.stageClosureData?.[stageCode]?.lessonsLearned || '');
  const [finalRating, setFinalRating] = useState(plan.stageClosureData?.[stageCode]?.finalRating || 0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [processRatings, setProcessRatings] = useState(plan.stageClosureData?.[stageCode]?.processRatings || { clarity: 0, resources: 0, feedback: 0 });
  const [signatures, setSignatures] = useState<{[key: string]: string | null}>(plan.stageClosureData?.[stageCode]?.signatures || {});
  const [institutionalConfirmation, setInstitutionalConfirmation] = useState<InstitutionalConfirmationData>(plan.stageClosureData?.[stageCode]?.institutionalConfirmation || { expectedResults: '', actualResults: '', gapAnalysis: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingRequirements, setPendingRequirements] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[] | null>(null);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
  
  const stage = useMemo(() => organization.stages.find(s => s.code === stageCode)!, [organization.stages, stageCode]);
  const closureType = useMemo(() => getClosureType(stage), [stage]);
  const isArchived = useMemo(() => plan.closureStatus === 'archived', [plan.closureStatus]);
  const canCloseStage = useMemo(() => hasPermission(PERMISSIONS.CLOSE_STAGE), [hasPermission]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (isArchived) return;
      const currentData = plan.stageClosureData?.[stageCode];
      if (lessonsLearned !== (currentData?.lessonsLearned || '') || finalRating !== (currentData?.finalRating || 0) || JSON.stringify(processRatings) !== JSON.stringify(currentData?.processRatings || { clarity: 0, resources: 0, feedback: 0 }) || JSON.stringify(institutionalConfirmation) !== JSON.stringify(currentData?.institutionalConfirmation || { expectedResults: '', actualResults: '', gapAnalysis: '' })) {
        const newStageData = { ...plan.stageClosureData, [stageCode]: { ...(plan.stageClosureData?.[stageCode] || {}), lessonsLearned, finalRating, processRatings, institutionalConfirmation, signatures }};
        onUpdatePlan({ ...plan, stageClosureData: newStageData });
        showNotification({ type: 'info', title: t.toast_autosave_success, subtitle: 'Your progress is saved automatically.' });
      }
    }, 2000);
    return () => clearTimeout(handler);
  }, [lessonsLearned, finalRating, processRatings, institutionalConfirmation, stageCode, plan, onUpdatePlan, showNotification, t, activeRole, isArchived, signatures]);

  const isSignedBy = (key: string) => !!signatures[key];
  const allSignaturesComplete = useMemo(() => closureType === 'individual' ? true : isSignedBy('candidate') && isSignedBy('consultant') && isSignedBy('orgAdmin'), [signatures, closureType]);

  const handleGenerateAnalysis = async () => { setIsGenerating(true); const analysis = await generateGapAnalysis(institutionalConfirmation.expectedResults, institutionalConfirmation.actualResults, organization.language_pref); setInstitutionalConfirmation(prev => ({ ...prev, gapAnalysis: analysis })); setIsGenerating(false); };
  
  const handleSign = (signatureKey: string) => {
    if (signatures[signatureKey]) return;
    const newSignatures = { ...signatures, [signatureKey]: new Date().toISOString() };
    setSignatures(newSignatures);
    const newStageData = { ...plan.stageClosureData, [stageCode]: { ...(plan.stageClosureData?.[stageCode] || {}), signatures: newSignatures }};
    let updatedPlan = { ...plan, stageClosureData: newStageData };
    if (newSignatures.candidate && newSignatures.consultant && newSignatures.orgAdmin) {
        const institutionalValidation = validateInstitutionalStageClosure(allPlans, plan);
        if (institutionalValidation.isReady) { updatedPlan = { ...updatedPlan, closureStatus: 'readyForReview' as const }; showNotification({ type: 'success', title: t.toast_readyForReview_title, subtitle: t.toast_readyForReview_subtitle.replace('{candidateName}', plan.candidate.name) }); } else { setPendingRequirements(institutionalValidation.pendingRequirements); }
    }
    onUpdatePlan(updatedPlan);
  };
  const handleConfirm = () => {
      setPendingRequirements([]); 
      if (closureType === 'institutional') {
          const validation = validateIndividualClosure(plan, stage);
          if (!validation.isReady) { setPendingRequirements(validation.pendingRequirements); return; }
          if (!allSignaturesComplete) { showNotification({ type: 'warning', title: 'Signatures pending', subtitle: 'All parties must sign before confirmation.' }); return; }
          onBack();
      } else { 
          const validation = validateIndividualClosure(plan, stage);
          if (validation.isReady) { onConfirmClosure(stageCode, lessonsLearned, finalRating, processRatings, signatures, institutionalConfirmation); } else { setPendingRequirements(validation.pendingRequirements); }
      }
  };
  const signatureMap: { key: string, label: string, role: UserRole }[] = [
    { key: 'candidate', label: t.stageClosure_signature_candidate, role: 'CANDIDATE' },
    { key: 'consultant', label: t.stageClosure_signature_consultant, role: 'CONSULTANT' },
    { key: 'orgAdmin', label: t.stageClosure_signature_orgAdmin, role: 'ORGANIZATION_ADMIN' },
  ];

    const previousReadiness = useMemo(() => {
        if (!plan.previousLriAssessment) return plan.readiness;
        const scores = Object.values(plan.previousLriAssessment) as number[];
        if (scores.length === 0) return plan.readiness;
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }, [plan.previousLriAssessment, plan.readiness]);

    const readinessDelta = plan.readiness - previousReadiness;

    const orlsAverageScore = useMemo(() => {
        if (!organization.orlsAssessment) return 0;
        const scores = Object.values(organization.orlsAssessment) as number[];
        const total = scores.reduce((sum, score) => sum + score, 0);
        return scores.length > 0 ? Math.round(total / scores.length) : 0;
    }, [organization.orlsAssessment]);

    const plannedDuration = useMemo(() => calculateStageDuration(stage, orlsAverageScore, plan.readiness), [stage, orlsAverageScore, plan.readiness]);

    const nextStage = useMemo(() => {
        const currentIndex = organization.stages.findIndex(s => s.code === stage.code);
        if (currentIndex > -1 && currentIndex < organization.stages.length - 1) {
            return organization.stages[currentIndex + 1];
        }
        return null;
    }, [organization.stages, stage]);
    
    const handleGenerateRecommendations = async () => {
        if (!nextStage) return;
        setIsGeneratingRecs(true);
        setRecommendations(null);
        const result = await generateNextStageRecommendations(
            plan.candidate.name,
            stage.name,
            nextStage.name,
            lessonsLearned,
            organization.language_pref
        );
        setRecommendations(result);
        setIsGeneratingRecs(false);
    };

  const FinalAssessmentCard = () => (
    <Card>
        <h3 className="flex items-center justify-center gap-3 text-xl font-semibold text-white mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-amber-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 18.18 21.02 17 14.14 22 9.27 15.09 8.26 12 2" /></svg>
            {t.finalRating}
        </h3>
        <div className="flex justify-center mb-6">
            {[1, 2, 3, 4, 5].map(r => (
                <StarIconRating key={r} filled={r <= finalRating} onClick={() => setFinalRating(r)} disabled={isArchived} />
            ))}
        </div>
        <h3 className="flex items-center justify-center gap-3 text-lg font-semibold text-white mb-4 border-t border-gray-700/50 pt-4">{t.stageClosure_processReview}</h3>
        <div className="space-y-3">
            <div>
                <label className="text-sm text-gray-300 block mb-2">{t.stageClosure_clarityOfGoals}</label>
                <RatingBar rating={processRatings.clarity} onRate={(r) => setProcessRatings(p => ({ ...p, clarity: r }))} disabled={isArchived} />
            </div>
            <div>
                <label className="text-sm text-gray-300 block mb-2">{t.stageClosure_resourceQuality}</label>
                <RatingBar rating={processRatings.resources} onRate={(r) => setProcessRatings(p => ({ ...p, resources: r }))} disabled={isArchived} />
            </div>
            <div>
                <label className="text-sm text-gray-300 block mb-2">{t.stageClosure_feedbackEffectiveness}</label>
                <RatingBar rating={processRatings.feedback} onRate={(r) => setProcessRatings(p => ({ ...p, feedback: r }))} disabled={isArchived} />
            </div>
        </div>
    </Card>
  );

  return (
      <div className="space-y-8 animate-fade-in-up">
          <Button onClick={onBack} variant="secondary"><ArrowLeftIcon />{t.backToTimeline}</Button>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">{t.stageClosureTitle.replace('{stageName}', stage.name)}</h2>
            <div className="mt-2 inline-flex items-center gap-2">
                <StatusBadge status={plan.closureStatus} t={t} />
                {plan.closureStatus === 'readyForReview' && <span className="text-sm text-gray-400">{t.stageClosure_pendingFinalApproval}</span>}
            </div>
          </div>
          
          {isArchived && (
            <Card className="bg-gray-900 border-green-500/30 text-center py-8 transition-all duration-300 hover:border-green-400/50 hover:-translate-y-1">
                <ArchiveBoxIcon className="mx-auto h-12 w-12 text-green-400" />
                <p className="mt-4 text-green-300 font-semibold">{t.stageClosure_archivedMessage}</p>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* === RIGHT COLUMN (2/3) === */}
              <div className="lg:col-span-2 space-y-8">
                  {closureType === 'institutional' && (
                      <Card>
                          <h3 className="flex items-center gap-3 text-xl font-semibold text-white mb-4"><Building2 />{t.institutionalConfirmation}</h3>
                          <div className="space-y-4">
                              <div><label htmlFor="expected-results" className="block text-sm font-medium text-gray-300 mb-1">{t.expectedResults}</label><textarea id="expected-results" rows={3} value={institutionalConfirmation.expectedResults} onChange={e => setInstitutionalConfirmation(p => ({ ...p, expectedResults: e.target.value }))} className="block w-full bg-gray-700/80 border border-gray-600 rounded-md text-white focus:ring-primary-500 focus:border-primary-500" disabled={isArchived}></textarea></div>
                              <div><label htmlFor="actual-results" className="block text-sm font-medium text-gray-300 mb-1">{t.actualResults}</label><textarea id="actual-results" rows={3} value={institutionalConfirmation.actualResults} onChange={e => setInstitutionalConfirmation(p => ({ ...p, actualResults: e.target.value }))} className="block w-full bg-gray-700/80 border border-gray-600 rounded-md text-white focus:ring-primary-500 focus:border-primary-500" disabled={isArchived}></textarea></div>
                              <div><label htmlFor="gap-analysis" className="block text-sm font-medium text-gray-300 mb-1">{t.gapAnalysis}</label><div className="relative"><textarea id="gap-analysis" rows={4} value={institutionalConfirmation.gapAnalysis} onChange={e => setInstitutionalConfirmation(p => ({ ...p, gapAnalysis: e.target.value }))} className="block w-full bg-gray-700/80 border border-gray-600 rounded-md text-white focus:ring-primary-500 focus:border-primary-500" disabled={isArchived}></textarea><Button onClick={handleGenerateAnalysis} variant="secondary" size="sm" className="absolute bottom-2 right-2 rtl:right-auto rtl:left-2" disabled={isGenerating || isArchived}>{isGenerating ? <Spinner/> : <SparklesIcon />}{isGenerating ? t.generatingAnalysis : t.generateAnalysis}</Button></div></div>
                          </div>
                      </Card>
                  )}
                  <Card>
                    <h3 className="flex items-center gap-3 text-xl font-semibold text-white mb-4"><LightBulbIcon className="h-6 w-6" />{t.stageClosure_lessonsLearned}</h3>
                    <textarea rows={5} placeholder={t.lessonsLearnedPlaceholder} value={lessonsLearned} onChange={(e) => setLessonsLearned(e.target.value)} className="block w-full bg-gray-700/80 border border-gray-600 rounded-md text-white focus:ring-primary-500 focus:border-primary-500" disabled={isArchived} />
                  </Card>
                   {closureType === 'institutional' && (
                    <Card>
                        <h3 className="flex items-center gap-3 text-xl font-semibold text-white mb-4"><PencilSquareIcon className="h-6 w-6 text-primary-400" />{t.stageClosure_signatures}</h3>
                        <div className="space-y-3">
                            {signatureMap.map(({ key, label, role }) => (
                                <div key={key} className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-200">{label}</p>
                                        <p className="text-xs text-gray-500">{isSignedBy(key) ? `${t.stageClosure_signedOn} ${new Date(signatures[key]!).toLocaleDateString()}` : t.stageClosure_signaturePending}</p>
                                    </div>
                                    <Button onClick={() => handleSign(key)} size="sm" disabled={isArchived || activeRole !== role || isSignedBy(key)}>
                                        {isSignedBy(key) ? t.stageClosure_signed : t.stageClosure_signNow}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                  )}
              </div>

              {/* === LEFT COLUMN (1/3) === */}
              <div className="lg:col-span-1 space-y-8">
                  <CandidateSnapshot plan={plan} t={t} />
                  <FinalAssessmentCard />
                  {!isArchived && canCloseStage && (
                      <Card>
                          <h3 className="text-xl font-semibold text-white mb-4">تأكيد إغلاق المرحلة</h3>
                          {pendingRequirements.length > 0 && (<PendingRequirements requirements={pendingRequirements} t={t} />)}
                          <div className="flex flex-col gap-4 pt-4 mt-4 border-t border-gray-700">
                              <div className="flex items-center justify-center">
                                  <input id="confirm-closure" type="checkbox" checked={isConfirmed} onChange={(e) => setIsConfirmed(e.target.checked)} className="h-4 w-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500" />
                                  <label htmlFor="confirm-closure" className="ms-2 text-sm text-gray-300">{t.confirmClosure}</label>
                              </div>
                              <Button onClick={handleConfirm} disabled={!isConfirmed}>
                                  {t.confirmAndCloseStage}
                              </Button>
                              <Button variant="secondary" onClick={() => alert('Export functionality is a future feature.')}>
                                  <FileDownIcon />{t.stageClosure_exportSummary}
                              </Button>
                          </div>
                      </Card>
                  )}
              </div>
          </div>
           {/* Restored bottom section */}
          <div className="mt-8 pt-8 border-t border-gray-700/50 grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="h-full">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-white">{t.kpi}</h3>
                        <TrendingUpIcon className="h-6 w-6 text-gray-500"/>
                    </div>
                    <p className="text-sm text-gray-400">{t.finalReadinessDelta}</p>
                    <div className="flex flex-col items-center justify-center my-6">
                        <span className={`text-6xl font-bold flex items-center gap-2 ${readinessDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {readinessDelta >= 0 ? `+${readinessDelta}` : readinessDelta}%
                            {readinessDelta >= 0 ? <TrendingUpIcon className="w-12 h-12"/> : <TrendingDownIcon className="w-12 h-12"/>}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 text-center">{t.kpiDescription}</p>
                </Card>
                <Card className="h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">{t.targetVsActual}</h3>
                        <ScaleIcon className="h-6 w-6 text-gray-500"/>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-gray-400">{t.plannedDuration}</p>
                            <p className="text-5xl font-bold text-cyan-400 mt-1">{plannedDuration} <span className="text-2xl font-medium text-gray-400">{t.days}</span></p>
                            <p className="text-xs text-gray-500 mt-1">{t.plannedDurationDescription}</p>
                        </div>
                        <div className="border-t border-gray-700/50"></div>
                        <div>
                            <p className="text-sm text-gray-400">{t.actualDuration}</p>
                            <p className="text-5xl font-bold text-white mt-1">29 <span className="text-2xl font-medium text-gray-400">{t.days}</span></p>
                            <p className="text-xs text-gray-500 mt-1">{t.actualDurationDescription}</p>
                        </div>
                    </div>
                </Card>
                <Card className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">{t.recommendationsForNextStage}</h3>
                        <SparklesIcon className="h-6 w-6 text-gray-500"/>
                    </div>
                    <div className="flex-grow flex flex-col items-center justify-center text-center">
                        {!recommendations && !isGeneratingRecs && (
                            <Button onClick={handleGenerateRecommendations} disabled={!nextStage || isArchived}>
                                {t.generateRecommendations}
                            </Button>
                        )}
                        {isGeneratingRecs && (
                            <div className="flex flex-col items-center">
                                <Spinner />
                                <p className="mt-2 text-sm text-gray-400">{t.generatingRecommendations}</p>
                            </div>
                        )}
                        {recommendations && (
                            <div className="w-full text-left rtl:text-right space-y-2">
                                <ul className="list-disc ps-5 text-sm text-gray-300 space-y-2">
                                    {recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </Card>
          </div>
      </div>
  );
};

export default StageClosurePage;