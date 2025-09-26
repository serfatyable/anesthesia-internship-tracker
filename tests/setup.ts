import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js headers and cookies
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    get: vi.fn(() => undefined),
  })),
}));

// Mock NextAuth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

// Mock NextAuth options
vi.mock('@/lib/auth/options', () => ({
  authOptions: {},
}));
