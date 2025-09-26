import './globals.css';
import type { ReactNode } from 'react';
import ConditionalHeader from '@/components/ConditionalHeader';
import { NextAuthProvider } from '@/components/NextAuthProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <NextAuthProvider>
          <ConditionalHeader />
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
