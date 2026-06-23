import React from 'react';
import type { AppViewRouterContext } from '../viewRouterTypes';
import { ORGANIZATION_VIEWS } from '../../../lib/navigation/types';
import OrganizationsList from '../../organizations/OrganizationsList';
import OrganizationForm from '../../organizations/OrganizationForm';
import OrganizationDetails from '../../organizations/OrganizationDetails';

type OrganizationViewsProps = Pick<
  AppViewRouterContext,
  | 'currentView'
  | 't'
  | 'navigate'
  | 'organizations'
  | 'plans'
  | 'selectedOrg'
  | 'editingOrg'
  | 'setEditingOrg'
  | 'setSelectedOrgId'
  | 'setOrganizations'
  | 'handleSaveOrganization'
  | 'onEnterOrg'
>;

export const OrganizationViews: React.FC<OrganizationViewsProps> = ({
  currentView,
  t,
  navigate,
  organizations,
  plans,
  selectedOrg,
  editingOrg,
  setEditingOrg,
  setSelectedOrgId,
  setOrganizations,
  handleSaveOrganization,
  onEnterOrg,
}) => {
  if (!ORGANIZATION_VIEWS.includes(currentView)) return null;

  if (currentView === 'organizations-list') {
    return (
      <OrganizationsList
        organizations={organizations}
        plans={plans}
        t={t}
        onAdd={() => {
          setEditingOrg(null);
          navigate('organization-form');
        }}
        onEdit={(org) => {
          setEditingOrg(org);
          navigate('organization-form');
        }}
        onView={(org) => {
          setSelectedOrgId(org.id);
          navigate('organization-details');
        }}
        onDelete={(orgId) => setOrganizations(orgs => orgs.filter(o => o.id !== orgId))}
      />
    );
  }

  if (currentView === 'organization-form') {
    return (
      <OrganizationForm
        organization={editingOrg}
        t={t}
        onSave={handleSaveOrganization}
        onCancel={() => navigate('organizations-list')}
      />
    );
  }

  if (currentView === 'organization-details' && selectedOrg) {
    return (
      <OrganizationDetails
        organization={selectedOrg}
        plans={plans.filter(p => p.orgId === selectedOrg.id)}
        t={t}
        onBack={() => {
          navigate('organizations-list');
        }}
        onEdit={(org) => {
          setEditingOrg(org);
          navigate('organization-form');
        }}
        onEnterWorkspace={() => onEnterOrg(selectedOrg.id)}
      />
    );
  }

  return null;
};
