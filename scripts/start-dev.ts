#!/usr/bin/env tsx

import { execSync, spawn } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndSetupDatabase() {
  console.log('🚀 Starting development server with database health check...\n');

  try {
    // Check if database has users
    const userCount = await prisma.user.count();

    if (userCount === 0) {
      console.log('⚠️  Database appears to be empty. Seeding...');
      execSync('pnpm db:seed', { stdio: 'inherit' });
      console.log('✅ Database seeded successfully!\n');
    } else {
      console.log(`✅ Database healthy (${userCount} users found)\n`);
    }

    // Check if new tables exist and have data
    const caseCount = await prisma.case.count();
    console.log(`📊 Database status: ${userCount} users, ${caseCount} cases\n`);
  } catch (error) {
    console.log('❌ Database check failed:', error instanceof Error ? error.message : error);
    console.log('🛠️  Attempting to fix...');

    try {
      execSync('pnpm db:setup', { stdio: 'inherit' });
      console.log('✅ Database fixed and seeded!\n');
    } catch (fixError) {
      console.log('❌ Failed to fix database. Please run manually:');
      console.log('   pnpm db:reset:full');
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function startDevServer() {
  console.log('🔥 Starting Next.js development server...\n');

  // Start the dev server
  const devProcess = spawn('pnpm', ['dev'], {
    stdio: 'inherit',
    shell: true,
    detached: false,
  });

  devProcess.on('error', (error) => {
    console.error('❌ Failed to start dev server:', error);
    process.exit(1);
  });

  devProcess.on('exit', (code) => {
    if (code !== 0) {
      console.log(`\n⚠️  Dev server exited with code ${code}`);
    }
  });
}

async function main() {
  await checkAndSetupDatabase();
  await startDevServer();
}

main().catch((error) => {
  console.error('❌ Startup failed:', error);
  process.exit(1);
});
