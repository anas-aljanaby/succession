import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { UserRole } from '../types';
import { useLanguage } from '../lib/i18n';
import { useApp } from '../store/AppContext';
import { Breadcrumb } from './Breadcrumb';
import { RoleSwitcher } from './RoleSwitcher';
import { LanguageToggle } from './LanguageToggle';
import { OrgSwitcher } from './OrgSwitcher';
import { CandidateSwitcher } from './CandidateSwitcher';

interface Props {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Topbar: React.FC<Props> = ({ activeRole, onRoleChange }) => {
  const { t } = useLanguage();
  const { state, dispatch } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeUser = state.users.find((user) => user.id === state.session.userId);
  const orgMatch = pathname.match(/^\/organizations\/([^/]+)/);
  const routeOrgId = orgMatch?.[1];
  const contextOrgId = routeOrgId ?? activeUser?.organizationId;
  const contextOrg = contextOrgId
    ? state.organizations.find((org) => org.id === contextOrgId)
    : undefined;

  const showOrgSwitcher = activeRole === 'CONSULTANT';
  const showCandidateSwitcher =
    activeRole !== 'CANDIDATE' && Boolean(routeOrgId);

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-800 px-6 py-3">
      <Breadcrumb />
      <div className="flex items-center gap-3 shrink-0">
        {!showOrgSwitcher && contextOrg ? (
          <span className="hidden md:inline text-sm font-medium text-gray-400 max-w-[10rem] truncate">
            {contextOrg.name}
          </span>
        ) : null}
        {showOrgSwitcher ? <OrgSwitcher /> : null}
        {showCandidateSwitcher && routeOrgId ? (
          <CandidateSwitcher orgId={routeOrgId} />
        ) : null}
        <RoleSwitcher activeRole={activeRole} onRoleChange={onRoleChange} />
        <LanguageToggle />
        <button
          type="button"
          onClick={logout}
          className="px-3 py-1.5 rounded-md text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          {t('topbar.logout')}
        </button>
      </div>
    </header>
  );
};
