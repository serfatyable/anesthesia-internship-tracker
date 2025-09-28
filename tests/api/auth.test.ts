/**
 * Authentication API tests
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as signupHandler } from '@/app/api/auth/signup/route';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';

// Mock NextAuth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'test@' } },
    });
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const mockUser = {
        id: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        idNumber: 'TEST123',
        role: 'INTERN',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          idNumber: 'TEST123',
          password: 'TestPassword123!',
          role: 'INTERN',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await signupHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('User created successfully');
      expect(data.user.email).toBe('test@example.com');
      expect(data.user.password).toBeUndefined();
    });

    it('should reject duplicate email', async () => {
      const existingUser = {
        id: 'existing_user',
        email: 'existing@example.com',
      };

      (prisma.user.findUnique as any).mockResolvedValue(existingUser);

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'User',
          email: 'existing@example.com',
          idNumber: 'TEST123',
          password: 'TestPassword123!',
          role: 'INTERN',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await signupHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User with this email already exists');
    });

    it('should reject invalid email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email',
          idNumber: 'TEST123',
          password: 'TestPassword123!',
          role: 'INTERN',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await signupHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should reject weak password', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          idNumber: 'TEST123',
          password: 'weak',
          role: 'INTERN',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await signupHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should handle database errors gracefully', async () => {
      (prisma.user.findUnique as any).mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          idNumber: 'TEST123',
          password: 'TestPassword123!',
          role: 'INTERN',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await signupHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
