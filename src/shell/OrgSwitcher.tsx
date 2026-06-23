import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';
import { useApp } from '../store/AppContext';

function targetPathForOrgSwitch(pathname: string, newOrgId: string): string {
  const match = pathname.match(/^\/organizations\/[^/]+(\/.*)?$/);
  if (!match) return `/organizations/${newOrgId}`;

  const rest = match[1] ?? '';
  if (/^\/functions\/[^/]+/.test(rest) || /^\/candidates\/[^/]+/.test(rest)) {
    return `/organizations/${newOrgId}`;
  }

  return `/organizations/${newOrgId}${rest}`;
}

export const OrgSwitcher: React.FC = () => {
  const { t } = useLanguage();
  const { state } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const orgMatch = pathname.match(/^\/organizations\/([^/]+)/);
  const activeOrgId = orgMatch?.[1] ?? state.organizations[0]?.id ?? '';

  return (
    <label className="flex items-center gap-2 text-sm text-gray-400">
      <span className="hidden sm:inline">{t('topbar.organization')}</span>
      <select
        value={activeOrgId}
        onChange={(e) => navigate(targetPathForOrgSwitch(pathname, e.target.value))}
        className="max-w-[12rem] bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500 truncate"
      >
        {state.organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </label>
  );
};
