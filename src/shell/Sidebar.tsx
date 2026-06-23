import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';
import { canAccessOrg } from '../lib/permissions';
import { useApp } from '../store/AppContext';

const linkBase =
  'block px-3 py-2 rounded-md text-sm font-medium transition-colors';
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${linkBase} ${
    isActive
      ? 'bg-primary-600/20 text-white'
      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
  }`;

function useActiveOrgId(): string | null {
  const { pathname } = useLocation();
  const match = pathname.match(/^\/organizations\/([^/]+)/);
  return match ? match[1] : null;
}

export const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const { state } = useApp();
  const orgId = useActiveOrgId();
  const activeRole = state.session.activeRole;
  const activeUser = state.users.find((user) => user.id === state.session.userId);
  const ownCandidate = activeUser?.candidateId
    ? state.candidates.find((candidate) => candidate.id === activeUser.candidateId)
    : undefined;
  const canUseOrgNav = orgId
    ? canAccessOrg(activeRole, { user: activeUser, orgId })
    : false;
  const showFunctions = activeRole !== 'SUPERVISOR';

  if (activeRole === 'CANDIDATE') {
    return (
      <aside className="w-60 shrink-0 border-e border-gray-800 bg-gray-900/60 px-3 py-4 flex flex-col gap-6">
        <div className="px-3 text-lg font-semibold text-white">{t('appName')}</div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={linkClass}>
            {t('nav.home')}
          </NavLink>
          {ownCandidate ? (
            <NavLink
              to={`/organizations/${ownCandidate.organizationId}/candidates/${ownCandidate.id}`}
              className={linkClass}
            >
              {t('nav.myJourney')}
            </NavLink>
          ) : null}
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-60 shrink-0 border-e border-gray-800 bg-gray-900/60 px-3 py-4 flex flex-col gap-6">
      <div className="px-3 text-lg font-semibold text-white">{t('appName')}</div>

      <nav className="flex flex-col gap-1">
        <NavLink to="/" end className={linkClass}>
          {t('nav.home')}
        </NavLink>
        <NavLink to="/organizations" className={linkClass}>
          {t('nav.organizations')}
        </NavLink>
      </nav>

      {orgId && canUseOrgNav && (
        <nav className="flex flex-col gap-1 border-t border-gray-800 pt-4">
          <NavLink to={`/organizations/${orgId}`} end className={linkClass}>
            {t('nav.dashboard')}
          </NavLink>
          {showFunctions ? (
            <NavLink to={`/organizations/${orgId}/functions`} className={linkClass}>
              {t('nav.functions')}
            </NavLink>
          ) : null}
          <NavLink to={`/organizations/${orgId}/candidates`} className={linkClass}>
            {t('nav.candidates')}
          </NavLink>
          <NavLink to="/coming-soon" className={linkClass}>
            {t('nav.more')}{' '}
            <span className="text-xs text-gray-500">({t('nav.soon')})</span>
          </NavLink>
        </nav>
      )}
    </aside>
  );
};
