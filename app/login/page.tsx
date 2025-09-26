'use client';

import { SignInForm } from '@/components/SignInForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Anesthesia Tracker Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Anesthesia Tracker</h1>
        <p className="text-lg text-gray-600">Professional Training Management</p>
      </div>

      <div className="w-full max-w-md">
        <SignInForm onSwitchToSignUp={() => {}} />
      </div>
    </main>
  );
}
