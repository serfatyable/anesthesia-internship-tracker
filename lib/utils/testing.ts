/**
 * Comprehensive testing utilities and helpers
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';
import { NextAuthProvider } from '@/components/NextAuthProvider';

// Mock data generators
export const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'INTERN' as const,
  idNumber: 'TEST123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockSession = {
  user: mockUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const mockRotation = {
  id: 'test-rotation-id',
  name: 'Test Rotation',
  description: 'Test rotation description',
  isActive: true,
  state: 'ACTIVE',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockProcedure = {
  id: 'test-procedure-id',
  name: 'Test Procedure',
  description: 'Test procedure description',
  rotationId: 'test-rotation-id',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockLogEntry = {
  id: 'test-log-id',
  internId: 'test-user-id',
  procedureId: 'test-procedure-id',
  date: new Date('2024-01-01'),
  count: 1,
  notes: 'Test notes',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockVerification = {
  id: 'test-verification-id',
  logEntryId: 'test-log-id',
  verifierId: 'test-verifier-id',
  reason: 'Test reason',
  timestamp: new Date('2024-01-01'),
  status: 'PENDING' as const,
};

// Mock API responses
export const mockApiResponse = <T>(data: T, status: number = 200) => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: new Headers(),
  ok: status >= 200 && status < 300,
});

// Mock fetch function
export const mockFetch = (responses: Record<string, any>) => {
  return (url: string) => {
    const response = responses[url];
    if (response) {
      return Promise.resolve(mockApiResponse(response));
    }
    return Promise.reject(new Error(`No mock response for ${url}`));
  };
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: any;
  initialEntries?: string[];
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {},
): RenderResult {
  const { session = mockSession, ...renderOptions } = options;

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(NextAuthProvider, { session } as any, children);
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
}

// Test data factories
export const createMockUser = (overrides: Partial<typeof mockUser> = {}) => ({
  ...mockUser,
  ...overrides,
});

export const createMockRotation = (overrides: Partial<typeof mockRotation> = {}) => ({
  ...mockRotation,
  ...overrides,
});

export const createMockProcedure = (overrides: Partial<typeof mockProcedure> = {}) => ({
  ...mockProcedure,
  ...overrides,
});

export const createMockLogEntry = (overrides: Partial<typeof mockLogEntry> = {}) => ({
  ...mockLogEntry,
  ...overrides,
});

export const createMockVerification = (overrides: Partial<typeof mockVerification> = {}) => ({
  ...mockVerification,
  ...overrides,
});

// Test utilities for async operations
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

export const waitForCondition = async (
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100,
): Promise<void> => {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
};

// Mock Prisma client
export const createMockPrismaClient = () => ({
  user: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  },
  rotation: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  },
  procedure: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  },
  logEntry: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  },
  verification: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  },
  $transaction: () => Promise.resolve({}),
  $disconnect: () => Promise.resolve(),
});

// Test environment setup
export const setupTestEnvironment = () => {
  // Mock environment variables
  if (typeof process !== 'undefined') {
    (process.env as any).NODE_ENV = 'test';
    (process.env as any).NEXTAUTH_SECRET = 'test-secret';
    (process.env as any).DATABASE_URL = 'file:./test.db';
  }

  // Mock console methods to reduce noise in tests
  const originalConsole = { ...console };

  // Note: In a real testing environment, you would use beforeEach/afterEach
  // For now, we'll just provide the setup function
  return {
    originalConsole,
    mockConsole: () => {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
    },
    restoreConsole: () => {
      Object.assign(console, originalConsole);
    },
  };
};

// Performance testing utilities
export const measurePerformance = async <T>(
  fn: () => Promise<T> | T,
  iterations: number = 1,
): Promise<{
  result: T;
  averageTime: number;
  minTime: number;
  maxTime: number;
  times: number[];
}> => {
  const times: number[] = [];
  let result: T;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    result = await fn();
    const end = performance.now();
    times.push(end - start);
  }

  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  return {
    result: result!,
    averageTime,
    minTime,
    maxTime,
    times,
  };
};

// Memory testing utilities
export const measureMemoryUsage = () => {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage();
  }
  return null;
};

// Test data cleanup
export const cleanupTestData = async () => {
  // Clean up any test data that might have been created
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
  }
};

// Mock API routes for testing
export const mockApiRoutes = {
  '/api/logs': {
    GET: mockApiResponse([mockLogEntry]),
    POST: mockApiResponse({ id: 'new-log-id' }, 201),
  },
  '/api/procedures': {
    GET: mockApiResponse([mockProcedure]),
  },
  '/api/verifications': {
    GET: mockApiResponse([mockVerification]),
    POST: mockApiResponse({ success: true }),
  },
  '/api/progress': {
    GET: mockApiResponse({
      summary: {
        totalRequired: 100,
        totalVerified: 50,
        totalPending: 10,
        completionPercentage: 50,
      },
      rotations: [mockRotation],
    }),
  },
};

// Test assertions
export const expectToBeValidDate = (date: any) => {
  expect(date).toBeInstanceOf(Date);
  expect(date.getTime()).not.toBeNaN();
};

export const expectToBeValidId = (id: any) => {
  expect(typeof id).toBe('string');
  expect(id.length).toBeGreaterThan(0);
};

export const expectToBeValidEmail = (email: any) => {
  expect(typeof email).toBe('string');
  expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

// Test data generators for different scenarios
export const generateTestUsers = (count: number) => {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({
      id: `user-${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      idNumber: `ID${i.toString().padStart(3, '0')}`,
    }),
  );
};

export const generateTestLogs = (count: number, userId: string = 'test-user-id') => {
  return Array.from({ length: count }, (_, i) =>
    createMockLogEntry({
      id: `log-${i}`,
      internId: userId,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Spread over days
      count: Math.floor(Math.random() * 5) + 1,
    }),
  );
};

// Export everything for easy importing
export * from '@testing-library/react';
export { renderWithProviders as render };
