/**
 * Comprehensive testing utilities and helpers
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { UserRole } from '@/types/api';

// Mock data factories
export const mockUser = (overrides: Partial<any> = {}) => ({
  id: 'user_123',
  name: 'Test User',
  email: 'test@example.com',
  idNumber: 'TEST123',
  role: 'INTERN' as UserRole,
  password: 'hashed_password',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

export const mockCase = (overrides: Partial<any> = {}) => ({
  id: 'case_123',
  title: 'Test Case',
  category: 'Cardiac',
  description: 'Test case description',
  image1Url: null,
  image2Url: null,
  image3Url: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  authorId: 'user_123',
  ...overrides,
});

export const mockLogEntry = (overrides: Partial<any> = {}) => ({
  id: 'log_123',
  internId: 'user_123',
  procedureId: 'proc_123',
  date: new Date('2024-01-01T00:00:00.000Z'),
  count: 1,
  notes: 'Test notes',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

export const mockProcedure = (overrides: Partial<any> = {}) => ({
  id: 'proc_123',
  name: 'Test Procedure',
  description: 'Test procedure description',
  rotationId: 'rot_123',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

export const mockRotation = (overrides: Partial<any> = {}) => ({
  id: 'rot_123',
  name: 'Test Rotation',
  description: 'Test rotation description',
  isActive: true,
  state: 'ACTIVE',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

// Request builders
export const createMockRequest = (
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
  } = {}
): NextRequest => {
  const { method = 'GET', body, headers = {}, searchParams = {} } = options;

  const urlObj = new URL(url);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(urlObj.toString(), requestInit as any);
};

// Database helpers
export const createTestUser = async (userData: Partial<any> = {}) => {
  const user = mockUser(userData);
  const hashedPassword = await hash(user.password, 12);

  return prisma.user.create({
    data: {
      ...user,
      password: hashedPassword,
    },
  });
};

export const createTestCase = async (caseData: Partial<any> = {}) => {
  const caseObj = mockCase(caseData);

  return prisma.case.create({
    data: caseObj,
  });
};

export const createTestLogEntry = async (logData: Partial<any> = {}) => {
  const log = mockLogEntry(logData);

  return prisma.logEntry.create({
    data: log,
  });
};

export const createTestProcedure = async (procedureData: Partial<any> = {}) => {
  const procedure = mockProcedure(procedureData);

  return prisma.procedure.create({
    data: procedure,
  });
};

export const createTestRotation = async (rotationData: Partial<any> = {}) => {
  const rotation = mockRotation(rotationData);

  return prisma.rotation.create({
    data: rotation,
  });
};

// Cleanup helpers
export const cleanupTestData = async () => {
  await prisma.logEntry.deleteMany({
    where: { internId: { contains: 'test' } },
  });

  await prisma.case.deleteMany({
    where: { authorId: { contains: 'test' } },
  });

  await prisma.user.deleteMany({
    where: { email: { contains: 'test' } },
  });

  await prisma.procedure.deleteMany({
    where: { name: { contains: 'Test' } },
  });

  await prisma.rotation.deleteMany({
    where: { name: { contains: 'Test' } },
  });
};

// Assertion helpers
export const expectValidApiResponse = (response: any) => {
  if (typeof (globalThis as any).expect !== 'undefined') {
    (globalThis as any).expect(response).toHaveProperty('statusCode');
    (globalThis as any).expect(response).toHaveProperty('timestamp');
    (globalThis as any).expect(typeof response.statusCode).toBe('number');
    (globalThis as any).expect(typeof response.timestamp).toBe('string');
  }
};

export const expectErrorResponse = (response: any, expectedStatus: number) => {
  if (typeof (globalThis as any).expect !== 'undefined') {
    (globalThis as any).expect(response.status).toBe(expectedStatus);
    (globalThis as any).expect(response.data).toHaveProperty('error');
    (globalThis as any).expect(response.data).toHaveProperty('message');
    (globalThis as any).expect(response.data).toHaveProperty('timestamp');
  }
};

export const expectValidationError = (response: any) => {
  if (typeof (globalThis as any).expect !== 'undefined') {
    (globalThis as any).expect(response.status).toBe(400);
    (globalThis as any)
      .expect(response.data)
      .toHaveProperty('error', 'Validation failed');
    (globalThis as any).expect(response.data).toHaveProperty('details');
    (globalThis as any).expect(Array.isArray(response.data.details)).toBe(true);
  }
};

// Mock helpers
export const mockNextAuth = (user: any = null) => {
  const { getServerSession } = require('next-auth/next');
  getServerSession.mockResolvedValue(user ? { user } : null);
};

export const mockPrisma = () => {
  const mockPrismaClient = {
    user: {
      findUnique: (globalThis as any).vi?.fn() || (() => {}),
      findMany: (globalThis as any).vi?.fn() || (() => {}),
      create: (globalThis as any).vi?.fn() || (() => {}),
      update: (globalThis as any).vi?.fn() || (() => {}),
      delete: (globalThis as any).vi?.fn() || (() => {}),
      count: (globalThis as any).vi?.fn() || (() => {}),
    },
    case: {
      findUnique: (globalThis as any).vi?.fn() || (() => {}),
      findMany: (globalThis as any).vi?.fn() || (() => {}),
      create: (globalThis as any).vi?.fn() || (() => {}),
      update: (globalThis as any).vi?.fn() || (() => {}),
      delete: (globalThis as any).vi?.fn() || (() => {}),
      count: (globalThis as any).vi?.fn() || (() => {}),
    },
    logEntry: {
      findUnique: (globalThis as any).vi?.fn() || (() => {}),
      findMany: (globalThis as any).vi?.fn() || (() => {}),
      create: (globalThis as any).vi?.fn() || (() => {}),
      update: (globalThis as any).vi?.fn() || (() => {}),
      delete: (globalThis as any).vi?.fn() || (() => {}),
      count: (globalThis as any).vi?.fn() || (() => {}),
    },
    procedure: {
      findUnique: (globalThis as any).vi?.fn() || (() => {}),
      findMany: (globalThis as any).vi?.fn() || (() => {}),
      create: (globalThis as any).vi?.fn() || (() => {}),
      update: (globalThis as any).vi?.fn() || (() => {}),
      delete: (globalThis as any).vi?.fn() || (() => {}),
      count: (globalThis as any).vi?.fn() || (() => {}),
    },
    rotation: {
      findUnique: (globalThis as any).vi?.fn() || (() => {}),
      findMany: (globalThis as any).vi?.fn() || (() => {}),
      create: (globalThis as any).vi?.fn() || (() => {}),
      update: (globalThis as any).vi?.fn() || (() => {}),
      delete: (globalThis as any).vi?.fn() || (() => {}),
      count: (globalThis as any).vi?.fn() || (() => {}),
    },
    verification: {
      findUnique: (globalThis as any).vi?.fn() || (() => {}),
      findMany: (globalThis as any).vi?.fn() || (() => {}),
      create: (globalThis as any).vi?.fn() || (() => {}),
      update: (globalThis as any).vi?.fn() || (() => {}),
      delete: (globalThis as any).vi?.fn() || (() => {}),
      count: (globalThis as any).vi?.fn() || (() => {}),
    },
  };

  (prisma as unknown as any).user = mockPrismaClient.user;
  (prisma as unknown as any).case = mockPrismaClient.case;
  (prisma as unknown as any).logEntry = mockPrismaClient.logEntry;
  (prisma as unknown as any).procedure = mockPrismaClient.procedure;
  (prisma as unknown as any).rotation = mockPrismaClient.rotation;
  (prisma as unknown as any).verification = mockPrismaClient.verification;

  return mockPrismaClient;
};

// Test data generators
export const generateTestUsers = (count: number) => {
  return Array.from({ length: count }, (_, i) =>
    mockUser({
      id: `user_${i + 1}`,
      email: `test${i + 1}@example.com`,
      name: `Test User ${i + 1}`,
    })
  );
};

export const generateTestCases = (
  count: number,
  authorId: string = 'user_123'
) => {
  return Array.from({ length: count }, (_, i) =>
    mockCase({
      id: `case_${i + 1}`,
      title: `Test Case ${i + 1}`,
      authorId,
    })
  );
};

export const generateTestLogEntries = (
  count: number,
  internId: string = 'user_123'
) => {
  return Array.from({ length: count }, (_, i) =>
    mockLogEntry({
      id: `log_${i + 1}`,
      internId,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // One day apart
    })
  );
};

// Performance testing helpers
export const measurePerformance = async <T>(
  fn: () => Promise<T>,
  operationName: string
): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  console.log(`${operationName} took ${duration.toFixed(2)}ms`);

  return { result, duration };
};

// Database transaction helpers
export const withTransaction = async <T>(
  fn: (tx: any) => Promise<T>
): Promise<T> => {
  return prisma.$transaction(fn);
};

// Mock external services
export const mockExternalServices = () => {
  // Mock monitoring
  (globalThis as any).vi?.mock('@/lib/utils/monitoring', () => ({
    monitoring: {
      recordMetric: (globalThis as any).vi?.fn() || (() => {}),
      recordError: (globalThis as any).vi?.fn() || (() => {}),
      getAllMetrics: (globalThis as any).vi?.fn(() => ({})) || (() => ({})),
    },
  }));

  // Mock logger
  (globalThis as any).vi?.mock('@/lib/utils/logger', () => ({
    logger: {
      error: (globalThis as any).vi?.fn() || (() => {}),
      warn: (globalThis as any).vi?.fn() || (() => {}),
      info: (globalThis as any).vi?.fn() || (() => {}),
      debug: (globalThis as any).vi?.fn() || (() => {}),
    },
  }));

  // Mock cache
  (globalThis as any).vi?.mock('@/lib/utils/cache', () => ({
    userCache: {
      get: (globalThis as any).vi?.fn() || (() => {}),
      set: (globalThis as any).vi?.fn() || (() => {}),
      delete: (globalThis as any).vi?.fn() || (() => {}),
      clear: (globalThis as any).vi?.fn() || (() => {}),
      getStats: (globalThis as any).vi?.fn(() => ({
        size: 0,
        memoryUsage: 0,
        hitRate: 0,
      })),
    },
    rotationCache: {
      get: (globalThis as any).vi?.fn() || (() => {}),
      set: (globalThis as any).vi?.fn() || (() => {}),
      delete: (globalThis as any).vi?.fn() || (() => {}),
      clear: (globalThis as any).vi?.fn() || (() => {}),
      getStats: (globalThis as any).vi?.fn(() => ({
        size: 0,
        memoryUsage: 0,
        hitRate: 0,
      })),
    },
    procedureCache: {
      get: (globalThis as any).vi?.fn() || (() => {}),
      set: (globalThis as any).vi?.fn() || (() => {}),
      delete: (globalThis as any).vi?.fn() || (() => {}),
      clear: (globalThis as any).vi?.fn() || (() => {}),
      getStats: (globalThis as any).vi?.fn(() => ({
        size: 0,
        memoryUsage: 0,
        hitRate: 0,
      })),
    },
    getCacheMemoryUsage: (globalThis as any).vi?.fn(() => ({
      total: 0,
      breakdown: {},
    })),
  }));
};

// Test environment setup
export const setupTestEnvironment = () => {
  // Set test environment variables
  (process.env as any).NODE_ENV = 'test';
  process.env.NEXTAUTH_SECRET = 'test-secret-key';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  process.env.DATABASE_URL = 'file:./test.db';

  // Mock external services
  mockExternalServices();

  // Clear all mocks
  (globalThis as any).vi?.clearAllMocks();
};

// Cleanup after tests
export const cleanupTestEnvironment = async () => {
  await cleanupTestData();
  (globalThis as any).vi?.clearAllMocks();
  (globalThis as any).vi?.resetAllMocks();
};
