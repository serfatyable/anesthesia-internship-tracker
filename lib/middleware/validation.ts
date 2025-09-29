/**
 * Comprehensive input validation middleware
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/utils/logger';

interface ValidationOptions {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
  headers?: z.ZodSchema;
}

interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
}

// Common validation schemas
export const commonSchemas = {
  pagination: z.object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),

  dateRange: z
    .object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    })
    .refine(
      (data) => {
        if (data.from && data.to) {
          return new Date(data.from) <= new Date(data.to);
        }
        return true;
      },
      { message: 'From date must be before or equal to to date' },
    ),

  search: z.object({
    search: z.string().min(1).max(200).optional(),
    category: z.string().min(1).max(100).optional(),
  }),

  userId: z.object({
    userId: z.string().cuid(),
  }),

  id: z.object({
    id: z.string().cuid(),
  }),
};

// Validate request body
export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Validate query parameters
export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams,
): ValidationResult<T> {
  try {
    const queryObject = Object.fromEntries(searchParams.entries());
    const result = schema.parse(queryObject);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Validate route parameters
export function validateParams<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, string | string[]>,
): ValidationResult<T> {
  try {
    const result = schema.parse(params);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Validate headers
export function validateHeaders<T>(schema: z.ZodSchema<T>, headers: Headers): ValidationResult<T> {
  try {
    const headerObject = Object.fromEntries(headers.entries());
    const result = schema.parse(headerObject);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Create validation error response
function createValidationErrorResponse(errors: z.ZodError, context: string): NextResponse {
  const formattedErrors = errors.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));

  logger.warn('Validation failed', {
    operation: 'validation',
    context,
    errors: JSON.stringify(formattedErrors),
  });

  return NextResponse.json(
    {
      error: 'Validation failed',
      message: 'Invalid input data',
      details: formattedErrors,
      timestamp: new Date().toISOString(),
    },
    { status: 400 },
  );
}

// Main validation middleware
export function withValidation<T extends Record<string, unknown>>(
  options: ValidationOptions,
  handler: (validatedData: T, request: NextRequest) => Promise<NextResponse>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validatedData = {} as T;
    const context = `${request.method} ${request.nextUrl.pathname}`;

    try {
      // Validate body
      if (options.body) {
        const body = await request.json().catch(() => ({}));
        const bodyResult = validateBody(options.body, body);

        if (!bodyResult.success) {
          return createValidationErrorResponse(bodyResult.errors!, `${context} body`);
        }

        Object.assign(validatedData, bodyResult.data);
      }

      // Validate query parameters
      if (options.query) {
        const queryResult = validateQuery(options.query, request.nextUrl.searchParams);

        if (!queryResult.success) {
          return createValidationErrorResponse(queryResult.errors!, `${context} query`);
        }

        Object.assign(validatedData, queryResult.data);
      }

      // Validate route parameters
      if (options.params) {
        const params = Object.fromEntries(
          request.nextUrl.pathname
            .split('/')
            .filter(Boolean)
            .map((segment, index) => [`param${index}`, segment]),
        );

        const paramsResult = validateParams(options.params, params);

        if (!paramsResult.success) {
          return createValidationErrorResponse(paramsResult.errors!, `${context} params`);
        }

        Object.assign(validatedData, paramsResult.data);
      }

      // Validate headers
      if (options.headers) {
        const headersResult = validateHeaders(options.headers, request.headers);

        if (!headersResult.success) {
          return createValidationErrorResponse(headersResult.errors!, `${context} headers`);
        }

        Object.assign(validatedData, headersResult.data);
      }

      // Call the handler with validated data
      return await handler(validatedData, request);
    } catch (error) {
      logger.error('Validation middleware error', {
        operation: 'validation_middleware',
        context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return NextResponse.json(
        {
          error: 'Internal server error',
          message: 'Validation processing failed',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  };
}

// Specific validation helpers
export const validatePagination = (searchParams: URLSearchParams) =>
  validateQuery(commonSchemas.pagination, searchParams);

export const validateDateRange = (searchParams: URLSearchParams) =>
  validateQuery(commonSchemas.dateRange, searchParams);

export const validateSearch = (searchParams: URLSearchParams) =>
  validateQuery(commonSchemas.search, searchParams);

export const validateUserId = (params: Record<string, string | string[]>) =>
  validateParams(commonSchemas.userId, params);

export const validateId = (params: Record<string, string | string[]>) =>
  validateParams(commonSchemas.id, params);

// Sanitization helpers
export function sanitizeInput<T extends Record<string, unknown>>(
  data: T,
  rules: Partial<Record<keyof T, (value: unknown) => unknown>>,
): T {
  const sanitized = { ...data };

  Object.entries(rules).forEach(([key, sanitizer]) => {
    if (key in sanitized && sanitized[key] !== undefined) {
      sanitized[key] = sanitizer(sanitized[key]);
    }
  });

  return sanitized;
}

// Common sanitization rules
export const sanitizationRules = {
  string: (value: unknown) => {
    if (typeof value === 'string') {
      return value.trim().slice(0, 1000);
    }
    return value;
  },

  email: (value: unknown) => {
    if (typeof value === 'string') {
      return value.toLowerCase().trim().slice(0, 254);
    }
    return value;
  },

  number: (value: unknown) => {
    if (typeof value === 'string') {
      const parsed = Number(value);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  },

  boolean: (value: unknown) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  },

  date: (value: unknown) => {
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date;
    }
    return value;
  },
};
