import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anesthesia Internship Tracker',
  description: 'T1 Scaffold',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">{children}</body>
    </html>
  );
}
