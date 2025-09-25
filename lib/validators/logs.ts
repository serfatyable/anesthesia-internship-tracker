import { z } from 'zod';

export const CreateLogSchema = z.object({
  procedureId: z.string().min(1, 'Procedure is required'),
  date: z.string().datetime().or(z.string().min(1)), // accept ISO or fallback string; server will normalize
  count: z.coerce.number().int().min(1, 'Count must be ≥ 1'),
  notes: z.string().max(1000).optional(),
});

export type CreateLogInput = z.infer<typeof CreateLogSchema>;

export const VerifyLogSchema = z.object({
  logEntryId: z.string().min(1),
  status: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().max(500).optional(), // required by UI for REJECTED
});

export type VerifyLogInput = z.infer<typeof VerifyLogSchema>;
