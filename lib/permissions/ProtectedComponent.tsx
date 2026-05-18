import React from 'react';
import { usePermissions } from './PermissionContext';
import { PERMISSIONS } from './roles';
import type { UserRole } from '../../types';

type PermissionValue = typeof PERMISSIONS[keyof typeof PERMISSIONS];

interface ProtectedComponentProps {
  permission?: PermissionValue;
  role?: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  permission,
  role,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasRole } = usePermissions();

  const isAllowed = () => {
    if (permission) {
      return hasPermission(permission);
    }
    if (role) {
      return hasRole(role);
    }
    // If neither permission nor role is provided, don't render. This should be an explicit choice.
    return false;
  };

  return isAllowed() ? <>{children}</> : <>{fallback}</>;
};
