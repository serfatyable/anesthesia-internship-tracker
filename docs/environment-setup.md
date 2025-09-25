# Environment Setup

## Prerequisites

### PostgreSQL Setup

1. **Install PostgreSQL** (if not already installed):

   ```bash
   # macOS with Homebrew
   brew install postgresql@15
   brew services start postgresql@15

   # Or use PostgreSQL.app for macOS
   # Download from https://postgresapp.com/
   ```

2. **Create the database**:

   ```bash
   # Connect to PostgreSQL
   psql postgres

   # Create database and user
   CREATE DATABASE anesthesia_tracker;
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE anesthesia_tracker TO postgres;
   \q
   ```

## Database Configuration

The `.env` file is already configured with:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/anesthesia_tracker?schema=public"
```

For production, create a `.env.local` file with your actual values:

```bash
# .env.local
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/anesthesia_tracker?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Database Setup Commands

```bash
# Generate Prisma client
pnpm db:generate

# Run initial migration
pnpm db:migrate

# Seed the database with demo data
pnpm db:seed

# Open Prisma Studio to view data
pnpm db:studio
```

## Node.js Version

Use Node 20 LTS for local dev to avoid tooling incompatibilities with TypeScript/Vitest.

```bash
# if you use nvm
nvm install 20
nvm use 20
# repo has .nvmrc so simply
nvm use
```

## Troubleshooting

- **"Can't reach database server"**: Make sure PostgreSQL is running (`brew services start postgresql@15`)
- **"Database does not exist"**: Create the database as shown in Prerequisites
- **Connection refused**: Check if PostgreSQL is listening on port 5432
