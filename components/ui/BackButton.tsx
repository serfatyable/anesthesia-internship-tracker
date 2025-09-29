'use client';
import { useRouter } from 'next/navigation';

export default function BackButton({ className = '' }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`inline-flex items-center px-3 py-2 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-medium shadow-sm transition-colors ${className}`}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}
