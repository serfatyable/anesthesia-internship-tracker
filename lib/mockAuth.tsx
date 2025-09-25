'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type Auth = {
  isAuthed: boolean;
  login: () => void;
  logout: () => void;
};

const AuthCtx = createContext<Auth | null>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setAuthed] = useState(false);

  return (
    <AuthCtx.Provider
      value={{
        isAuthed,
        login: () => setAuthed(true),
        logout: () => setAuthed(false),
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within MockAuthProvider');
  return ctx;
}
