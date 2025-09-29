import './globals.css';
import type { ReactNode } from 'react';
import ConditionalHeader from '@/components/ConditionalHeader';
import { NextAuthProvider } from '@/components/NextAuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' dir='ltr'>
      <body suppressHydrationWarning={true}>
        <NextAuthProvider>
          <ErrorBoundary>
            <ConditionalHeader />
            {children}
          </ErrorBoundary>
        </NextAuthProvider>
      </body>
    </html>
  );
}
