'use client';
import { useSession } from 'next-auth/react';

export default function DebugSessionPage() {
  const { data: session, status } = useSession();
  return (
    <main className='max-w-2xl mx-auto p-8'>
      <h1 className='text-2xl font-bold mb-4'>Session Debug</h1>
      <div className='bg-zinc-100 rounded p-4 mb-4'>
        <div className='font-mono text-xs text-zinc-700 whitespace-pre-wrap'>
          <strong>Status:</strong> {status}
          <br />
          <strong>Session:</strong>
          <br />
          {JSON.stringify(session, null, 2)}
        </div>
      </div>
      <p className='text-gray-600'>
        Navigate around, then return to this page to see if your session is
        still present.
      </p>
    </main>
  );
}
