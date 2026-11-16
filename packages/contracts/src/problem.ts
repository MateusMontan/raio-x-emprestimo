import { z } from 'zod';

/** Erro de validação de um campo (RFC 9457 `errors[]`). */
export const fieldErrorSchema = z.object({
  path: z.string(),
  message: z.string(),
});

/** Problem Details (RFC 9457) usado pela API. */
export const problemSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string(),
  code: z.string().optional(),
  errors: z.array(fieldErrorSchema).optional(),
});
