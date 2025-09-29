#!/usr/bin/env tsx

/**
 * Development Environment Setup Script
 *
 * This script sets up the development environment with all necessary
 * configurations, dependencies, and database setup.
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(
  command: string,
  options: { cwd?: string; stdio?: 'inherit' | 'pipe' } = {}
) {
  try {
    return execSync(command, {
      stdio: options.stdio || 'inherit',
      cwd: options.cwd || process.cwd(),
    });
  } catch (error) {
    log(`Error executing command: ${command}`, 'red');
    throw error;
  }
}

async function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'blue');

  const requiredCommands = ['node', 'pnpm', 'git'];
  const missingCommands: string[] = [];

  for (const cmd of requiredCommands) {
    try {
      exec(`${cmd} --version`, { stdio: 'pipe' });
    } catch {
      missingCommands.push(cmd);
    }
  }

  if (missingCommands.length > 0) {
    log(`❌ Missing required commands: ${missingCommands.join(', ')}`, 'red');
    log('Please install the missing commands and try again.', 'yellow');
    process.exit(1);
  }

  log('✅ All prerequisites found', 'green');
}

async function installDependencies() {
  log('📦 Installing dependencies...', 'blue');

  try {
    exec('pnpm install');
    log('✅ Dependencies installed successfully', 'green');
  } catch (error) {
    log('❌ Failed to install dependencies', 'red');
    throw error;
  }
}

async function setupEnvironment() {
  log('🔧 Setting up environment variables...', 'blue');

  const envExamplePath = join(process.cwd(), '.env.example');
  const envLocalPath = join(process.cwd(), '.env.local');

  if (!existsSync(envExamplePath)) {
    log(
      '⚠️  .env.example not found, creating basic environment file...',
      'yellow'
    );

    const basicEnv = `# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="development-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Email (optional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="your-email@gmail.com"
`;

    writeFileSync(envExamplePath, basicEnv);
  }

  if (!existsSync(envLocalPath)) {
    log('📝 Creating .env.local from .env.example...', 'blue');
    exec(`cp ${envExamplePath} ${envLocalPath}`);
    log('✅ Environment file created', 'green');
    log('⚠️  Please update .env.local with your actual values', 'yellow');
  } else {
    log('✅ Environment file already exists', 'green');
  }
}

async function setupDatabase() {
  log('🗄️  Setting up database...', 'blue');

  try {
    // Generate Prisma client
    exec('pnpm db:generate');

    // Push database schema
    exec('pnpm db:push');

    // Seed database
    exec('pnpm db:seed');

    log('✅ Database setup completed', 'green');
  } catch (error) {
    log('❌ Database setup failed', 'red');
    log('Please check your DATABASE_URL in .env.local', 'yellow');
    throw error;
  }
}

async function runLinting() {
  log('🔍 Running linting...', 'blue');

  try {
    exec('pnpm lint');
    log('✅ Linting passed', 'green');
  } catch (error) {
    log('⚠️  Linting issues found, attempting to fix...', 'yellow');
    try {
      exec('pnpm lint:fix');
      log('✅ Linting issues fixed', 'green');
    } catch (fixError) {
      log('❌ Could not auto-fix linting issues', 'red');
      log('Please fix them manually', 'yellow');
    }
  }
}

async function runTypeChecking() {
  log('🔍 Running type checking...', 'blue');

  try {
    exec('pnpm typecheck');
    log('✅ Type checking passed', 'green');
  } catch (error) {
    log('❌ Type checking failed', 'red');
    log('Please fix the TypeScript errors', 'yellow');
  }
}

async function runTests() {
  log('🧪 Running tests...', 'blue');

  try {
    exec('pnpm test');
    log('✅ Tests passed', 'green');
  } catch (error) {
    log('⚠️  Some tests failed', 'yellow');
    log('Please check the test output above', 'yellow');
  }
}

async function setupGitHooks() {
  log('🪝 Setting up Git hooks...', 'blue');

  try {
    exec('pnpm prepare');
    log('✅ Git hooks setup completed', 'green');
  } catch (error) {
    log('⚠️  Git hooks setup failed', 'yellow');
    log('You can run "pnpm prepare" manually later', 'yellow');
  }
}

async function main() {
  log('🚀 Starting development environment setup...', 'bold');

  try {
    await checkPrerequisites();
    await installDependencies();
    await setupEnvironment();
    await setupDatabase();
    await runLinting();
    await runTypeChecking();
    await runTests();
    await setupGitHooks();

    log('\n🎉 Development environment setup completed!', 'green');
    log('\nNext steps:', 'blue');
    log('1. Update .env.local with your actual values', 'yellow');
    log('2. Run "pnpm dev" to start the development server', 'yellow');
    log('3. Open http://localhost:3000 in your browser', 'yellow');
    log('\nHappy coding! 🚀', 'green');
  } catch (error) {
    log('\n❌ Setup failed:', 'red');
    log(error instanceof Error ? error.message : 'Unknown error', 'red');
    process.exit(1);
  }
}

// Run the setup
main();
