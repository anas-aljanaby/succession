import { mockOrganizations } from '../../constants';

const MOCK_ORG_ID_BY_ROUTE: Record<string, number> = {
  'org-acme': 1,
  'org-gda': 2,
  'org-mubarra': 4,
};

export interface OrgInsightsContent {
  insights: string[];
  recommendations: string[];
}

export function orgInsightsContent(orgId: string): OrgInsightsContent {
  const mockId = MOCK_ORG_ID_BY_ROUTE[orgId];
  const mockOrg = mockOrganizations.find((org) => org.id === mockId);

  return {
    insights: mockOrg?.insight_history ?? [],
    recommendations: mockOrg?.recommendations ?? [],
  };
}
