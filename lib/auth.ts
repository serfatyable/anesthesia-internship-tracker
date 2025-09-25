import type { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma as db } from '@/lib/db';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt', // Using JWT for now
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({ where: { email: credentials.email } });
        if (!user?.password) return null;
        const ok = await compare(credentials.password, user.password);
        if (!ok) return null;
        // Return minimal user object for session creation
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as unknown as NextAuthUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as unknown as { role: string }).role ?? token.role ?? 'INTERN';
      }
      if (trigger === 'update' && session?.user?.role) {
        token.role = session.user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) ?? 'INTERN';
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
