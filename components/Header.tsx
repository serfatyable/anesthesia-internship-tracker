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
  useEffect(() => {
    fetch('/api/session')
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null));
  }, []);
  return (
    <header className="w-full border-b">
      <div className="mx-auto max-w-5xl p-3 flex items-center justify-between">
        <a href="/" className="font-semibold">
          Anesthesia Tracker
        </a>
        <div className="text-sm text-gray-600">{user?.email ?? ''}</div>
      </div>
    </header>
  );
}
