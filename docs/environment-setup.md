# Environment Setup

## Prerequisites

### SQLite Database (Development)

The application uses SQLite for development, which requires no additional setup. The database file will be created automatically in `prisma/dev.db`.

## Database Configuration

The `.env` file is already configured with:

```bash
DATABASE_URL="file:./prisma/dev.db"
```

For production, you can use PostgreSQL by updating the schema and environment:

```bash
# .env.production
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
