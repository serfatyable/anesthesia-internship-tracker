import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const isRole = (role?: string | null, target?: string) => role === target;
export const isAdmin = (role?: string | null) => isRole(role, 'ADMIN');
export const isTutor = (role?: string | null) => isRole(role, 'TUTOR');
export const isIntern = (role?: string | null) => isRole(role, 'INTERN');

type Allowed = string | string[];

export async function requireRole(allowed: Allowed) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role ?? null;
  const allowedList = Array.isArray(allowed) ? allowed : [allowed];
  if (!userRole || !allowedList.includes(userRole)) {
    return { ok: false as const, status: 403 as const, session };
  }
  return { ok: true as const, status: 200 as const, session };
}
