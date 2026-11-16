import { z } from 'zod';
import { amountCentsSchema, installmentsSchema, paymentCentsSchema } from './amounts';
import { optionalFirstDueDateSchema, refineFirstDueDate } from './loanDates';
import { isoDateSchema } from './primitives';

/** Entrada do Raio-X de oferta (F2). Objeto estrito. */
export const offerInputSchema = z
  .strictObject({
    releasedCents: amountCentsSchema,
    paymentCents: paymentCentsSchema,
    installments: installmentsSchema,
    contractDate: isoDateSchema,
    firstDueDate: optionalFirstDueDateSchema,
  })
  .superRefine((data, ctx) => {
    refineFirstDueDate(data, ctx);
  });

/** Análise da oferta; espelha OfferAnalysis de @raiox/finance. */
export const offerAnalysisSchema = z.object({
  contractDate: isoDateSchema,
  firstDueDate: isoDateSchema,
  releasedCents: z.number().int(),
  paymentCents: z.number().int(),
  installments: z.number().int(),
  impliedMonthlyRate: z.number(),
  impliedAnnualRate: z.number(),
  cetAnnual: z.number(),
  cetMonthly: z.number(),
  totalPaidCents: z.number(),
  costCents: z.number(),
});
