import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { authRateLimit } from '@/lib/middleware/rateLimit';
import { createUserSchema, validateInput } from '@/lib/utils/validation';
import { AppError, createApiError } from '@/lib/utils/error-handler';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = authRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();

    // Validate input using the new validation system
    const validatedData = validateInput(createUserSchema, body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Check if ID number already exists
    const existingId = await prisma.user.findUnique({
      where: { idNumber: validatedData.idNumber },
    });

    if (existingId) {
      throw new AppError('User with this ID number already exists', 400);
    }

    // Hash password with higher salt rounds for better security
    const hashedPassword = await hash(validatedData.password, 14);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        email: validatedData.email,
        idNumber: validatedData.idNumber,
        password: hashedPassword,
        role: validatedData.role,
      },
    });

    // Return success (don't return password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: userWithoutPassword,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Signup error:', error);

    if (error instanceof AppError) {
      return NextResponse.json(createApiError(error.message, error.statusCode, error.details), {
        status: error.statusCode,
      });
    }

    if (error instanceof Error) {
      return NextResponse.json(createApiError('Internal server error', 500), { status: 500 });
    }

    return NextResponse.json(createApiError('Internal server error', 500), { status: 500 });
  }
}
