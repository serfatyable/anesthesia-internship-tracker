import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options'; // if alias fails, use "../../lib/auth/options"
import { redirect } from 'next/navigation';
export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'ADMIN') redirect('/403');
  return (
    <main className="p-6">
      <h1>Admin</h1>
    </main>
  );
}
