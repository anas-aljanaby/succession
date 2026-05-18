import React, { useMemo } from 'react';
import type { User, UserRole } from '../../types';
import { PermissionContext } from './PermissionContext';
import { rolePermissions } from './roles';

interface PermissionProviderProps {
  user: User | null;
  activeRole: UserRole | null;
  children: React.ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ user, activeRole, children }) => {
  const permissions = useMemo(() => {
    if (!activeRole) {
      return new Set<string>();
    }
    return new Set(rolePermissions[activeRole] || []);
  }, [activeRole]);

  const hasPermission = (permission: string): boolean => {
    return permissions.has(permission);
  };

  const hasRole = (role: UserRole): boolean => {
    return activeRole === role;
  };

  const value = {
    hasPermission,
    hasRole,
    activeRole,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};
