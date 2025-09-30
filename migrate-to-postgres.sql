-- Migration script to convert SQLite schema to PostgreSQL
-- This will be used when setting up the PostgreSQL database

-- Enable UUID extension for better ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The Prisma migration will handle the actual table creation
-- This file is just for reference and manual setup if needed

-- Note: Prisma will automatically handle the migration from SQLite to PostgreSQL
-- when you run: pnpm db:push or pnpm db:migrate
