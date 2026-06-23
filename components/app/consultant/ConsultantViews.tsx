import React from 'react';
import type { AppViewRouterContext } from '../viewRouterTypes';
import { CONSULTANT_VIEWS } from '../../../lib/navigation/types';
import ConsultingHouseDashboard from '../../ConsultingHouseDashboard';
import ConsultantDashboard from '../../consultant/ConsultantDashboard';

type ConsultantViewsProps = Pick<
  AppViewRouterContext,
  | 'currentView'
  | 't'
  | 'language'
  | 'organizations'
  | 'localizedPlans'
  | 'reflectionLogs'
  | 'onRunDailyAnalysis'
  | 'handleUpdateOrganization'
  | 'onEnterOrg'
  | 'navigate'
>;

export const ConsultantViews: React.FC<ConsultantViewsProps> = ({
  currentView,
  t,
  language,
  organizations,
  localizedPlans,
  reflectionLogs,
  onRunDailyAnalysis,
  handleUpdateOrganization,
  onEnterOrg,
  navigate,
}) => {
  if (!CONSULTANT_VIEWS.includes(currentView)) return null;

  if (currentView === 'consulting-house-dashboard') {
    return (
      <ConsultingHouseDashboard
        allPlans={localizedPlans}
        allOrganizations={organizations}
        allReflectionLogs={reflectionLogs}
        t={t}
        language={language}
        onRunDailyAnalysis={onRunDailyAnalysis}
        onUpdateOrganization={handleUpdateOrganization}
        onNavigateToOrganizations={() => navigate('organizations-list')}
      />
    );
  }

  if (currentView === 'consultant-dashboard') {
    return (
      <ConsultantDashboard
        allPlans={localizedPlans}
        allOrganizations={organizations}
        t={t}
        onEnterOrg={onEnterOrg}
      />
    );
  }

  return null;
};
