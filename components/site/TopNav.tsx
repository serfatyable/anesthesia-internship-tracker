'use client';

import Link from 'next/link';
import { RtlToggle } from './RtlToggle';
import { Container } from './Container';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';

export default function TopNav() {
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);

  // Use role from session directly instead of making additional API call
  useEffect(() => {
    if (session?.user?.role) {
      setUserRole(session.user.role);
    } else {
      setUserRole(null);
    }
  }, [session?.user?.role]);

  // Memoize navigation links to prevent unnecessary re-renders
  const navigationLinks = useMemo(() => {
    const baseLinks = [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/rotations', label: 'Rotations' },
      { href: '/admin', label: 'Admin' },
    ];

    const conditionalLinks = [];
    if (session) {
      conditionalLinks.push({ href: '/logs', label: 'My Logs' });
    }
    if (userRole === 'TUTOR' || userRole === 'ADMIN') {
      conditionalLinks.push({ href: '/verify', label: 'Verify' });
    }

    return [...conditionalLinks, ...baseLinks];
  }, [session, userRole]);

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/70 backdrop-blur">
      <Container className="flex items-center justify-between h-14">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Anesthesia Intern Tracker
          </Link>
          <div className="hidden sm:flex gap-3 text-sm">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:underline">
                {link.label}
              </Link>
            ))}
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
