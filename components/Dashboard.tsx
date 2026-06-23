import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { SuccessionPlan, Translations, Organization, UserRole, DevelopmentRecommendation, Candidate, CriticalFunction } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { PlusIcon } from './icons/PlusIcon';
import StageManager from './StageManager';
import { OrlsAssessmentView } from './OrlsAssessmentView';
import InsightHistoryView from './InsightHistoryView';
import RecommendationsView from './RecommendationsView';
import { ToggleSwitch } from './common/ToggleSwitch';
import { SparklesIcon } from './icons/SparklesIcon';
import DonutChart from './common/DonutChart';
import { improvementAreas } from '../constants';
import StageClosureDashboard from './StageClosureDashboard';
import { usePermissions } from '../lib/permissions/PermissionContext';
import { PERMISSIONS } from '../lib/permissions/roles';
import { ProtectedComponent } from '../lib/permissions/ProtectedComponent';
import { Modal } from './common/Modal';

interface DashboardProps {
  plans: SuccessionPlan[];
  organization: Organization;
  t: Translations;
  viewPlan: (plan: SuccessionPlan) => void;
  createPlan: () => void;
  onUpdateOrganization: (org: Organization) => void;
  activeRole: UserRole | null;
  onApproveClosure: (planId: number) => void;
  onReturnClosure: (planId: number) => void;
  processingPlanIds: Set<number>;
  candidates: Candidate[];
  onNavigateToCandidates: () => void;
  onNavigateToPlanWizard: (candidateId?: string) => void;
}

// --- Icons ---
const BriefcaseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
  </svg>
);

const UserPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
  </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className || "w-4 h-4"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


// --- Critical function helpers ---

function resolveLinkedPlan(
  fn: CriticalFunction,
  candidate: Candidate | undefined,
  plans: SuccessionPlan[]
): SuccessionPlan | undefined {
  if (fn.planId != null) {
    const byFn = plans.find((p) => p.id === fn.planId);
    if (byFn) return byFn;
  }
  if (candidate?.planId != null) {
    const byCandidate = plans.find((p) => p.id === candidate.planId);
    if (byCandidate) return byCandidate;
  }
  if (candidate) {
    const numericId = parseInt(candidate.id.replace('cand-', ''), 10);
    return plans.find(
      (p) => p.candidate.id === numericId || p.candidate.name === candidate.name
    );
  }
  return undefined;
}

function computeFunctionStatus(
  candidate: Candidate | undefined,
  plan: SuccessionPlan | undefined
): CriticalFunction['status'] {
  if (!candidate) return 'vacant';
  if (plan && plan.readiness >= 85) return 'ready';
  return 'in-progress';
}

// --- Sub-components ---

function StatusBadge({ status, t }: { status: CriticalFunction['status']; t: Translations }) {
  const config = {
    vacant: { label: t.statusVacant, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    'in-progress': { label: t.statusInProgress, bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    ready: { label: t.statusReady, bg: 'bg-green-500/10 text-green-400 border-green-500/20' },
  };
  const c = config[status];
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${c.bg}`}>{c.label}</span>;
}

function PriorityDot({ priority }: { priority: CriticalFunction['priority'] }) {
  const colors = { high: 'bg-red-400', medium: 'bg-amber-400', low: 'bg-gray-400' };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[priority]}`} />;
}

// --- Function Form Modal ---
function FunctionFormModal({ isOpen, onClose, onSave, editingFunction, t }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fn: Omit<CriticalFunction, 'id' | 'status'>) => void;
  editingFunction?: CriticalFunction | null;
  t: Translations;
}) {
  const [title, setTitle] = useState(editingFunction?.title || '');
  const [department, setDepartment] = useState(editingFunction?.department || '');
  const [priority, setPriority] = useState<CriticalFunction['priority']>(editingFunction?.priority || 'high');

  useEffect(() => {
    if (!isOpen) return;
    setTitle(editingFunction?.title ?? '');
    setDepartment(editingFunction?.department ?? '');
    setPriority(editingFunction?.priority ?? 'high');
  }, [isOpen, editingFunction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), department: department.trim(), priority });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingFunction ? t.editFunction : t.addFunction}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">{t.functionName}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">{t.functionDepartment}</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">{t.functionPriority}</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as CriticalFunction['priority'])}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="high">{t.priorityHigh}</option>
            <option value="medium">{t.priorityMedium}</option>
            <option value="low">{t.priorityLow}</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>{t.cancel}</Button>
          <Button type="submit">{t.saveFn}</Button>
        </div>
      </form>
    </Modal>
  );
}

