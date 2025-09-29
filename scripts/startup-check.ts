#!/usr/bin/env tsx

/**
 * Comprehensive startup check script to prevent app startup issues
 */

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function log(
  message: string,
  type: 'info' | 'success' | 'error' | 'warn' = 'info'
) {
  const colors = {
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m', // Red
    warn: '\x1b[33m', // Yellow
  };
  const reset = '\x1b[0m';
  const icons = {
    info: '🔍',
    success: '✅',
    error: '❌',
    warn: '⚠️',
  };

  console.log(`${colors[type]}${icons[type]} ${message}${reset}`);
}

async function checkEnvironment() {
  log('Checking environment configuration...');

  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    log('Missing .env file', 'error');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasDatabaseUrl = envContent.includes('DATABASE_URL=');
  const hasNextAuthSecret = envContent.includes('NEXTAUTH_SECRET=');
  const hasNextAuthUrl = envContent.includes('NEXTAUTH_URL=');

  if (!hasDatabaseUrl) {
    log('Missing DATABASE_URL in .env', 'error');
    return false;
  }

  if (!hasNextAuthSecret) {
    log('Missing NEXTAUTH_SECRET in .env', 'error');
    return false;
  }

  if (!hasNextAuthUrl) {
    log('Missing NEXTAUTH_URL in .env', 'error');
    return false;
  }

  log('Environment configuration is valid', 'success');
  return true;
}

async function checkDatabase() {
  log('Checking database connection...');

  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    log(`Database connected successfully (${userCount} users)`, 'success');
    return true;
  } catch (error) {
    log(
      `Database connection failed: ${error instanceof Error ? error.message : error}`,
      'error'
    );
    return false;
  }
}

async function checkPrismaClient() {
  log('Checking Prisma client...');

  try {
    execSync('pnpm prisma generate', { stdio: 'pipe' });
    log('Prisma client is up to date', 'success');
    return true;
  } catch (error) {
    log(
      `Prisma client generation failed: ${error instanceof Error ? error.message : error}`,
      'error'
    );
    return false;
  }
}

async function checkDependencies() {
  log('Checking dependencies...');

  try {
    execSync('pnpm install --frozen-lockfile', { stdio: 'pipe' });
    log('Dependencies are up to date', 'success');
    return true;
  } catch (error) {
    log(
      `Dependency check failed: ${error instanceof Error ? error.message : error}`,
      'warn'
    );
    return false;
  }
}

async function fixDatabaseIfNeeded() {
  log('Attempting to fix database issues...');

  try {
    execSync('pnpm db:push', { stdio: 'pipe' });
    log('Database schema synchronized', 'success');
    return true;
  } catch (error) {
    log(
      `Database fix failed: ${error instanceof Error ? error.message : error}`,
      'error'
    );
    return false;
  }
}

async function main() {
  log('🚀 Starting comprehensive startup check...\n');

  const checks = [
    { name: 'Environment', fn: checkEnvironment },
    { name: 'Dependencies', fn: checkDependencies },
    { name: 'Prisma Client', fn: checkPrismaClient },
    { name: 'Database', fn: checkDatabase },
  ];

  let allPassed = true;

  for (const check of checks) {
    const passed = await check.fn();
    if (!passed) {
      allPassed = false;
      if (check.name === 'Database') {
        const fixed = await fixDatabaseIfNeeded();
        if (fixed) {
          const retryPassed = await checkDatabase();
          if (retryPassed) {
            allPassed = true;
          }
        }
      }
    }
    console.log(''); // Add spacing
  }

  if (allPassed) {
    log(
      '🎉 All startup checks passed! Application should start successfully.',
      'success'
    );
    process.exit(0);
  } else {
    log('❌ Some startup checks failed. Please fix the issues above.', 'error');
    process.exit(1);
  }
}

// Cleanup
process.on('exit', async () => {
  await prisma.$disconnect();
});

main().catch(error => {
  log(
    `Startup check failed: ${error instanceof Error ? error.message : error}`,
    'error'
  );
  process.exit(1);
});
