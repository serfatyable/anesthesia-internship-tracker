'use client';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function AuthHeader() {
  const { data } = useSession();
  return (
    <header className="w-full px-4 py-2 border-b flex items-center justify-between">
      <div className="font-semibold">Anesthesia Intern Tracker</div>
      <div className="flex items-center gap-3">
        {data?.user ? (
          <>
            <span className="text-sm">{data.user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-3 py-1 rounded-2xl border"
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn(undefined, { callbackUrl: '/dashboard' })}
            className="px-3 py-1 rounded-2xl border"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
