import React from 'react';
import type { UserRole } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { RoleSwitcher } from './RoleSwitcher';
import { LanguageToggle } from './LanguageToggle';

interface Props {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Topbar: React.FC<Props> = ({ activeRole, onRoleChange }) => {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-800 px-6 py-3">
      <Breadcrumb />
      <div className="flex items-center gap-3">
        <RoleSwitcher activeRole={activeRole} onRoleChange={onRoleChange} />
        <LanguageToggle />
      </div>
    </header>
  );
};
