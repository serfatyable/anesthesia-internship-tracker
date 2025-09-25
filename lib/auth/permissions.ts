import { User } from '@prisma/client';

export function canCreateLog(user: Pick<User, 'role' | 'id'>) {
  return user.role === 'INTERN';
}
export function canReviewLogs(user: Pick<User, 'role' | 'id'>) {
  return user.role === 'TUTOR' || user.role === 'ADMIN';
}
export function isOwner(userId: string, ownerId: string) {
  return userId === ownerId;
}
