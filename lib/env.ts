/**
 * Environment variable validation and configuration
 */
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('Invalid DATABASE_URL'),
  DIRECT_URL: z.string().url('Invalid DIRECT_URL').optional(),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('Invalid NEXTAUTH_URL'),

  // Optional
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SKIP_ENV_VALIDATION: z.string().optional(),

  // Google Drive (optional)
  NEXT_PUBLIC_GOOGLE_DRIVE_URL: z.string().url().optional(),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    const castErr = error as unknown as {
      issues?: Array<{ path: Array<string | number>; message: string }>;
    };
    const maybeIssues = castErr?.issues;
    if (Array.isArray(maybeIssues)) {
      const missingVars = maybeIssues.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `Environment validation failed:\n${missingVars.join('\n')}\n\n` +
          'Please check your .env file and ensure all required variables are set.',
      );
    }
    throw error;
  }
}

// Only validate if not explicitly skipped; skip during production build phase
const skipValidation =
  process.env.SKIP_ENV_VALIDATION === 'true' || process.env.NEXT_PHASE === 'phase-production-build';

const env = skipValidation ? (process.env as z.infer<typeof envSchema>) : validateEnv();

export { env };
export type Env = z.infer<typeof envSchema>;
