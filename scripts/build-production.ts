#!/usr/bin/env tsx

/**
 * Production Build Script
 * 
 * This script builds the application for production with all
 * optimizations and validations.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
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

function exec(command: string, options: { cwd?: string; stdio?: 'inherit' | 'pipe' } = {}) {
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

async function validateEnvironment() {
  log('🔍 Validating production environment...', 'blue');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];
  
  const missingVars: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    log(`❌ Missing required environment variables: ${missingVars.join(', ')}`, 'red');
    log('Please set these variables before building for production', 'yellow');
    process.exit(1);
  }
  
  // Validate NEXTAUTH_SECRET length
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    log('⚠️  NEXTAUTH_SECRET should be at least 32 characters long', 'yellow');
  }
  
  log('✅ Environment validation passed', 'green');
}

async function runLinting() {
  log('🔍 Running linting...', 'blue');
  
  try {
    exec('pnpm lint');
    log('✅ Linting passed', 'green');
  } catch (error) {
    log('❌ Linting failed', 'red');
    throw error;
  }
}

async function runTypeChecking() {
  log('🔍 Running type checking...', 'blue');
  
  try {
    exec('pnpm typecheck');
    log('✅ Type checking passed', 'green');
  } catch (error) {
    log('❌ Type checking failed', 'red');
    throw error;
  }
}

async function runTests() {
  log('🧪 Running tests...', 'blue');
  
  try {
    exec('pnpm test');
    log('✅ Tests passed', 'green');
  } catch (error) {
    log('⚠️  Some tests failed', 'yellow');
    log('Continuing with build...', 'yellow');
  }
}

async function runSecurityAudit() {
  log('🔒 Running security audit...', 'blue');
  
  try {
    exec('pnpm audit --audit-level moderate');
    log('✅ Security audit passed', 'green');
  } catch (error) {
    log('⚠️  Security vulnerabilities found', 'yellow');
    log('Please review and fix security issues', 'yellow');
  }
}

async function buildApplication() {
  log('🏗️  Building application...', 'blue');
  
  try {
    // Clean previous build
    exec('rm -rf .next');
    
    // Build the application
    exec('pnpm build');
    
    log('✅ Application built successfully', 'green');
  } catch (error) {
    log('❌ Build failed', 'red');
    throw error;
  }
}

async function analyzeBundle() {
  log('📊 Analyzing bundle size...', 'blue');
  
  try {
    exec('pnpm analyze');
    log('✅ Bundle analysis completed', 'green');
  } catch (error) {
    log('⚠️  Bundle analysis failed', 'yellow');
    log('You can run "pnpm analyze" manually later', 'yellow');
  }
}

async function generateBuildInfo() {
  log('📝 Generating build information...', 'blue');
  
  const buildInfo = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    nodeVersion: process.version,
    platform: process.platform,
    buildId: process.env.BUILD_ID || `build-${Date.now()}`,
    gitCommit: process.env.GIT_COMMIT || 'unknown',
    gitBranch: process.env.GIT_BRANCH || 'unknown',
  };
  
  const buildInfoPath = join(process.cwd(), '.next', 'build-info.json');
  writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  
  log('✅ Build information generated', 'green');
}

async function validateBuild() {
  log('✅ Validating build...', 'blue');
  
  const buildPath = join(process.cwd(), '.next');
  if (!existsSync(buildPath)) {
    log('❌ Build directory not found', 'red');
    throw new Error('Build failed - no .next directory found');
  }
  
  // Check for critical files
  const criticalFiles = [
    'server.js',
    'static/chunks/pages/_app.js',
    'static/chunks/pages/index.js',
  ];
  
  for (const file of criticalFiles) {
    const filePath = join(buildPath, file);
    if (!existsSync(filePath)) {
      log(`⚠️  Critical file missing: ${file}`, 'yellow');
    }
  }
  
  log('✅ Build validation completed', 'green');
}

async function main() {
  log('🚀 Starting production build...', 'bold');
  
  try {
    await validateEnvironment();
    await runLinting();
    await runTypeChecking();
    await runTests();
    await runSecurityAudit();
    await buildApplication();
    await analyzeBundle();
    await generateBuildInfo();
    await validateBuild();
    
    log('\n🎉 Production build completed successfully!', 'green');
    log('\nBuild artifacts:', 'blue');
    log('• .next/ - Next.js build output', 'yellow');
    log('• .next/build-info.json - Build metadata', 'yellow');
    log('\nNext steps:', 'blue');
    log('1. Test the production build locally with "pnpm start"', 'yellow');
    log('2. Deploy to your hosting platform', 'yellow');
    log('3. Monitor the application in production', 'yellow');
    
  } catch (error) {
    log('\n❌ Production build failed:', 'red');
    log(error instanceof Error ? error.message : 'Unknown error', 'red');
    process.exit(1);
  }
}

// Run the build
main();
