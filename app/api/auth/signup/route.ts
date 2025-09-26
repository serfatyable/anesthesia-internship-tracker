import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  idNumber: z.string().min(6, 'ID number must be at least 6 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['INTERN', 'TUTOR'], {
    message: 'Please select a role',
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 400 });
    }

    // Check if ID number already exists
    const existingId = await prisma.user.findUnique({
      where: { idNumber: validatedData.idNumber },
    });

    if (existingId) {
      return NextResponse.json(
        { message: 'User with this ID number already exists' },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12);

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

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'Validation error',
          errors: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
