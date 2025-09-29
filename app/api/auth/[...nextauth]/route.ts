import NextAuth from 'next-auth';
import { z as zNs } from 'zod';
import { authOptions } from '@/lib/auth';
// Touch namespace to ensure zod is included in the bundle if downstream modules use it
void zNs;
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
