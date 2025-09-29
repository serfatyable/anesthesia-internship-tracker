import '@testing-library/jest-dom';

// Ensure required env vars exist for tests without strict validation
(process.env as any).SKIP_ENV_VALIDATION = 'true';
(process.env as any).NEXTAUTH_SECRET = (process.env.NEXTAUTH_SECRET ||
  'test-secret-key-test-secret-key-test') as string;
(process.env as any).NEXTAUTH_URL = (process.env.NEXTAUTH_URL || 'http://localhost:3000') as string;
(process.env as any).DATABASE_URL = (process.env.DATABASE_URL || 'file:./prisma/test.db') as string;
