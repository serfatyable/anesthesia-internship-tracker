import '@testing-library/jest-dom';
import React from 'react';

// Make React available globally for JSX
global.React = React;

// Set test environment
process.env.NODE_ENV = 'test';

// Ensure required env vars exist for tests without strict validation
(process.env as any).SKIP_ENV_VALIDATION = 'true';
(process.env as any).NEXTAUTH_SECRET = (process.env.NEXTAUTH_SECRET ||
  'test-secret-key-test-secret-key-test') as string;
(process.env as any).NEXTAUTH_URL = (process.env.NEXTAUTH_URL || 'http://localhost:3000') as string;
(process.env as any).DATABASE_URL = (process.env.DATABASE_URL || 'file:./prisma/test.db') as string;

// Disable monitoring during tests
(process.env as any).DISABLE_MONITORING = 'true';
