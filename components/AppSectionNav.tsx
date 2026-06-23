import React, { useMemo } from 'react';
import type { Translations, UserRole, View } from '../types';
import { Button } from './common/Button';

interface AppSectionNavProps {
  t: Translations;
  activeRole: UserRole | null;
  currentView: View;
  hasSelectedOrganization: boolean;
  selectedOrgName: string | null;
  onNavigate: (view: View) => void;
}

export const AppSectionNav: React.FC<AppSectionNavProps> = ({
  t,
  activeRole,
  currentView,
  hasSelectedOrganization,
  selectedOrgName,
  onNavigate,
}) => {
  const sections = useMemo(() => {
    if (!activeRole) return [];

    if (activeRole === 'CONSULTANT') {
      const items: Array<{ view: View; label: string; group?: string }> = [
        { view: 'consulting-house-dashboard', label: t.home || 'Home' },
        { view: 'organizations-list', label: t.organizations || 'Organizations' },
      ];

      if (hasSelectedOrganization && selectedOrgName) {
        items.push(
          { view: 'dashboard', label: `${selectedOrgName}`, group: 'org' },
          { view: 'candidates-management', label: t.candidates, group: 'org' }
        );
      }

      return items;
    }

    if (activeRole === 'ORGANIZATION_ADMIN' || activeRole === 'HR_MANAGER') {
      return [
        { view: 'dashboard' as View, label: t.dashboard },
        { view: 'candidates-management' as View, label: t.candidates },
      ];
    }

    return [];
  }, [activeRole, hasSelectedOrganization, selectedOrgName, t]);

  if (sections.length === 0) return null;

  const isOrgWorkspaceView = ['dashboard', 'candidates-management', 'planner', 'plan-creation-wizard'].includes(currentView);
  const isCandidateJourneyView = ['monitor', 'candidate-plan', 'journey-timeline-preview', 'values-dashboard',
    'stage-detail-screen', 'stage-dashboard', 'summary-screen', 'learning-experience', 'stage-closure'].includes(currentView);

  return (
    <nav className="px-4 sm:px-6 lg:px-8 border-b border-gray-700/60">
      <div className="flex flex-wrap gap-1">
        {sections.map((section) => {
          let isActive = currentView === section.view;
          if (section.view === 'dashboard' && (isOrgWorkspaceView || isCandidateJourneyView) && currentView !== 'candidates-management') {
            isActive = true;
          }
          if (section.view === 'candidates-management' && isCandidateJourneyView) {
            isActive = true;
          }
          if (section.view === 'organizations-list' && ['organization-details', 'organization-form'].includes(currentView)) {
            isActive = true;
          }

          return (
            <button
              key={section.view}
              onClick={() => onNavigate(section.view)}
              className={[
                'relative px-4 py-3 text-sm font-semibold transition-colors focus:outline-none',
                isActive
                  ? 'text-white after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-primary-500 after:rounded-t'
                  : 'text-gray-400 hover:text-gray-200',
              ].join(' ')}
            >
              {section.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
