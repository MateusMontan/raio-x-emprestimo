import { z } from 'zod';

/** Resposta de GET /api/health. */
export const healthSchema = z.object({
  status: z.literal('ok'),
});
