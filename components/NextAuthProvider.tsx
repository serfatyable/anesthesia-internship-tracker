'use client';
import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  // Debug: log session on every render
  function DebugSessionLogger() {
    const { data: session, status } = useSession();
    useEffect(() => {
      console.log('Session in NextAuthProvider:', session, 'Status:', status);
    }, [session, status]);
    return null;
  }
  return (
    <SessionProvider>
      <DebugSessionLogger />
      {children}
    </SessionProvider>
  );
}
