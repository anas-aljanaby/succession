import React from 'react';
import type { CandidatesState, Translations } from '../../types';
import { Button } from '../common/Button';
import { Select } from '../common/Select';

interface CandidateFiltersProps {
  filters: CandidatesState['filters'];
  onFilterChange: (filters: Partial<CandidatesState['filters']>) => void;
  departments: string[];
  t: Translations;
}

export const CandidateFilters: React.FC<CandidateFiltersProps> = ({ filters, onFilterChange, departments, t }) => {

  const statusOptions = [
    { value: 'active', label: t.active },
    { value: 'paused', label: t.paused },
    { value: 'completed', label: t.completed },
    { value: 'archived', label: t.archived },
  ];

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg flex flex-wrap items-center gap-4">
      <input
        type="text"
        placeholder={t.searchByNameOrPosition}
        value={filters.search}
        onChange={(e) => onFilterChange({ search: e.target.value })}
        className="flex-grow bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
      />
      <div className="w-full sm:w-auto min-w-[150px]">
        <Select
          options={statusOptions}
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ status: e.target.value as any || undefined })}
          placeholder={t.filterByStatus}
        />
      </div>
      <div className="w-full sm:w-auto min-w-[150px]">
        <Select
          options={departments.map(d => ({ value: d, label: d }))}
          value={filters.department || ''}
          onChange={(e) => onFilterChange({ department: e.target.value || undefined })}
          placeholder={t.filterByDepartment}
        />
      </div>
       <Button
        variant="secondary"
        onClick={() => onFilterChange({ search: '', status: undefined, department: undefined })}
        >
        {t.clearFilters}
       </Button>
    </div>
  );
};
