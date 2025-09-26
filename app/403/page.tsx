import Link from 'next/link';

export default function Forbidden() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-400 mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Access Forbidden</h2>
          <p className="text-gray-600">You don&apos;t have permission to access this resource.</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Sign In Again
          </Link>
        </div>
      </div>
    </main>
  );
}
