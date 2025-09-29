// app/debug/status/page.tsx
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // use relative path to avoid alias issues

function Row({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean;
  detail?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        padding: '6px 0',
        borderBottom: '1px solid #eee',
      }}
    >
      <span>{label}</span>
      <span>
        {ok ? '✅' : '❌'}{' '}
        {detail ? <em style={{ opacity: 0.75 }}>— {detail}</em> : null}
      </span>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default async function StatusPage() {
  // Env
  const hasDB = !!process.env.DATABASE_URL;
  const dbIsPostgres =
    hasDB && process.env.DATABASE_URL!.startsWith('postgresql://');
  const hasNAUrl = !!process.env.NEXTAUTH_URL;
  const hasSecret = !!process.env.NEXTAUTH_SECRET;

  // Prisma
  let dbOK = false,
    userCount: number | null = null,
    dbError: string | null = null;
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    try {
      userCount = await prisma.user.count();
      dbOK = true;
    } catch (e: unknown) {
      dbError = e instanceof Error ? e.message : String(e);
    }
  } else {
    dbError = 'Skipped during build';
  }

  // Migrations
  const migDir = path.join(process.cwd(), 'prisma', 'migrations');
  let hasMigrations = false,
    migDetail: string | undefined;
  try {
    const items = fs.readdirSync(migDir, { withFileTypes: true });
    hasMigrations = items.some(d => d.isDirectory());
    migDetail = hasMigrations ? undefined : 'No migration folders';
  } catch {
    hasMigrations = false;
    migDetail = 'migrations folder missing';
  }

  // NextAuth session (guarded)
  let sessionOK = false,
    sessionState: string | undefined;
  try {
    const session = await getServerSession(authOptions);
    sessionOK = true;
    sessionState = session ? 'Logged in' : 'Logged out (OK)';
  } catch (e: unknown) {
    sessionOK = false;
    sessionState = e instanceof Error ? e.message : String(e);
  }

  const routes = [
    { href: '/', label: 'Home /' },
    { href: '/login', label: 'Login' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/admin', label: 'Admin (should 403 if not ADMIN)' },
    { href: '/403', label: '403 page' },
    { href: '/health', label: 'Health' },
  ];

  return (
    <main
      style={{
        maxWidth: 800,
        margin: '40px auto',
        padding: '0 16px',
        fontFamily: 'system-ui,-apple-system',
      }}
    >
      <h1>Anesthesia Tracker — Health Check</h1>
      <p>Self-checks for T1–T7, rendered inside Next.js.</p>

      <h2>Environment</h2>
      <Row
        label='DATABASE_URL set'
        ok={hasDB}
        {...(hasDB ? {} : { detail: 'Missing in .env.local' })}
      />
      <Row
        label='DATABASE_URL is PostgreSQL'
        ok={dbIsPostgres}
        {...(dbIsPostgres ? {} : { detail: 'Expected postgresql://' })}
      />
      <Row label='NEXTAUTH_URL set' ok={hasNAUrl} />
      <Row label='NEXTAUTH_SECRET set' ok={hasSecret} />

      <h2>Database / Prisma</h2>
      <Row
        label='Prisma query OK'
        ok={dbOK}
        {...(dbOK
          ? { detail: `Users: ${userCount}` }
          : { detail: dbError ?? 'Unknown error' })}
      />
      <Row
        label='Migrations folder exists'
        ok={hasMigrations}
        {...(migDetail ? { detail: migDetail } : {})}
      />

      <h2>Auth</h2>
      <Row
        label='NextAuth session endpoint'
        ok={sessionOK}
        {...(sessionState ? { detail: sessionState } : {})}
      />

      <h2>Quick links</h2>
      <ul style={{ lineHeight: 1.9 }}>
        {routes.map(r => (
          <li key={r.href}>
            <a style={{ textDecoration: 'underline' }} href={r.href}>
              {r.label}
            </a>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 24, opacity: 0.7 }}>
        Tip: If you rotated NEXTAUTH_SECRET, clear cookies (DevTools →
        Application → Clear storage) to fix JWT errors.
      </p>
    </main>
  );
}
