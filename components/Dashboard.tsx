import React, { useState, useMemo } from 'react';
import type { SuccessionPlan, Translations, Organization, UserRole, DevelopmentRecommendation, Candidate } from '../types';
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

const Dashboard: React.FC<DashboardProps> = ({ plans, organization, t, viewPlan, createPlan, onUpdateOrganization, activeRole, onApproveClosure, onReturnClosure, processingPlanIds, candidates, onNavigateToCandidates, onNavigateToPlanWizard }) => {
    const [isEditingStages, setIsEditingStages] = useState(false);
    const { hasPermission } = usePermissions();

    const canCreatePlan = hasPermission(PERMISSIONS.CREATE_PLAN);
    const canEditStages = hasPermission(PERMISSIONS.EDIT_PLAN);

    const avgReadiness = plans.length > 0 ? Math.round(plans.reduce((acc, p) => acc + p.readiness, 0) / plans.length) : 0;
    const successorsReady = plans.filter(p => p.readiness >= 85).length;

    const candidateStats = useMemo(() => {
        const active = candidates.filter(c => c.status === 'active').length;
        const completed = candidates.filter(c => c.status === 'completed').length;
        return { total: candidates.length, active, completed };
    }, [candidates]);


    const orlsAverageScore = useMemo(() => {
        if (!organization.orlsAssessment) return 0;
        // Fix: Cast the result of Object.values to number[] to ensure correct type inference for reduce.
        const scores = Object.values(organization.orlsAssessment) as number[];
        const total = scores.reduce((sum, score) => sum + score, 0);
        return scores.length > 0 ? Math.round(total / scores.length) : 0;
    }, [organization.orlsAssessment]);
    
    const { avgCri, avgAei } = useMemo(() => {
        const stagesWithMetrics = organization.stages.filter(s => typeof s.cri === 'number' && typeof s.aei === 'number');
        if (stagesWithMetrics.length === 0) {
            return { avgCri: 0, avgAei: 0 };
        }
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
        // Fix: Explicitly type allRecommendations to help with type inference in the following reduce function.
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
    
    const canReviewClosures = useMemo(() => 
      hasPermission(PERMISSIONS.APPROVE_STAGE_CLOSURE),
    [hasPermission]);

    const plansForReview = useMemo(() =>
      plans.filter(p => p.closureStatus === 'readyForReview'),
    [plans]);


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
      
      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card>
          <h3 className="text-lg font-medium text-gray-400">{t.criticalRoles}</h3>
          <p className="text-4xl font-bold text-white mt-2">{plans.length}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-medium text-gray-400">{t.successorsReady}</h3>
          <p className="text-4xl font-bold text-white mt-2">{successorsReady}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-medium text-gray-400">{t.avgLriScore}</h3>
          <p className="text-4xl font-bold text-white mt-2">{avgReadiness}%</p>
        </Card>
        <Card>
          <h3 className="text-lg font-medium text-gray-400">{t.orlsScore}</h3>
          <p className="text-4xl font-bold text-white mt-2">{orlsAverageScore}%</p>
        </Card>
        <Card>
          <h3 className="text-lg font-medium text-gray-400">{t.avgCri}</h3>
          <p className="text-4xl font-bold text-red-400 mt-2">{avgCri}%</p>
        </Card>
        <Card>
          <h3 className="text-lg font-medium text-gray-400">{t.avgAei}</h3>
          <p className="text-4xl font-bold text-green-400 mt-2">{avgAei}%</p>
        </Card>
      </div>

      {/* Candidate Summary */}
        <Card>
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-white">{t.candidates}</h3>
                    <p className="text-sm text-gray-400 mt-1">{t.candidateOverview}</p>
                </div>
                <div className="flex items-center gap-6 text-center">
                    <div>
                        <p className="text-3xl font-bold text-white">{candidateStats.total}</p>
                        <p className="text-xs text-gray-400">{t.total}</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-green-400">{candidateStats.active}</p>
                        <p className="text-xs text-gray-400">{t.active}</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-blue-400">{candidateStats.completed}</p>
                        <p className="text-xs text-gray-400">{t.completed}</p>
                    </div>
                </div>
                <Button onClick={onNavigateToCandidates}>{t.manageCandidates}</Button>
            </div>
        </Card>


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


      {/* Succession Plans Table */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">{t.successionPlans}</h3>
          <div className="flex gap-4">
            {canEditStages && !isEditingStages && (
                <Button onClick={() => setIsEditingStages(true)} variant="secondary">
                  {t.editStages}
                </Button>
            )}
            <ProtectedComponent permission={PERMISSIONS.CREATE_PLAN}>
              <div className="flex gap-2">
                <Button onClick={createPlan}>
                  <PlusIcon />
                  {t.createNewPlan}
                </Button>
                 <Button onClick={() => onNavigateToPlanWizard()} variant="secondary">
                  <PlusIcon />
                  {t.createNewPlanNewFlow}
                </Button>
              </div>
            </ProtectedComponent>
          </div>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="p-4 text-sm font-semibold text-gray-400">{t.role}</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">{t.candidate}</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">{t.lriScore}</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => (
                  <tr key={plan.id} className="border-b border-gray-700 last:border-b-0">
                    <td className="p-4 whitespace-nowrap text-white">{plan.roleTitle}</td>
                    <td className="p-4 whitespace-nowrap text-gray-400">{plan.candidate.name}</td>
                    <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="w-full bg-gray-600 rounded-full h-2.5">
                                <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${plan.readiness}%` }}></div>
                            </div>
                            <span className="text-sm text-gray-400 ms-3">{plan.readiness}%</span>
                        </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <Button onClick={() => viewPlan(plan)} variant="secondary" size="sm">
                        {t.viewCandidatePlan}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
             {plans.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p>{t.noSuccessionPlansFound}</p>
                    {canCreatePlan && <p>{t.clickToGetStarted.replace('{createNewPlan}', t.createNewPlan)}</p>}
                </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;