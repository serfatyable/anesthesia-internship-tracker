import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import process from 'node:process';
import net from 'node:net';
import { PrismaClient } from '@prisma/client';

type Mode = 'local' | 'prod';

function log(msg: string) {
  console.log(msg);
}
function info(msg: string) {
  console.log(`ℹ️  ${msg}`);
}
function warn(msg: string) {
  console.warn(`⚠️  ${msg}`);
}
function fail(msg: string) {
  console.error(`❌ ${msg}`);
}
function ok(msg: string) {
  console.log(`✅ ${msg}`);
}

function mask(val?: string | null) {
  if (!val) return '(missing)';
  if (val.length <= 6) return '******';
  return `${val.slice(0, 3)}…${val.slice(-3)}`;
}

function parseEnvFile(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(file)) return out;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function writeEnvFile(file: string, changes: Record<string, string>) {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const map = new Map<string, number>();
  for (let i = 0; i < lines.length; i++) {
    const s = lines[i].trim();
    if (!s || s.startsWith('#')) continue;
    const idx = s.indexOf('=');
    if (idx > -1) map.set(s.slice(0, idx).trim(), i);
  }
  let updated = false;
  for (const [k, v] of Object.entries(changes)) {
    if (map.has(k)) {
      const i = map.get(k)!;
      const old = lines[i];
      const newLine = `${k}="${v}"`;
      if (old !== newLine) {
        lines[i] = newLine;
        updated = true;
      }
    }
  }
  if (updated) fs.writeFileSync(file, lines.join('\n'));
}

