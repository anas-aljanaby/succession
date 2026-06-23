import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';

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
  const orgId = useActiveOrgId();

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

      {orgId && (
        <nav className="flex flex-col gap-1 border-t border-gray-800 pt-4">
          <NavLink to={`/organizations/${orgId}`} end className={linkClass}>
            {t('nav.dashboard')}
          </NavLink>
          <NavLink to={`/organizations/${orgId}/functions`} className={linkClass}>
            {t('nav.functions')}
          </NavLink>
          <NavLink to={`/organizations/${orgId}/candidates`} className={linkClass}>
            {t('nav.candidates')}
          </NavLink>
          <NavLink to="/coming-soon/reports" className={linkClass}>
            {t('nav.reports')}{' '}
            <span className="text-xs text-gray-500">({t('nav.soon')})</span>
          </NavLink>
        </nav>
      )}
    </aside>
  );
};
