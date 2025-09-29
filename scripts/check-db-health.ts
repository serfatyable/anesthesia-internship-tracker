#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

interface HealthCheckResult {
  isHealthy: boolean;
  issues: string[];
  userCount: number;
  rotationCount: number;
  caseCount: number;
}

async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    isHealthy: true,
    issues: [],
    userCount: 0,
    rotationCount: 0,
    caseCount: 0,
  };

  try {
    // Check if database is accessible
    await prisma.$connect();

    // Check for users
    const userCount = await prisma.user.count();
    result.userCount = userCount;

    if (userCount === 0) {
      result.isHealthy = false;
      result.issues.push('No users found in database');
    }

    // Check for rotations
    const rotationCount = await prisma.rotation.count();
    result.rotationCount = rotationCount;

    if (rotationCount === 0) {
      result.isHealthy = false;
      result.issues.push('No rotations found in database');
    }

    // Check for cases (new table)
    const caseCount = await prisma.case.count();
    result.caseCount = caseCount;

    // Check for required demo users
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@demo.local' },
    });
    if (!adminUser) {
      result.isHealthy = false;
      result.issues.push('Admin demo user not found');
    }

    const internUser = await prisma.user.findFirst({
      where: { email: 'intern@demo.local' },
    });
    if (!internUser) {
      result.isHealthy = false;
      result.issues.push('Intern demo user not found');
    }
  } catch (error) {
    result.isHealthy = false;
    result.issues.push(
      `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    await prisma.$disconnect();
  }

  return result;
}

async function main() {
  console.log('🔍 Checking database health...\n');

  const health = await checkDatabaseHealth();

  if (health.isHealthy) {
    console.log('✅ Database is healthy!');
    console.log(`   Users: ${health.userCount}`);
    console.log(`   Rotations: ${health.rotationCount}`);
    console.log(`   Cases: ${health.caseCount}`);
  } else {
    console.log('❌ Database health issues found:');
    health.issues.forEach(issue => {
      console.log(`   • ${issue}`);
    });
    console.log('\n🛠️  Attempting to fix...');

    try {
      // Try to run seed
      console.log('   Running database seed...');
      execSync('pnpm db:seed', { stdio: 'inherit' });

      // Check again
      const recheck = await checkDatabaseHealth();
      if (recheck.isHealthy) {
        console.log('\n✅ Database fixed and seeded successfully!');
        console.log(`   Users: ${recheck.userCount}`);
        console.log(`   Rotations: ${recheck.rotationCount}`);
        console.log(`   Cases: ${recheck.caseCount}`);
      } else {
        console.log('\n❌ Failed to fix database issues');
        process.exit(1);
      }
    } catch (error) {
      console.log(
        `\n❌ Failed to seed database: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      console.log('\n📋 Manual steps to fix:');
      console.log('   1. Run: pnpm db:reset');
      console.log('   2. Run: pnpm db:seed');
      process.exit(1);
    }
  }
}

main().catch(error => {
  console.error('❌ Health check failed:', error);
  process.exit(1);
});
