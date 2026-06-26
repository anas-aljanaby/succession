import { useLocation } from 'react-router-dom';
import { canAccessOrg } from './permissions';
import { useApp } from '../store/AppContext';

export function useRouteOrgId(): string | null {
  const { pathname } = useLocation();
  const match = pathname.match(/^\/organizations\/([^/]+)/);
  return match?.[1] ?? null;
}

export function useResolvedOrgId(): string | null {
  const routeOrgId = useRouteOrgId();
  const { state } = useApp();
  const activeUser = state.users.find((user) => user.id === state.session.userId);
  return routeOrgId ?? activeUser?.organizationId ?? null;
}

export function useAccessibleOrganizations() {
  const { state } = useApp();
  const activeRole = state.session.activeRole;
  const activeUser = state.users.find((user) => user.id === state.session.userId);

  return state.organizations.filter((org) =>
    canAccessOrg(activeRole, { user: activeUser, orgId: org.id })
  );
}
