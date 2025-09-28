'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  fallbackHref?: string;
}

export function BackButton({
  href,
  onClick,
  className = '',
  children,
  fallbackHref = '/dashboard',
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      // Fallback to browser back or specified fallback
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push(fallbackHref);
      }
    }
  };

  const defaultClassName = `inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors ${className}`;

  if (href && !onClick) {
    // Use Link for client-side navigation when href is provided
    return (
      <Link href={href} className={defaultClassName}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {children || 'Back'}
      </Link>
    );
  }

  // Use button for custom onClick or browser back
  return (
    <button onClick={handleClick} className={defaultClassName}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {children || 'Back'}
    </button>
  );
}
