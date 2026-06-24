import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';
import { useApp } from '../store/AppContext';
import { BuildingOffice2Icon } from '@/components/icons/BuildingOffice2Icon';
import { ChevronDownIcon } from '@/components/icons/ChevronDownIcon';
import { CheckIcon } from '@/components/icons/CheckIcon';

function targetPathForOrgSwitch(pathname: string, newOrgId: string): string {
  const match = pathname.match(/^\/organizations\/[^/]+(\/.*)?$/);
  if (!match) return `/organizations/${newOrgId}`;

  const rest = match[1] ?? '';
  if (/^\/functions\/[^/]+/.test(rest) || /^\/candidates\/[^/]+/.test(rest)) {
    return `/organizations/${newOrgId}`;
  }

  return `/organizations/${newOrgId}${rest}`;
}

// Single org control: clicking the name opens the organizations list,
// while the chevron opens a switcher to change org in place.
export const OrgMenu: React.FC = () => {
  const { t } = useLanguage();
  const { state } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const orgMatch = pathname.match(/^\/organizations\/([^/]+)/);
  const activeOrgId = orgMatch?.[1] ?? state.organizations[0]?.id ?? '';
  const activeOrg = state.organizations.find((org) => org.id === activeOrgId);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const switchTo = (orgId: string) => {
    setOpen(false);
    navigate(targetPathForOrgSwitch(pathname, orgId));
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => navigate('/organizations')}
          title={t('topbar.manageOrganizations')}
          className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-gray-100 hover:bg-gray-700 transition-colors max-w-[12rem]"
        >
          <BuildingOffice2Icon className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="truncate">{activeOrg?.name ?? t('topbar.organization')}</span>
        </button>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={t('topbar.organization')}
          aria-expanded={open}
          className="px-1.5 py-1.5 text-gray-400 border-s border-gray-700 hover:bg-gray-700 hover:text-gray-100 transition-colors"
        >
          <ChevronDownIcon className="h-4 w-4" />
        </button>
      </div>

      {open ? (
        <div className="absolute top-full end-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
          <ul className="max-h-80 overflow-y-auto py-1">
            {state.organizations.map((org) => (
              <li key={org.id}>
                <button
                  type="button"
                  onClick={() => switchTo(org.id)}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm transition-colors hover:bg-gray-700/50 ${
                    org.id === activeOrgId ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  <span className="truncate">{org.name}</span>
                  {org.id === activeOrgId ? (
                    <span className="text-primary-400 shrink-0">
                      <CheckIcon />
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate('/organizations');
            }}
            className="block w-full border-t border-gray-700 px-3 py-2 text-start text-sm text-gray-400 hover:bg-gray-700/50 hover:text-gray-100 transition-colors"
          >
            {t('topbar.manageOrganizations')}
          </button>
        </div>
      ) : null}
    </div>
  );
};
