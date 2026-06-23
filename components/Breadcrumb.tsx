import React, { useMemo } from 'react';
import type { Organization, SuccessionPlan, Translations, UserRole, View } from '../types';
import type { NavigateFn } from '../lib/navigation/types';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  currentView: View;
  activeRole: UserRole | null;
  selectedOrg: Organization | null;
  activePlan: SuccessionPlan | null;
  selectedStageCode: string | null;
  t: Translations;
  navigate: NavigateFn;
  onClearOrg: () => void;
}

const ChevronRight: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-500 flex-shrink-0 rtl:rotate-180">
    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
  </svg>
);

const HomeIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
  </svg>
);

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentView,
  activeRole,
  selectedOrg,
  activePlan,
  selectedStageCode,
  t,
  navigate,
  onClearOrg,
}) => {
  const crumbs = useMemo((): BreadcrumbItem[] => {
    if (activeRole !== 'CONSULTANT') return [];

    const items: BreadcrumbItem[] = [];

    const goHome = () => {
      onClearOrg();
      navigate('consulting-house-dashboard', { clearPlan: true, clearStage: true });
    };

    items.push({ label: t.home || 'Home', onClick: goHome });

    // Organization management views
    if (['organizations-list', 'organization-details', 'organization-form'].includes(currentView)) {
      if (currentView === 'organizations-list') {
        items.push({ label: t.manageOrganizations });
      } else {
        items.push({ label: t.manageOrganizations, onClick: () => navigate('organizations-list') });
        if (currentView === 'organization-details' && selectedOrg) {
          items.push({ label: selectedOrg.name });
        }
        if (currentView === 'organization-form') {
          items.push({ label: t.addOrganization || 'Add / Edit' });
        }
      }
      return items;
    }

    // If we're in the consulting-house-dashboard, that IS home — no extra crumbs
    if (currentView === 'consulting-house-dashboard') {
      // Home is the current page, remove the onClick to make it non-clickable
      items[0] = { label: t.home || 'Home' };
      return items;
    }

    // Consultant-dashboard is now part of home, but keep for legacy
    if (currentView === 'consultant-dashboard') {
      items[0] = { label: t.home || 'Home' };
      return items;
    }

    // Everything below requires a selected org
    if (!selectedOrg) return items;

    // Org-level views
    const goToOrgDashboard = () => navigate('dashboard', { clearPlan: true, clearStage: true });

    if (['dashboard', 'planner', 'plan-creation-wizard', 'candidates-management'].includes(currentView)) {
      if (currentView === 'dashboard') {
        items.push({ label: selectedOrg.name });
      } else if (currentView === 'candidates-management') {
        items.push({ label: selectedOrg.name, onClick: goToOrgDashboard });
        items.push({ label: t.candidates });
      } else if (currentView === 'planner' || currentView === 'plan-creation-wizard') {
        items.push({ label: selectedOrg.name, onClick: goToOrgDashboard });
        items.push({ label: t.createPlan || 'Create Plan' });
      }
      return items;
    }

    // Candidate-level views — always show org > candidates in the trail
    const candidateName = activePlan?.candidate?.name;
    const goToCandidates = () => navigate('candidates-management', { clearPlan: true, clearStage: true });

    if (['candidate-plan', 'monitor', 'journey-timeline-preview', 'values-dashboard',
         'stage-detail-screen', 'stage-dashboard', 'learning-experience', 'stage-closure',
         'summary-screen'].includes(currentView)) {

      items.push({ label: selectedOrg.name, onClick: goToOrgDashboard });
      items.push({ label: t.candidates, onClick: goToCandidates });

      if (candidateName) {
        // Determine where clicking the candidate name goes
        const goToMonitor = activePlan ? () => navigate('monitor', { planId: activePlan.id }) : undefined;

        if (currentView === 'candidate-plan') {
          items.push({ label: candidateName });
          return items;
        }

        if (currentView === 'monitor') {
          items.push({ label: candidateName });
          return items;
        }

        // Deep journey views — show candidate > current page
        items.push({ label: candidateName, onClick: goToMonitor });

        if (currentView === 'journey-timeline-preview') {
          items.push({ label: t.journeyTimelinePreview || 'Timeline' });
          return items;
        }

        if (currentView === 'values-dashboard') {
          items.push({ label: t.valuesDashboard || 'Values' });
          return items;
        }

        if (currentView === 'summary-screen') {
          items.push({ label: t.summaryScreenTitle || 'Summary' });
          return items;
        }

        // Stage-level views
        const goToTimeline = activePlan
          ? () => navigate('journey-timeline-preview', { planId: activePlan.id })
          : undefined;

        const stageName = selectedStageCode
          ? selectedOrg.stages?.find(s => s.code === selectedStageCode)?.name || selectedStageCode
          : '';

        if (currentView === 'stage-detail-screen') {
          items.push({ label: t.journeyTimelinePreview || 'Timeline', onClick: goToTimeline });
          items.push({ label: stageName });
          return items;
        }

        if (currentView === 'stage-dashboard') {
          items.push({ label: t.journeyTimelinePreview || 'Timeline', onClick: goToTimeline });
          items.push({ label: stageName });
          return items;
        }

        const goToStageDetail = activePlan && selectedStageCode
          ? () => navigate('stage-detail-screen', { stageId: selectedStageCode, planId: activePlan.id })
          : undefined;

        if (currentView === 'learning-experience') {
          items.push({ label: t.journeyTimelinePreview || 'Timeline', onClick: goToTimeline });
          items.push({ label: stageName, onClick: goToStageDetail });
          items.push({ label: t.learningExperienceTitle || 'Learning' });
          return items;
        }

        if (currentView === 'stage-closure') {
          items.push({ label: t.journeyTimelinePreview || 'Timeline', onClick: goToTimeline });
          items.push({ label: stageName, onClick: goToStageDetail });
          items.push({ label: t.stageClosure || 'Stage Closure' });
          return items;
        }
      }
    }

    return items;
  }, [currentView, activeRole, selectedOrg, activePlan, selectedStageCode, t, navigate, onClearOrg]);

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="px-4 sm:px-6 lg:px-8 pt-3">
      <ol className="flex items-center gap-1.5 text-sm flex-wrap">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight />}
              {crumb.onClick && !isLast ? (
                <button
                  onClick={crumb.onClick}
                  className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                >
                  {i === 0 && <HomeIcon />}
                  <span>{crumb.label}</span>
                </button>
              ) : (
                <span className={`flex items-center gap-1 ${isLast ? 'text-white font-medium' : 'text-gray-400'}`}>
                  {i === 0 && <HomeIcon />}
                  <span>{crumb.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
