import type { User, UserRole } from '../types';
import { ROLES, rolePermissions } from '../lib/permissions/roles';

const JWT_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

export const generateJwt = (user: User): string => {
    // Collect all permissions from all roles, removing duplicates
    const userPermissions = new Set<string>();
    user.roles.forEach(role => {
        const permissions = rolePermissions[role];
        if (permissions) {
            permissions.forEach(permission => userPermissions.add(permission));
        }
    });

    const payload = {
        id: user.id,
        name: user.name,
        roles: user.roles,
        permissions: Array.from(userPermissions),
        iat: Date.now(),
        exp: Date.now() + JWT_EXPIRATION_MS,
    };
    // In a real app, this would use a library like 'jsonwebtoken' to sign the token
    // Here, we just Base64-encode the payload for simulation purposes
    return btoa(JSON.stringify(payload));
};

export const decodeJwt = (token: string): any | null => {
    try {
        const payload = JSON.parse(atob(token));
        return payload;
    } catch (error) {
        console.error("Failed to decode JWT:", error);
        return null;
    }
};