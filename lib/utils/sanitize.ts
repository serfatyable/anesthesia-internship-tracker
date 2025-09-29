// Input sanitization utilities
// This file is deprecated. Use lib/utils/validation.ts instead.
// Keeping for backward compatibility during migration.

import {
  sanitizeString as newSanitizeString,
  sanitizeEmail as newSanitizeEmail,
  sanitizeIdNumber as newSanitizeIdNumber,
  sanitizeNotes as newSanitizeNotes,
  passwordSchema,
} from './validation';

export function sanitizeString(input: string): string {
  return newSanitizeString(input);
}

export function sanitizeEmail(email: string): string {
  return newSanitizeEmail(email);
}

export function sanitizeNotes(notes: string): string {
  return newSanitizeNotes(notes);
}

export function sanitizeIdNumber(idNumber: string): string {
  return newSanitizeIdNumber(idNumber);
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  try {
    passwordSchema.parse(password);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof Error) {
      return { valid: false, errors: [error.message] };
    }
    return { valid: false, errors: ['Invalid password format'] };
  }
}
