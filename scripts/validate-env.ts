#!/usr/bin/env tsx

/**
 * Environment Validation Script
 * 
 * This script validates the environment configuration for production deployment
 * and provides recommendations for missing or incorrect settings.
 */

import { existsSync, readFileSync } from 'fs';
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

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

class EnvironmentValidator {
  private errors: string[] = [];
  private warnings: string[] = [];
  private recommendations: string[] = [];

  validate(): ValidationResult {
    this.validateRequiredVariables();
    this.validateDatabaseConfiguration();
    this.validateAuthenticationConfiguration();
    this.validateSecurityConfiguration();
    this.validateOptionalConfiguration();
    this.validateFileStructure();

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      recommendations: this.recommendations,
    };
  }

  private validateRequiredVariables() {
    const required = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
    ];

    for (const variable of required) {
      if (!process.env[variable]) {
        this.errors.push(`Missing required environment variable: ${variable}`);
      }
    }
  }

  private validateDatabaseConfiguration() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return;

    // Check if it's a valid database URL
    if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('file:')) {
      this.errors.push('DATABASE_URL must be a valid PostgreSQL or SQLite URL');
    }

    // Check for production database
    if (databaseUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
      this.warnings.push('Using localhost database in production is not recommended');
    }

    // Check for SQLite in production
    if (databaseUrl.startsWith('file:') && process.env.NODE_ENV === 'production') {
      this.warnings.push('SQLite is not recommended for production use');
    }
  }

  private validateAuthenticationConfiguration() {
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    if (!nextAuthSecret) return;

    // Check secret length
    if (nextAuthSecret.length < 32) {
      this.errors.push('NEXTAUTH_SECRET must be at least 32 characters long');
    }

    // Check for weak secrets
    const weakSecrets = ['secret', 'password', '123456', 'development'];
    if (weakSecrets.some(weak => nextAuthSecret.toLowerCase().includes(weak))) {
      this.warnings.push('NEXTAUTH_SECRET appears to be weak or predictable');
    }

    // Check URL format
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    if (nextAuthUrl && !nextAuthUrl.startsWith('http')) {
      this.errors.push('NEXTAUTH_URL must be a valid URL starting with http:// or https://');
    }

    // Check for HTTPS in production
    if (nextAuthUrl && nextAuthUrl.startsWith('http://') && process.env.NODE_ENV === 'production') {
      this.warnings.push('NEXTAUTH_URL should use HTTPS in production');
    }
  }

  private validateSecurityConfiguration() {
    // Check encryption key
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (encryptionKey && encryptionKey.length !== 32) {
      this.errors.push('ENCRYPTION_KEY must be exactly 32 characters long');
    }

    // Check Redis configuration
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl && !redisUrl.startsWith('redis://')) {
      this.warnings.push('REDIS_URL should start with redis://');
    }

    // Check Upstash Redis configuration
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if ((upstashUrl && !upstashToken) || (!upstashUrl && upstashToken)) {
      this.warnings.push('Both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set together');
    }
  }

  private validateOptionalConfiguration() {
    // Check email configuration
    const emailHost = process.env.EMAIL_SERVER_HOST;
    const emailPort = process.env.EMAIL_SERVER_PORT;
    const emailUser = process.env.EMAIL_SERVER_USER;
    const emailPassword = process.env.EMAIL_SERVER_PASSWORD;

    if (emailHost || emailPort || emailUser || emailPassword) {
      const emailVars = [emailHost, emailPort, emailUser, emailPassword];
      const missingEmailVars = emailVars.filter(v => !v);
      
      if (missingEmailVars.length > 0) {
        this.warnings.push('Incomplete email configuration - all email variables should be set together');
      }
    }

    // Check for development values in production
    if (process.env.NODE_ENV === 'production') {
      const devValues = [
        { key: 'NEXTAUTH_URL', value: 'localhost' },
        { key: 'DATABASE_URL', value: 'localhost' },
        { key: 'NEXTAUTH_SECRET', value: 'development' },
      ];

      for (const { key, value } of devValues) {
        if (process.env[key]?.toLowerCase().includes(value)) {
          this.warnings.push(`${key} appears to contain development values in production`);
        }
      }
    }
  }

  private validateFileStructure() {
    const requiredFiles = [
      'package.json',
      'next.config.js',
      'tsconfig.json',
      '.env.example',
    ];

    for (const file of requiredFiles) {
      if (!existsSync(join(process.cwd(), file))) {
        this.warnings.push(`Missing recommended file: ${file}`);
      }
    }

    // Check for environment files
    const envFiles = ['.env.local', '.env.production', '.env'];
    const existingEnvFiles = envFiles.filter(file => existsSync(join(process.cwd(), file)));
    
    if (existingEnvFiles.length === 0) {
      this.warnings.push('No environment files found');
    }

    // Check for sensitive files
    const sensitiveFiles = ['.env', '.env.local', '.env.production'];
    for (const file of sensitiveFiles) {
      if (existsSync(join(process.cwd(), file))) {
        const content = readFileSync(join(process.cwd(), file), 'utf8');
        if (content.includes('password') || content.includes('secret')) {
          this.recommendations.push(`Ensure ${file} is not committed to version control`);
        }
      }
    }
  }
}

async function main() {
  log('🔍 Validating environment configuration...', 'blue');
  
  const validator = new EnvironmentValidator();
  const result = validator.validate();
  
  if (result.errors.length > 0) {
    log('\n❌ Validation failed with errors:', 'red');
    result.errors.forEach(error => log(`  • ${error}`, 'red'));
  }
  
  if (result.warnings.length > 0) {
    log('\n⚠️  Warnings:', 'yellow');
    result.warnings.forEach(warning => log(`  • ${warning}`, 'yellow'));
  }
  
  if (result.recommendations.length > 0) {
    log('\n💡 Recommendations:', 'blue');
    result.recommendations.forEach(rec => log(`  • ${rec}`, 'blue'));
  }
  
  if (result.isValid) {
    log('\n✅ Environment validation passed!', 'green');
  } else {
    log('\n❌ Environment validation failed!', 'red');
    process.exit(1);
  }
  
  // Additional production checks
  if (process.env.NODE_ENV === 'production') {
    log('\n🚀 Production deployment checklist:', 'blue');
    log('  • SSL certificate configured', 'yellow');
    log('  • Database backups scheduled', 'yellow');
    log('  • Monitoring and alerts setup', 'yellow');
    log('  • Error tracking configured', 'yellow');
    log('  • Performance monitoring enabled', 'yellow');
    log('  • Security headers configured', 'yellow');
    log('  • Rate limiting enabled', 'yellow');
  }
}

// Run validation
main();
