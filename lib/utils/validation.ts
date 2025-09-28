/**
 * Comprehensive validation utilities
 */

import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address').max(254, 'Email too long');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character',
  );

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s\-']+$/, 'Name contains invalid characters');

export const idNumberSchema = z
  .string()
  .min(6, 'ID number must be at least 6 characters')
  .max(20, 'ID number too long')
  .regex(/^[a-zA-Z0-9]+$/, 'ID number can only contain letters and numbers');

export const dateSchema = z
  .string()
  .datetime()
  .or(z.string().min(1))
  .transform((val) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return date;
  });

export const positiveIntSchema = z.number().int('Must be an integer').min(1, 'Must be at least 1');

export const optionalStringSchema = z.string().max(2000, 'Text too long').optional();

// User validation schemas
export const createUserSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  idNumber: idNumberSchema,
  role: z.enum(['INTERN', 'TUTOR', 'ADMIN']),
});

export const updateUserSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  idNumber: idNumberSchema.optional(),
  role: z.enum(['INTERN', 'TUTOR', 'ADMIN']).optional(),
});

// Log entry validation schemas
export const createLogSchema = z.object({
  procedureId: z.string().min(1, 'Procedure is required'),
  date: dateSchema,
  count: positiveIntSchema,
  notes: optionalStringSchema,
});

export const updateLogSchema = z.object({
  date: dateSchema.optional(),
  count: positiveIntSchema.optional(),
  notes: optionalStringSchema,
});

// Verification validation schemas
export const verifyLogSchema = z.object({
  logEntryId: z.string().min(1, 'Log entry ID is required'),
  status: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().max(500, 'Reason too long').optional(),
});

// Query parameter validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const dateRangeSchema = z
  .object({
    from: dateSchema.optional(),
    to: dateSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return data.from <= data.to;
      }
      return true;
    },
    {
      message: 'From date must be before or equal to to date',
      path: ['from'],
    },
  );

// Utility functions
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation failed: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`,
      );
    }
    throw error;
  }
}

export function safeValidateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return {
        success: false,
        errors: result.error.issues.map((e: z.ZodIssue) => e.message),
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown validation error'],
    };
  }
}

// Enhanced sanitization functions with comprehensive XSS protection
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';

  return (
    input
      .trim()
      // Remove all potentially dangerous characters
      .replace(/[<>\"'&]/g, '')
      // Remove script tags and their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove javascript: protocols
      .replace(/javascript:/gi, '')
      // Remove data: protocols that could contain scripts
      .replace(/data:text\/html/gi, '')
      // Remove on* event handlers
      .replace(/\son\w+\s*=/gi, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .slice(0, maxLength)
  );
}

export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';

  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._-]/g, '') // Keep only valid email characters
    .slice(0, 254); // Email length limit
}

export function sanitizeIdNumber(idNumber: string): string {
  if (typeof idNumber !== 'string') return '';

  return idNumber
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '') // Keep only alphanumeric
    .slice(0, 20); // Reasonable limit
}

export function sanitizeNotes(notes: string): string {
  if (typeof notes !== 'string') return '';

  return sanitizeString(notes, 2000);
}

export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return '';

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
    .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

// Enhanced password validation
export const enhancedPasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character',
  )
  .refine((password) => {
    // Check for common patterns
    const commonPatterns = [
      /(.)\1{2,}/, // Repeated characters
      /123|234|345|456|567|678|789|890/, // Sequential numbers
      /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/, // Sequential letters
      /qwerty|asdfgh|zxcvbn/, // Keyboard patterns
    ];
    return !commonPatterns.some((pattern) => pattern.test(password.toLowerCase()));
  }, 'Password contains common patterns that are easy to guess');

// SQL injection prevention
export function sanitizeSqlInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/['"\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment starts
    .replace(/\*\//g, '') // Remove block comment ends
    .replace(/;/g, '') // Remove semicolons
    .replace(/union/gi, '') // Remove UNION
    .replace(/select/gi, '') // Remove SELECT
    .replace(/insert/gi, '') // Remove INSERT
    .replace(/update/gi, '') // Remove UPDATE
    .replace(/delete/gi, '') // Remove DELETE
    .replace(/drop/gi, '') // Remove DROP
    .replace(/create/gi, '') // Remove CREATE
    .replace(/alter/gi, '') // Remove ALTER
    .replace(/exec/gi, '') // Remove EXEC
    .replace(/execute/gi, '') // Remove EXECUTE
    .trim();
}
