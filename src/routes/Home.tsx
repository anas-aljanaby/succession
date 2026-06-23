import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { OrganizationsList } from './OrganizationsList';

// Role-aware landing (spec §4.2 of the build plan):
// - Consultant: portfolio overview (the organizations list).
// - Candidate: their own candidate detail.
// - Other org-scoped roles: their organization dashboard.
export const Home: React.FC = () => {
  const { state } = useApp();
  const { userId, activeRole } = state.session;
  const user = state.users.find((u) => u.id === userId);

  if (activeRole === 'CANDIDATE' && user?.candidateId) {
    const cand = state.candidates.find((c) => c.id === user.candidateId);
    if (cand) {
      return (
        <Navigate
          to={`/organizations/${cand.organizationId}/candidates/${cand.id}`}
          replace
        />
      );
    }
  }

  if (activeRole && activeRole !== 'CONSULTANT' && user?.organizationId) {
    return <Navigate to={`/organizations/${user.organizationId}`} replace />;
  }

  return <OrganizationsList />;
};
