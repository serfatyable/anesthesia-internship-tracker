import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // return null and let caller redirect on server
    return null;
  }
  return session;
}

export function hasRole(session: { user?: { role?: string } } | null, roles: string[]) {
  const role = session?.user?.role;
  return role ? roles.includes(role) : false;
}