async function run(cmd: string, args: string[], opts: { cwd?: string } = {}) {
  return new Promise<void>((resolve, reject) => {
    info(`$ ${cmd} ${args.join(' ')}`);
    const p = spawn(cmd, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      cwd: opts.cwd,
    });
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function readJSON<T = unknown>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function getMode(): Mode {
  if (process.argv.includes('--prod') || process.env.VERCEL === '1' || process.env.CI === 'true')
    return 'prod';
  return 'local';
}

function getServeFlag(): boolean {
  return process.argv.includes('--serve');
}

function checkNode() {
  const nvmrc = path.join(process.cwd(), '.nvmrc');
  if (fs.existsSync(nvmrc)) {
    const wanted = fs.readFileSync(nvmrc, 'utf8').trim().replace(/^v/, '');
    const current = process.versions.node;
    if (!current.startsWith(wanted.split('.')[0])) {
      warn(
        `Node version differs from .nvmrc (wanted v${wanted}, current v${current}). Use: nvm use`,
      );
    } else {
      ok(`Node version matches .nvmrc (v${current})`);
    }
  }
}

function checkPrismaVersions() {
  const pkg = readJSON<Record<string, unknown>>('package.json');
  const prismaDev = pkg?.devDependencies?.prisma || pkg?.dependencies?.prisma;
  const prismaClient =
    pkg?.dependencies?.['@prisma/client'] || pkg?.devDependencies?.['@prisma/client'];
  if (prismaDev && prismaClient) {
    const strip = (s: string) => s.replace(/^[^\d]*/, '');
    const d = strip(prismaDev);
    const c = strip(prismaClient);
    const dm = d.split('.').slice(0, 2).join('.');
    const cm = c.split('.').slice(0, 2).join('.');
    if (dm !== cm)
      warn(
        `Prisma versions differ (prisma ${prismaDev} vs @prisma/client ${prismaClient}). Keep them aligned.`,
      );
    else ok(`Prisma versions aligned (${prismaDev} / ${prismaClient})`);
  }
}

function summarizeAndFixEnv() {
  const root = process.cwd();
  const envLocalPath = path.join(root, '.env');
  const envProdPath = path.join(root, '.env.production');
  const envLocal = parseEnvFile(envLocalPath);
  const envProd = parseEnvFile(envProdPath);
  const env = { ...envLocal, ...envProd, ...process.env } as Record<string, string>;

  const required = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
  const missing = required.filter((k) => !env[k]);
  if (missing.length) warn(`Missing env vars: ${missing.join(', ')}`);

  const dbUrl = env.DATABASE_URL;
  const directUrl = env.DIRECT_URL;
  const nextUrl = env.NEXTAUTH_URL;
  const secret = env.NEXTAUTH_SECRET;

  log('Env summary (masked):');
  log(`- DATABASE_URL: ${mask(dbUrl)}`);
  log(`- DIRECT_URL:   ${mask(directUrl || null)}`);
  log(`- NEXTAUTH_URL: ${mask(nextUrl)}`);
  log(`- NEXTAUTH_SECRET: ${secret ? '(present)' : '(missing)'}`);

  const issues: string[] = [];

  const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  const isPostgres = /datasource db\s*{\s*provider\s*=\s*"postgresql"/m.test(schema);
  if (!isPostgres)
    issues.push('Prisma datasource provider is not "postgresql". This project expects Postgres.');

  if (dbUrl && !/^postgresql:\/\//i.test(dbUrl)) {
    issues.push(
      'DATABASE_URL must be a PostgreSQL URL. SQLite is not supported with current schema.',
    );
  }
  if (secret && secret.length < 32) {
    issues.push('NEXTAUTH_SECRET should be at least 32 characters.');
  }
  if (typeof nextUrl === 'string') {
    if (!/^https?:\/\/.+/i.test(nextUrl)) {
      issues.push('NEXTAUTH_URL should start with http:// or https://');
    }
    if (/\s/.test(nextUrl)) {
      issues.push(
        'NEXTAUTH_URL contains whitespace/newline; trimming it now if present in .env.production',
      );
      if (fs.existsSync(envProdPath)) {
        const trimmed = nextUrl.trim();
        if (trimmed !== nextUrl) {
          writeEnvFile(envProdPath, { NEXTAUTH_URL: trimmed });
          ok('Trimmed NEXTAUTH_URL in .env.production');
        }
      }
    }
  }

  const vercelJson = readJSON<Record<string, unknown>>('vercel.json');
  if (!vercelJson) issues.push('vercel.json missing or invalid JSON.');
  else {
    if (!vercelJson.installCommand || !vercelJson.buildCommand) {
      issues.push('vercel.json should define installCommand and buildCommand.');
    }
  }

  const pkg = readJSON<Record<string, unknown>>('package.json');
  if (pkg?.scripts?.postinstall?.includes('prisma generate'))
    ok('postinstall runs prisma generate');
  else issues.push('Add "postinstall": "prisma generate" to package.json scripts.');

  return { env, issues, envLocalPath, envProdPath };
}

async function waitForTcp(host: string, port: number, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await new Promise<boolean>((resolve) => {
      const sock = net.createConnection({ host, port }, () => {
        sock.end();
        resolve(true);
      });
      sock.on('error', () => resolve(false));
      sock.setTimeout(2000, () => {
        sock.destroy();
        resolve(false);
      });
    });
    if (ok) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Timed out waiting for ${host}:${port}`);
}

async function ensureLocalPostgresIfNeeded(dbUrl: string | undefined) {
  if (!dbUrl) return;
  let u: URL;
  try {
    u = new URL(dbUrl);
  } catch {
    return;
  }
  const host = u.hostname;
  const port = Number(u.port || 5432);
  if (!['localhost', '127.0.0.1'].includes(host)) return;

  info(`Checking local Postgres at ${host}:${port}...`);
  const canConnect = await new Promise<boolean>((resolve) => {
    const sock = net.createConnection({ host, port }, () => {
      sock.end();
      resolve(true);
    });
    sock.on('error', () => resolve(false));
    sock.setTimeout(1500, () => {
      sock.destroy();
      resolve(false);
    });
  });
  if (canConnect) {
    ok('Local Postgres reachable');
    return;
  }

  warn('Local Postgres not reachable; trying to start via Docker Compose (service: db)');
  try {
    await run('docker', ['compose', 'up', '-d', 'db']).catch(async () => {
      await run('docker-compose', ['up', '-d', 'db']);
    });
    await waitForTcp(host, port, 30000);
    ok('Local Postgres started and reachable');
  } catch (e) {
    warn(
      'Could not auto-start Postgres via Docker. Ensure Docker is running and run: docker compose up -d db',
    );
  }
}

async function prismaConnectivityCheck() {
  const prisma = new PrismaClient();
  try {
    info('Checking database connectivity and counts...');
    const [users, rotations, procedures, reqs, logs, verifs] = await Promise.all([
      prisma.user.count(),
      prisma.rotation.count(),
      prisma.procedure.count(),
      prisma.requirement.count(),
      prisma.logEntry.count(),
      prisma.verification.count(),
    ]);
    ok(
      `DB connected. Counts => users:${users}, rotations:${rotations}, procedures:${procedures}, reqs:${reqs}, logs:${logs}, verifs:${verifs}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const mode = getMode();
  const serve = getServeFlag();
  log(`\n=== Anesthesia Internship Tracker Doctor (${mode}${serve ? ', serve' : ''}) ===\n`);

  checkNode();
  checkPrismaVersions();

  const { env, issues } = summarizeAndFixEnv();

  // Local Postgres bootstrap if needed
  if (mode === 'local') await ensureLocalPostgresIfNeeded(env.DATABASE_URL);

  if (issues.length) {
    warn('Config warnings:');
    for (const i of issues) warn(`- ${i}`);
  } else {
    ok('Env and config look good');
  }

  // Prisma validate + generate
  await run('pnpm', ['prisma:validate']);
  await run('pnpm', ['db:generate']);

  // DB setup
  if (mode === 'local') {
    await run('pnpm', ['db:push']);
    await run('pnpm', ['db:seed']);
    await run('pnpm', ['peek']);
  } else {
    if (!env.DIRECT_URL)
      warn('DIRECT_URL missing. It is recommended for Prisma migrate deploy with Neon.');
    await run('pnpm', ['exec', 'prisma', 'migrate', 'deploy']);
  }

  // Connectivity sanity
  await prismaConnectivityCheck();

  // Typecheck, lint, test, build, integration
  await run('pnpm', ['typecheck']);
  await run('pnpm', ['lint']);
  await run('pnpm', ['test']);
  await run('pnpm', ['build']);
  await run('pnpm', ['integration-test']);

  ok('\nDoctor checks passed.');

  // Vercel checklist
  log('\nVercel checklist:');
  log('- Set env vars in Vercel Project → Settings → Environment Variables:');
  log(
    '  DATABASE_URL, DIRECT_URL, NEXTAUTH_URL (your prod domain), NEXTAUTH_SECRET (32+ chars), AUTH_PROVIDER=credentials',
  );
  log(
    '- Ensure prisma/migrations are committed. Vercel build will run prisma generate; migrate deploy should run via your pipeline or manually.',
  );
  log('- Remove any trailing whitespace in NEXTAUTH_URL on Vercel as well.');
  log('- Consider NOT committing .env.production with secrets; use Vercel envs.');

  if (serve && mode === 'local') {
    info('\nStarting dev server (Ctrl+C to stop)...');
    await run('pnpm', ['dev']);
  }
}

main().catch((e) => {
  fail(e?.message || String(e));
  process.exit(1);
});
