import { z } from 'zod';

// Progress API query parameters
export const ProgressQuerySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  tab: z.enum(['overview', 'intern']).optional().default('intern'),
});

export type ProgressQuery = z.infer<typeof ProgressQuerySchema>;

// Export API query parameters
export const ExportQuerySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type ExportQuery = z.infer<typeof ExportQuerySchema>;

// Dashboard tab validation
export const DashboardTabSchema = z.enum(['overview', 'intern']);

export type DashboardTab = z.infer<typeof DashboardTabSchema>;

// Date range validation for exports
export const DateRangeSchema = z
  .object({
    from: z.date().optional(),
    to: z.date().optional(),
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

export type DateRange = z.infer<typeof DateRangeSchema>;

// User role validation for progress access
export const ProgressAccessSchema = z
  .object({
    userId: z.string(),
    requesterRole: z.enum(['INTERN', 'TUTOR', 'ADMIN']),
    requesterId: z.string(),
  })
  .refine(
    (data) => {
      // INTERN can only access their own data
      if (data.requesterRole === 'INTERN') {
        return data.userId === data.requesterId;
      }
      // TUTOR and ADMIN can access any user's data
      return true;
    },
    {
      message: 'Access denied: insufficient permissions',
      path: ['userId'],
    },
  );

export type ProgressAccess = z.infer<typeof ProgressAccessSchema>;
