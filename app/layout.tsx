import './globals.css';
import type { ReactNode } from 'react';
import Header from '@/components/Header';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <Header />
        <main className="max-w-5xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
