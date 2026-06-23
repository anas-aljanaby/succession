import React, { useMemo } from 'react';
import type { Candidate, CandidatesState, SuccessionPlan, SuccessionJourneyStage, Translations } from '../../types';
import { CandidateFilters } from './CandidateFilters';
import { CandidateCard } from './CandidateCard';
import { CandidateForm } from './CandidateForm';
import { Button } from '../common/Button';
import { PlusIcon } from '../icons/PlusIcon';
import { ProgressBar } from '../common/ProgressBar';

const ViewGridIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25v2.25A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" /></svg>;
const ViewListIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;

interface CandidatesManagementProps {
  candidatesState: CandidatesState;
  setCandidatesState: React.Dispatch<React.SetStateAction<CandidatesState>>;
  plans: SuccessionPlan[];
  stages: SuccessionJourneyStage[];
  t: Translations;
  onSave: (candidate: Omit<Candidate, 'id'>) => void;
  onDelete: (candidateId: string) => void;
  onViewPlan: (planId: number) => void;
  onMonitorJourney: (planId: number) => void;
  onCreatePlan: (candidateId: string) => void;
}

const statusBg: Record<Candidate['status'], { bg: string, text_color: string }> = {
    active: { bg: 'bg-green-500/10', text_color: 'text-green-400' },
    paused: { bg: 'bg-yellow-500/10', text_color: 'text-yellow-400' },
    completed: { bg: 'bg-blue-500/10', text_color: 'text-blue-400' },
    archived: { bg: 'bg-gray-500/10', text_color: 'text-gray-400' },
};

const getStatusText = (statusKey: Candidate['status'], t: Translations): string => {
    const map: Record<Candidate['status'], string> = { active: t.active, paused: t.paused, completed: t.completed, archived: t.archived };
    return map[statusKey];
};


const CandidatesManagement: React.FC<CandidatesManagementProps> = (props) => {
  const { candidatesState, setCandidatesState, plans, stages, t, onSave, onDelete, onViewPlan, onMonitorJourney, onCreatePlan } = props;

  const handleFilterChange = (newFilters: Partial<CandidatesState['filters']>) => {
    setCandidatesState(prev => ({ ...prev, filters: { ...prev.filters, ...newFilters }}));
  };

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setCandidatesState(prev => ({ ...prev, viewMode: mode }));
  };
  
  const handleOpenForm = (candidate: Candidate | null) => {
    setCandidatesState(prev => ({ ...prev, isFormOpen: true, editingCandidate: candidate }));
  };

  const filteredCandidates = useMemo(() => {
    const { candidates, filters } = candidatesState;
    return candidates.filter(c => {
      const searchLower = filters.search.toLowerCase();
      const nameMatch = c.name.toLowerCase().includes(searchLower);
      const positionMatch = c.targetPosition.toLowerCase().includes(searchLower);
      const statusMatch = filters.status ? c.status === filters.status : true;
      const departmentMatch = filters.department ? c.department === filters.department : true;
      return (nameMatch || positionMatch) && statusMatch && departmentMatch;
    });
  }, [candidatesState]);

  const allDepartments = useMemo(() => {
    return [...new Set(candidatesState.candidates.map(c => c.department))];
  }, [candidatesState.candidates]);

  const getStageName = (planId?: number) => {
    if (!planId) return 'N/A';
    const plan = plans.find(p => p.id === planId);
    if (!plan) return 'N/A';
    const currentMilestone = plan.journey.find(m => m.status !== 'Completed');
    if (!currentMilestone) return stages[stages.length - 1]?.name || 'Completed';
    return stages.find(s => s.code === currentMilestone.stageCode)?.name || 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-white">{t.candidatesManagement}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-lg">
            <button onClick={() => handleViewModeChange('grid')} className={`p-2 rounded-md ${candidatesState.viewMode === 'grid' ? 'bg-primary-500' : ''}`}><ViewGridIcon /></button>
            <button onClick={() => handleViewModeChange('table')} className={`p-2 rounded-md ${candidatesState.viewMode === 'table' ? 'bg-primary-500' : ''}`}><ViewListIcon /></button>
          </div>
          <Button onClick={() => handleOpenForm(null)}>
            <PlusIcon />
            {t.addCandidate}
          </Button>
        </div>
      </div>

      <CandidateFilters
        filters={candidatesState.filters}
        onFilterChange={handleFilterChange}
        departments={allDepartments}
        t={t}
      />

      {candidatesState.viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCandidates.map(c => (
            <CandidateCard
                key={c.id}
                candidate={c}
                t={t}
                onViewPlan={() => c.planId && onViewPlan(c.planId)}
                onMonitorJourney={() => c.planId && onMonitorJourney(c.planId)}
                onCreatePlan={() => onCreatePlan(c.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
                <thead className="bg-gray-900/50">
                    <tr>
                        <th className="p-4 text-sm font-semibold text-gray-400">{t.candidateName}</th>
                        <th className="p-4 text-sm font-semibold text-gray-400">{t.targetPosition}</th>
                        <th className="p-4 text-sm font-semibold text-gray-400">{t.currentStage}</th>
                        <th className="p-4 text-sm font-semibold text-gray-400">{t.completionPercentage}</th>
                        <th className="p-4 text-sm font-semibold text-gray-400">{t.status}</th>
                        <th className="p-4 text-sm font-semibold text-gray-400">{t.actions}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {filteredCandidates.map(c => {
                        const status = statusBg[c.status];
                        return (
                            <tr key={c.id} className="hover:bg-gray-800/40">
                                <td className="p-4 whitespace-nowrap text-white font-medium flex items-center gap-3">
                                    <img src={c.profileImage || `https://ui-avatars.com/api/?name=${c.name}&background=374151&color=fff`} alt={c.name} className="w-8 h-8 rounded-full object-cover"/>
                                    {c.name}
                                </td>
                                <td className="p-4 whitespace-nowrap text-gray-300">{c.targetPosition}</td>
                                <td className="p-4 whitespace-nowrap text-gray-400">{getStageName(c.planId)}</td>
                                <td className="p-4 whitespace-nowrap"><ProgressBar progress={c.journeyProgress} /></td>
                                <td className="p-4 whitespace-nowrap">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${status.bg} ${status.text_color}`}>{getStatusText(c.status, t)}</span>
                                </td>
                                <td className="p-4 whitespace-nowrap space-x-2 rtl:space-x-reverse">
                                    {c.planId ? (
                                        <>
                                            <Button onClick={() => onViewPlan(c.planId!)} variant="secondary" size="sm">{t.viewPlan}</Button>
                                            <Button onClick={() => onMonitorJourney(c.planId!)} variant="secondary" size="sm">{t.monitorJourney}</Button>
                                        </>
                                    ) : (
                                        <Button onClick={() => onCreatePlan(c.id)} size="sm">{t.createPlan}</Button>
                                    )}
                                    <Button onClick={() => handleOpenForm(c)} variant="secondary" size="sm">{t.edit}</Button>
                                    <Button onClick={() => onDelete(c.id)} variant="secondary" size="sm" className="hover:!bg-red-500/20 hover:!text-red-400">{t.delete}</Button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
          </div>
        </div>
      )}

      <CandidateForm
        isOpen={candidatesState.isFormOpen}
        onClose={() => setCandidatesState(prev => ({ ...prev, isFormOpen: false, editingCandidate: null }))}
        onSave={onSave}
        editingCandidate={candidatesState.editingCandidate}
        t={t}
      />
    </div>
  );
};

export default CandidatesManagement;
