'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // console.error(error);
  }, [error]);

  return (
    <main className='max-w-3xl mx-auto p-6 text-center'>
      <h1 className='text-3xl font-semibold mb-3'>Something went wrong</h1>
      <p className='text-gray-600 mb-6'>
        An unexpected error occurred. Please try again.
      </p>
      <div className='flex items-center justify-center gap-3'>
        <button
          onClick={() => reset()}
          className='px-4 py-2 rounded-md bg-blue-600 text-white'
        >
          Retry
        </button>
        <a href='/' className='px-4 py-2 rounded-md border'>
          Go home
        </a>
      </div>
    </main>
  );
}
