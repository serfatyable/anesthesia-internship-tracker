'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Don't show header on home page or auth pages
  if (pathname === '/' || pathname === '/login' || pathname.startsWith('/api/auth/')) {
    return null;
  }

  return <Header />;
}
