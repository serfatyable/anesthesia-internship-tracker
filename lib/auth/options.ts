import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import { compare } from 'bcryptjs';

type UserWithPassword = {
  id: string;
  email: string;
  name: string | null;
  password: string | null;
  role: string;
};

type Credentials = {
  email: string;
  password: string;
};

type SessionUser = {
  id: string;
  name?: string | null;
  email: string;
  role: 'INTERN' | 'TUTOR' | 'ADMIN';
};

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  ...(process.env.NEXTAUTH_SECRET ? { secret: process.env.NEXTAUTH_SECRET } : {}),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Credentials | undefined) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const userWithPassword = user as UserWithPassword;
        const storedPassword = userWithPassword.password;
        if (!storedPassword) return null;

        let isValid = false;
        if (storedPassword.length === 60) {
          try {
            isValid = await compare(credentials.password, storedPassword);
          } catch {
            isValid = false;
          }
        } else {
          isValid = storedPassword === credentials.password;
        }

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: userWithPassword.role as 'INTERN' | 'TUTOR' | 'ADMIN',
        };
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({
      token,
      user,
    }: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: any;
    }) {
      if (user) {
        token.id = user.id;
        token.role = (user as SessionUser).role;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({
      session,
      token,
    }: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token: any;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'INTERN' | 'TUTOR' | 'ADMIN';
      }
      return session;
    },
  },
};
