'use client';

import Link from 'next/link';
import RtlToggle from './RtlToggle';
import Container from './Container';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function TopNav() {
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      // Fetch user role from session or API
      fetch('/api/session')
        .then((res) => res.json())
        .then((data) => setUserRole(data.role))
        .catch(() => setUserRole(null));
    }
  }, [session]);

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/70 backdrop-blur">
      <Container className="flex items-center justify-between h-14">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-semibold">
            Anesthesia Intern Tracker
          </Link>
          <div className="hidden sm:flex gap-3 text-sm">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            {session && (
              <Link href="/logs" className="hover:underline">
                My Logs
              </Link>
            )}
            {userRole === 'TUTOR' || userRole === 'ADMIN' ? (
              <Link href="/verify" className="hover:underline">
                Verify
              </Link>
            ) : null}
            <Link href="/rotations" className="hover:underline">
              Rotations
            </Link>
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RtlToggle />
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-600">{session.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-xs rounded-full border px-3 py-1 hover:bg-zinc-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-xs rounded-full border px-3 py-1 hover:bg-zinc-50">
              Login
            </Link>
          )}
        </div>
      </Container>
    </nav>
  );
}