// --- Assign Candidate Modal ---
function AssignCandidateModal({ isOpen, onClose, candidates, onAssign, t }: {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  onAssign: (candidateId: string) => void;
  t: Translations;
}) {
  if (!isOpen) return null;
  const available = candidates.filter(c => c.status === 'active');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.assignCandidate}>
      {available.length > 0 ? (
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {available.map(c => (
            <li key={c.id}>
              <button
                onClick={() => { onAssign(c.id); onClose(); }}
                className="w-full text-start p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.currentPosition}</p>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-gray-500 rtl:rotate-180" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>{t.noData}</p>
        </div>
      )}
    </Modal>
  );
}


// --- Critical Function Card ---
function CriticalFunctionCard({ fn, candidate, plan, t, onEdit, onDelete, onAssignCandidate, onUnassign, onViewPlan, onCreatePlan }: {
  fn: CriticalFunction;
  candidate?: Candidate;
  plan?: SuccessionPlan;
  t: Translations;
  onEdit: () => void;
  onDelete: () => void;
  onAssignCandidate: () => void;
  onUnassign: () => void;
  onViewPlan: () => void;
  onCreatePlan: () => void;
}) {
  const readiness = plan?.readiness ?? 0;

  return (
    <div className="rounded-xl border border-white/[.06] bg-gray-800/50 hover:bg-gray-800/80 transition-colors overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center mt-0.5">
              <BriefcaseIcon className="w-5 h-5 text-primary-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{fn.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <PriorityDot priority={fn.priority} />
                <span className="text-xs text-gray-400">{fn.department}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
              <PencilIcon />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors">
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Section */}
      <div className="px-4 pb-4">
        {candidate ? (
          <div className="rounded-lg bg-gray-900/60 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                  {candidate.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{candidate.name}</p>
                  <p className="text-xs text-gray-500">{candidate.currentPosition}</p>
                </div>
              </div>
              <button onClick={onUnassign} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            {plan ? (
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-400">{t.lriScore}</span>
                  <span className="font-medium text-white">{readiness}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${readiness >= 85 ? 'bg-green-500' : readiness >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                    style={{ width: `${readiness}%` }}
                  />
                </div>
                <button onClick={onViewPlan} className="mt-2 w-full text-xs text-center text-primary-400 hover:text-primary-300 font-medium py-1 rounded hover:bg-primary-500/5 transition-colors">
                  {t.viewCandidatePlan} →
                </button>
              </div>
            ) : (
              <Button onClick={onCreatePlan} size="sm" className="w-full mt-1">
                <PlusIcon /> {t.createPlanForCandidate}
              </Button>
            )}
          </div>
        ) : (
          <button
            onClick={onAssignCandidate}
            className="w-full rounded-lg border-2 border-dashed border-gray-600 hover:border-primary-500/50 p-4 flex flex-col items-center gap-2 text-gray-500 hover:text-primary-400 transition-colors"
          >
            <UserPlusIcon className="w-5 h-5" />
            <span className="text-xs font-medium">{t.assignCandidate}</span>
          </button>
        )}
      </div>

      {/* Footer status */}
      <div className="px-4 py-2.5 border-t border-white/[.04] bg-gray-900/30 flex items-center justify-between">
        <StatusBadge status={fn.status} t={t} />
        {fn.priority === 'high' && (
          <span className="text-[10px] uppercase tracking-wider font-semibold text-red-400/70">{t.priorityHigh}</span>
        )}
      </div>
    </div>
  );
}


// --- Main Dashboard ---
const Dashboard: React.FC<DashboardProps> = ({ plans, organization, t, viewPlan, createPlan, onUpdateOrganization, activeRole, onApproveClosure, onReturnClosure, processingPlanIds, candidates, onNavigateToCandidates, onNavigateToPlanWizard }) => {
    const [isEditingStages, setIsEditingStages] = useState(false);
    const [isFunctionFormOpen, setIsFunctionFormOpen] = useState(false);
    const [editingFn, setEditingFn] = useState<CriticalFunction | null>(null);
    const [assigningFnId, setAssigningFnId] = useState<string | null>(null);
    const { hasPermission } = usePermissions();

    const canCreatePlan = hasPermission(PERMISSIONS.CREATE_PLAN);
    const canEditStages = hasPermission(PERMISSIONS.EDIT_PLAN);

    const functions = organization.criticalFunctions || [];

    const avgReadiness = plans.length > 0 ? Math.round(plans.reduce((acc, p) => acc + p.readiness, 0) / plans.length) : 0;
    const successorsReady = plans.filter(p => p.readiness >= 85).length;

    const orlsAverageScore = useMemo(() => {
        if (!organization.orlsAssessment) return 0;
        const scores = Object.values(organization.orlsAssessment) as number[];
        const total = scores.reduce((sum, score) => sum + score, 0);
        return scores.length > 0 ? Math.round(total / scores.length) : 0;
    }, [organization.orlsAssessment]);

    const { avgCri, avgAei } = useMemo(() => {
        const stagesWithMetrics = organization.stages.filter(s => typeof s.cri === 'number' && typeof s.aei === 'number');
        if (stagesWithMetrics.length === 0) return { avgCri: 0, avgAei: 0 };
        const totalCri = stagesWithMetrics.reduce((acc, stage) => acc + stage.cri!, 0);
        const totalAei = stagesWithMetrics.reduce((acc, stage) => acc + stage.aei!, 0);
        return {
            avgCri: Math.round(totalCri / stagesWithMetrics.length),
            avgAei: Math.round(totalAei / stagesWithMetrics.length)
        };
    }, [organization.stages]);

    const handleSaveStages = (updatedStages: Organization['stages']) => {
      onUpdateOrganization({ ...organization, stages: updatedStages });
      setIsEditingStages(false);
    };

    const handleAutopilotToggle = (enabled: boolean) => {
      onUpdateOrganization({ ...organization, auto_pilot_enabled: enabled });
    };

    const { canManageAutopilot, canEnableAutopilot, isConsultingAdmin } = useMemo(() => {
        const isConsultingAdmin = activeRole === 'CONSULTANT';
        const isOrgAdmin = activeRole === 'ORGANIZATION_ADMIN';
        const isReady = orlsAverageScore >= 90;
        return {
          isConsultingAdmin,
          canManageAutopilot: isConsultingAdmin || isOrgAdmin,
          canEnableAutopilot: isConsultingAdmin || isReady,
        };
    }, [activeRole, orlsAverageScore]);

    const improvementThemesData = useMemo(() => {
        const allRecommendations: DevelopmentRecommendation[] = plans.flatMap(p => p.developmentRecommendations || []);
        if (allRecommendations.length === 0) return [];
        const counts = allRecommendations.reduce((acc, rec) => {
            acc[rec.improvementArea] = (acc[rec.improvementArea] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const languageKey = organization.language_pref === 'ar' ? 'name_ar' : 'name_en';
        return Object.entries(counts)
            .map(([key, value]) => ({
                label: improvementAreas.find(area => area.key === key)?.[languageKey] || key,
                value,
            }))
            .sort((a, b) => b.value - a.value);
    }, [plans, organization.language_pref]);

    const canReviewClosures = useMemo(() => hasPermission(PERMISSIONS.APPROVE_STAGE_CLOSURE), [hasPermission]);
    const plansForReview = useMemo(() => plans.filter(p => p.closureStatus === 'readyForReview'), [plans]);

    // --- Function CRUD ---
    const handleSaveFunction = useCallback((data: Omit<CriticalFunction, 'id' | 'status'>) => {
      const updated = [...functions];
      if (editingFn) {
        const idx = updated.findIndex(f => f.id === editingFn.id);
        if (idx > -1) updated[idx] = { ...updated[idx], ...data };
      } else {
        updated.push({
          id: `cf-${Date.now()}`,
          ...data,
          status: 'vacant',
        });
      }
      onUpdateOrganization({ ...organization, criticalFunctions: updated });
      setEditingFn(null);
    }, [functions, editingFn, organization, onUpdateOrganization]);

    const handleDeleteFunction = useCallback((fnId: string) => {
      if (!window.confirm(t.confirmDeleteFunction)) return;
      const updated = functions.filter(f => f.id !== fnId);
      onUpdateOrganization({ ...organization, criticalFunctions: updated });
    }, [functions, organization, onUpdateOrganization, t]);

    const handleAssignCandidate = useCallback((fnId: string, candidateId: string) => {
      const candidate = candidates.find((c) => c.id === candidateId);
      const plan = candidate
        ? plans.find((p) => p.id === candidate.planId) ??
          plans.find(
            (p) =>
              p.candidate.id === parseInt(candidateId.replace('cand-', ''), 10) ||
              p.candidate.name === candidate.name
          )
        : undefined;
      const planId = plan?.id ?? candidate?.planId;
      const status = computeFunctionStatus(candidate, plan);
      const updated = functions.map((f) =>
        f.id === fnId ? { ...f, candidateId, planId, status } : f
      );
      onUpdateOrganization({ ...organization, criticalFunctions: updated });
    }, [functions, candidates, plans, organization, onUpdateOrganization]);

    const handleUnassign = useCallback((fnId: string) => {
      const updated = functions.map(f =>
        f.id === fnId ? { ...f, candidateId: undefined, planId: undefined, status: 'vacant' as const } : f
      );
      onUpdateOrganization({ ...organization, criticalFunctions: updated });
    }, [functions, organization, onUpdateOrganization]);


  return (
    <div className="space-y-8">
      {canReviewClosures && plansForReview.length > 0 && (
        <StageClosureDashboard
          plansForReview={plansForReview}
          t={t}
          onApproveClosure={onApproveClosure}
          onReturnClosure={onReturnClosure}
          processingPlanIds={processingPlanIds}
        />
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-1">{t.dashboard}</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-400 text-sm">
          <span className="font-medium text-gray-300">{organization.name}</span>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <span>{organization.sector}</span>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <span className="flex items-center gap-2">
            {t.maturityLevel}: <span className="font-medium text-gray-300 bg-gray-700 px-2 py-0.5 rounded-md">{t[organization.maturity_level] || organization.maturity_level}</span>
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-xl bg-gray-800/50 border border-white/[.04] p-4 text-center">
          <p className="text-3xl font-bold text-white">{functions.length}</p>
          <p className="text-xs text-gray-400 mt-1">{t.criticalFunctions}</p>
        </div>
        <div className="rounded-xl bg-gray-800/50 border border-white/[.04] p-4 text-center">
          <p className="text-3xl font-bold text-white">{successorsReady}</p>
          <p className="text-xs text-gray-400 mt-1">{t.successorsReady}</p>
        </div>
        <div className="rounded-xl bg-gray-800/50 border border-white/[.04] p-4 text-center">
          <p className="text-3xl font-bold text-white">{avgReadiness}%</p>
          <p className="text-xs text-gray-400 mt-1">{t.avgLriScore}</p>
        </div>
        <div className="rounded-xl bg-gray-800/50 border border-white/[.04] p-4 text-center">
          <p className="text-3xl font-bold text-white">{orlsAverageScore}%</p>
          <p className="text-xs text-gray-400 mt-1">{t.orlsScore}</p>
        </div>
        <div className="rounded-xl bg-gray-800/50 border border-white/[.04] p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{avgCri}%</p>
          <p className="text-xs text-gray-400 mt-1">{t.avgCri}</p>
        </div>
        <div className="rounded-xl bg-gray-800/50 border border-white/[.04] p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{avgAei}%</p>
          <p className="text-xs text-gray-400 mt-1">{t.avgAei}</p>
        </div>
      </div>

      {/* Critical Functions Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">{t.criticalFunctions}</h3>
          </div>
          <div className="flex gap-2">
            {canEditStages && !isEditingStages && (
              <Button onClick={() => setIsEditingStages(true)} variant="secondary" size="sm">
                {t.editStages}
              </Button>
            )}
            <ProtectedComponent permission={PERMISSIONS.CREATE_PLAN}>
              <Button onClick={() => { setEditingFn(null); setIsFunctionFormOpen(true); }} size="sm">
                <PlusIcon /> {t.addFunction}
              </Button>
            </ProtectedComponent>
          </div>
        </div>

        {functions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {functions.map(fn => {
              const candidate = candidates.find(c => c.id === fn.candidateId);
              const plan = resolveLinkedPlan(fn, candidate, plans);
              const displayFn: CriticalFunction = {
                ...fn,
                status: computeFunctionStatus(candidate, plan),
                planId: plan?.id ?? fn.planId,
              };
              return (
                <CriticalFunctionCard
                  key={fn.id}
                  fn={displayFn}
                  candidate={candidate}
                  plan={plan}
                  t={t}
                  onEdit={() => { setEditingFn(fn); setIsFunctionFormOpen(true); }}
                  onDelete={() => handleDeleteFunction(fn.id)}
                  onAssignCandidate={() => setAssigningFnId(fn.id)}
                  onUnassign={() => handleUnassign(fn.id)}
                  onViewPlan={() => plan && viewPlan(plan)}
                  onCreatePlan={() => candidate && onNavigateToPlanWizard(candidate.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-700 p-12 text-center">
            <BriefcaseIcon className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">{t.noFunctionsYet}</p>
            <p className="text-sm text-gray-500 mt-1 mb-4">{t.addFirstFunction}</p>
            <ProtectedComponent permission={PERMISSIONS.CREATE_PLAN}>
              <Button onClick={() => { setEditingFn(null); setIsFunctionFormOpen(true); }}>
                <PlusIcon /> {t.addFunction}
              </Button>
            </ProtectedComponent>
          </div>
        )}
      </div>

      {/* Candidates Quick Access */}
      <Card>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">{t.candidates}</h3>
            <p className="text-sm text-gray-400 mt-1">{t.candidateOverview}</p>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{candidates.length}</p>
              <p className="text-xs text-gray-400">{t.total}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{candidates.filter(c => c.status === 'active').length}</p>
              <p className="text-xs text-gray-400">{t.active}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{candidates.filter(c => c.status === 'completed').length}</p>
              <p className="text-xs text-gray-400">{t.completed}</p>
            </div>
          </div>
          <Button onClick={onNavigateToCandidates}>{t.manageCandidates}</Button>
        </div>
      </Card>

      {/* Insights, Recommendations, Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <InsightHistoryView insights={organization.insight_history || []} t={t} />
            <RecommendationsView recommendations={organization.recommendations || []} t={t} />
        </div>
        <div>
            <Card>
                <h3 className="text-xl font-semibold text-white mb-4">{t.topImprovementThemes}</h3>
                {improvementThemesData.length > 0 ? (
                    <DonutChart data={improvementThemesData} />
                ) : (
                    <div className="text-center py-10 text-gray-500">{t.noData}</div>
                )}
            </Card>
        </div>
      </div>

      {/* Auto-Pilot Manager */}
      {canManageAutopilot && (
        <Card>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-6 h-6 text-primary-400" />
                <h3 className="text-xl font-semibold text-white">{t.autoPilotMode}</h3>
              </div>
              <p className="text-sm text-gray-400 mt-2 max-w-lg">{t.autoPilotDescription}</p>
            </div>
            <div className="flex-shrink-0 text-right rtl:text-left">
              <ToggleSwitch
                enabled={organization.auto_pilot_enabled || false}
                onChange={handleAutopilotToggle}
                disabled={!canEnableAutopilot && !organization.auto_pilot_enabled}
              />
              {!canEnableAutopilot && !organization.auto_pilot_enabled && (
                 <p className="text-xs text-amber-400 mt-2">{t.autoPilotRequirement}</p>
              )}
               {isConsultingAdmin && (
                 <p className="text-xs text-gray-500 mt-2">{t.autoPilotOverride}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Stage Manager */}
      {isEditingStages && canEditStages && (
        <StageManager
          organization={organization}
          onSave={handleSaveStages}
          onCancel={() => setIsEditingStages(false)}
          t={t}
        />
      )}

      {/* Modals */}
      <FunctionFormModal
        isOpen={isFunctionFormOpen}
        onClose={() => { setIsFunctionFormOpen(false); setEditingFn(null); }}
        onSave={handleSaveFunction}
        editingFunction={editingFn}
        t={t}
      />

      <AssignCandidateModal
        isOpen={!!assigningFnId}
        onClose={() => setAssigningFnId(null)}
        candidates={candidates}
        onAssign={(candidateId) => {
          if (assigningFnId) handleAssignCandidate(assigningFnId, candidateId);
        }}
        t={t}
      />
    </div>
  );
};

export default Dashboard;
