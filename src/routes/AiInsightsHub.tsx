import React from 'react';
import { OrgAiInsightsPicker } from './OrgAiInsights';
import { useAccessibleOrganizations } from '../lib/activeOrg';

export const AiInsightsHub: React.FC = () => {
  const accessibleOrgs = useAccessibleOrganizations();
  return <OrgAiInsightsPicker organizations={accessibleOrgs} />;
};
