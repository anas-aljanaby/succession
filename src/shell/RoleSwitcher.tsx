import React from 'react';
import type { UserRole } from '../types';
import { useLanguage } from '../lib/i18n';
import { SwitchHorizontalIcon } from '@/components/icons/SwitchHorizontalIcon';

const ROLES: UserRole[] = [
  'CONSULTANT',
  'ORGANIZATION_ADMIN',
  'HR_MANAGER',
  'SUPERVISOR',
  'CANDIDATE',
  'VIEWER',
];

interface Props {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSwitcher: React.FC<Props> = ({ activeRole, onRoleChange }) => {
  const { t } = useLanguage();
  return (
    <label className="flex items-center gap-2 text-sm text-gray-400 bg-gray-900/50 p-1 rounded-lg">
      <SwitchHorizontalIcon />
      <span className="hidden sm:inline">{t('topbar.switchRole')}</span>
      <select
        value={activeRole}
        onChange={(e) => onRoleChange(e.target.value as UserRole)}
        className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {t(`role.${role}`)}
          </option>
        ))}
      </select>
    </label>
  );
};
