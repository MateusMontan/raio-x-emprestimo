import type { z } from 'zod';
import { MSG } from './messages';
import { isoDateSchema } from './primitives';

/** Primeiro vencimento opcional (R6): quando informado, não pode ser anterior à contratação. */
export const optionalFirstDueDateSchema = isoDateSchema.optional();

/** Regra cruzada: primeiro vencimento >= contratação. Textos ISO comparam certo em ordem lexical. */
export function refineFirstDueDate(
  data: { readonly contractDate: string; readonly firstDueDate?: string | undefined },
  ctx: z.RefinementCtx,
): void {
  if (data.firstDueDate !== undefined && data.firstDueDate < data.contractDate) {
    ctx.addIssue({
      code: 'custom',
      message: MSG.firstDueBeforeContract,
      path: ['firstDueDate'],
    });
  }
}
