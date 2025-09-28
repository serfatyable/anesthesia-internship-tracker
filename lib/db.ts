import { PrismaClient } from '@prisma/client';
import { env } from './env';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Enhanced Prisma configuration with connection pooling and better error handling
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['error', 'warn', 'info'] : ['error'],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    // Connection pooling configuration
    __internal: {
      engine: {
        connectTimeout: 60000, // 60 seconds
        queryTimeout: 30000, // 30 seconds
      },
    },
  });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Enhanced error handling and connection management
let isConnected = false;

export async function connectDatabase() {
  if (isConnected) return;

  try {
    await prisma.$connect();
    isConnected = true;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw new Error('Failed to connect to database');
  }
}

export async function disconnectDatabase() {
  if (!isConnected) return;

  try {
    await prisma.$disconnect();
    isConnected = false;
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', connected: isConnected };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Graceful shutdown handlers
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  await disconnectDatabase();
  process.exit(0);
};

process.on('beforeExit', () => shutdown('beforeExit'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await disconnectDatabase();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await disconnectDatabase();
  process.exit(1);
});
