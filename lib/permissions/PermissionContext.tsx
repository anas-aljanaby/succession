import { createContext, useContext } from 'react';
import type { UserRole } from '../../types';
import { PERMISSIONS } from './roles';

type PermissionValue = typeof PERMISSIONS[keyof typeof PERMISSIONS];

interface IPermissionContext {
    hasPermission: (permission: PermissionValue) => boolean;
    hasRole: (role: UserRole) => boolean;
    activeRole: UserRole | null;
}

const PermissionContext = createContext<IPermissionContext | undefined>(undefined);

export const usePermissions = (): IPermissionContext => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermissions must be used within a PermissionProvider');
    }
    return context;
};

export { PermissionContext };
