import { User } from '@prisma/client';
import { USER_ROLES } from '@/lib/constants';

export function canCreateLog(user: Pick<User, 'role' | 'id'>): boolean {
  return user.role === USER_ROLES.INTERN;
}

export function canReviewLogs(user: Pick<User, 'role' | 'id'>): boolean {
  return user.role === USER_ROLES.TUTOR || user.role === USER_ROLES.ADMIN;
}

export function canAccessAdmin(user: Pick<User, 'role' | 'id'>): boolean {
  return user.role === USER_ROLES.ADMIN;
}

export function canViewAllUsers(user: Pick<User, 'role' | 'id'>): boolean {
  return user.role === USER_ROLES.TUTOR || user.role === USER_ROLES.ADMIN;
}

export function canExportData(user: Pick<User, 'role' | 'id'>): boolean {
  return (
    user.role === USER_ROLES.INTERN ||
    user.role === USER_ROLES.TUTOR ||
    user.role === USER_ROLES.ADMIN
  );
}

export function canModifyUser(
  user: Pick<User, 'role' | 'id'>,
  targetUserId: string
): boolean {
  // Users can modify their own profile, admins can modify anyone
  return user.id === targetUserId || user.role === USER_ROLES.ADMIN;
}

export function isOwner(userId: string, ownerId: string): boolean {
  return userId === ownerId;
}

export function hasRole(user: Pick<User, 'role'>, role: string): boolean {
  return user.role === role;
}

export function hasAnyRole(user: Pick<User, 'role'>, roles: string[]): boolean {
  return roles.includes(user.role);
}
