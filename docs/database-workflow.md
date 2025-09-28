# Database Workflow Guide

## 🚨 Common Issue: Empty Database After Schema Changes

### Why This Happens

- Database schema changes don't automatically update existing data
- Migrations can fail or get out of sync
- Development databases get reset but not re-seeded
- New tables are created empty

### ✅ Solution: Automated Database Management

## Available Commands

### Quick Start (Recommended)

```bash
pnpm dev:auto
```

This command:

1. Checks database health
2. Auto-seeds if empty
3. Starts development server

### Manual Database Management

```bash
# Check database health
pnpm db:health

# Setup database (push schema + seed)
pnpm db:setup

# Reset database completely and re-seed
pnpm db:reset:full

# Just seed the database
pnpm db:seed
```

## Workflow for Schema Changes

When you modify `prisma/schema.prisma`:

1. **Update the schema**
2. **Push changes**: `pnpm db:push`
3. **Update seed script** if needed
4. **Re-seed**: `pnpm db:seed`

Or simply run: `pnpm db:setup`

## Development Best Practices

### For New Developers

```bash
# First time setup
pnpm install
pnpm dev:auto
```

### After Pulling Changes

```bash
# If schema changed
pnpm db:setup

# Or just check and fix
pnpm db:health
```

### When Things Go Wrong

```bash
# Nuclear option - reset everything
pnpm db:reset:full
pnpm dev
```

## Demo Users

After seeding, these accounts are available:

- **Admin**: `admin@demo.local` / `admin123`
- **Tutor**: `tutor@demo.local` / `tutor123`
- **Interns**: `intern@demo.local` / `intern123`

## Troubleshooting

### "No users found" Error

```bash
pnpm db:seed
```

### "Database connection failed"

```bash
pnpm db:reset:full
```

### Schema sync issues

```bash
pnpm db:push
pnpm db:seed
```

### Complete reset

```bash
pnpm db:reset:full
```

## Prevention Tips

1. **Always use `pnpm dev:auto`** for development
2. **Run `pnpm db:health`** after schema changes
3. **Update seed script** when adding new required data
4. **Test on fresh database** before deploying

This workflow prevents the "empty database" issue from recurring!
