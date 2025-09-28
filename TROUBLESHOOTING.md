# Troubleshooting Guide

## App Not Opening - Common Issues and Solutions

### 1. Database Configuration Mismatch

**Problem**: The app fails to start due to database configuration inconsistencies.

**Symptoms**:

- App starts but immediately crashes
- Database connection errors
- Prisma client errors

**Solution**:

```bash
# Run the comprehensive startup check
pnpm startup:check

# If database issues are found, fix them:
pnpm db:generate
pnpm db:push
```

### 2. Environment Variables Missing

**Problem**: Required environment variables are not set.

**Symptoms**:

- "Environment validation failed" errors
- NextAuth configuration errors

**Solution**:

```bash
# Ensure .env file exists and has required variables:
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Multiple Development Servers Running

**Problem**: Multiple Next.js development processes are running, causing port conflicts.

**Symptoms**:

- Port 3000 already in use
- App appears to start but doesn't respond

**Solution**:

```bash
# Kill all existing Next.js processes
pkill -f "next dev"

# Start fresh
pnpm dev
```

### 4. Prisma Client Out of Sync

**Problem**: Prisma client is not generated or out of sync with schema.

**Symptoms**:

- "Prisma client not generated" errors
- Database query failures

**Solution**:

```bash
# Regenerate Prisma client
pnpm db:generate

# Push schema changes
pnpm db:push
```

### 5. Dependencies Issues

**Problem**: Node modules are corrupted or missing.

**Symptoms**:

- Import errors
- Module not found errors

**Solution**:

```bash
# Clean install dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Quick Diagnostic Commands

```bash
# Check if app is running
curl -I http://localhost:3000

# Check database health
pnpm db:health

# Run comprehensive startup check
pnpm startup:check

# Check for running processes
ps aux | grep -E "(next|node)" | grep -v grep
```

## Prevention Tips

1. **Always use the startup check**: Run `pnpm startup:check` before starting development
2. **Use the setup command**: Use `pnpm dev:setup` instead of `pnpm dev` for automatic health checks
3. **Keep environment files consistent**: Ensure `.env` matches the expected configuration
4. **Regular maintenance**: Run `pnpm db:generate` after schema changes

## Emergency Reset

If all else fails, perform a complete reset:

```bash
# Stop all processes
pkill -f "next dev"
pkill -f "node"

# Clean everything
rm -rf node_modules pnpm-lock.yaml
rm -f prisma/dev.db

# Reinstall and setup
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev:setup
```
