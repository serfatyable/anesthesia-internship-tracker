'use client';
import { useEffect, useState } from 'react';

type SessionUser = {
  id?: string;
  role?: string | null;
  email?: string | null;
  name?: string | null;
};
export default function Header() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/session')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch session');
        return r.json();
      })
      .then((d) => setUser(d.user ?? null))
      .catch((error) => {
        console.error('Session fetch error:', error);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <header className="w-full border-b">
      <div className="mx-auto max-w-5xl p-3 flex items-center justify-between">
        <a href="/" className="font-semibold">
          Anesthesia Tracker
        </a>
        <div className="text-sm text-gray-600">{loading ? 'Loading...' : (user?.email ?? '')}</div>
      </div>
    </header>
  );
}
