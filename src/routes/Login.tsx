import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '../types';
import { useLanguage } from '../lib/i18n';
import { LanguageToggle } from '../shell/LanguageToggle';

const ROLES: UserRole[] = [
  'CONSULTANT',
  'ORGANIZATION_ADMIN',
  'HR_MANAGER',
  'SUPERVISOR',
  'CANDIDATE',
  'VIEWER',
];

// Phase 0: selecting a role routes into the app. Real session seeding (mapping a role
// to a mock user + scoped landing) is wired in a later phase.
export const Login: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <div className="flex justify-end p-4">
        <LanguageToggle />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-semibold text-white">{t('login.title')}</h1>
        <p className="mt-2 text-sm text-gray-400">{t('login.subtitle')}</p>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => navigate('/')}
              className="rounded-lg border border-gray-800 bg-gray-800/40 px-4 py-6 text-sm font-medium text-gray-200 hover:border-primary-500 hover:text-white transition-colors"
            >
              {t(`role.${role}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
