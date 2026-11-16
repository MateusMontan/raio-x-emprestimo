import { z } from 'zod';
import { amountCentsSchema, installmentsSchema, monthlyRateSchema } from './amounts';
import { LIMITS } from './limits';
import { MSG } from './messages';
import { optionalFirstDueDateSchema, refineFirstDueDate } from './loanDates';
import { amortizationSystemSchema, iofModeSchema, isoDateSchema } from './primitives';

const feesCentsSchema = z
  .number({ error: MSG.feesRequired })
  .int(MSG.feesInt)
  .min(0, MSG.feesNegative);

/** Entrada da simulação (F1). Objeto estrito: chaves desconhecidas são rejeitadas. */
export const simulationInputSchema = z
  .strictObject({
    amountCents: amountCentsSchema,
    monthlyRate: monthlyRateSchema,
    installments: installmentsSchema,
    system: amortizationSystemSchema,
    contractDate: isoDateSchema,
    firstDueDate: optionalFirstDueDateSchema,
    feesCents: feesCentsSchema.default(0),
    iofMode: iofModeSchema.default('FINANCED'),
  })
  .superRefine((data, ctx) => {
    if (data.feesCents > data.amountCents * LIMITS.feesMaxRatio) {
      ctx.addIssue({ code: 'custom', message: MSG.feesRatio, path: ['feesCents'] });
    }
    refineFirstDueDate(data, ctx);
  });

const scheduleRowSchema = z.object({
  n: z.number().int(),
  dueDate: isoDateSchema,
  payment: z.number(),
  interest: z.number(),
  principal: z.number(),
  charges: z.number(),
  balance: z.number(),
});

const iofSummarySchema = z.object({
  mode: iofModeSchema,
  taxPolicyId: z.string(),
  dailyCents: z.number(),
  additionalCents: z.number(),
  totalCents: z.number(),
});

const loanTotalsSchema = z.object({
  paidCents: z.number(),
  interestCents: z.number(),
  principalCents: z.number(),
  chargesCents: z.number(),
  iofCents: z.number(),
  feesCents: z.number(),
  costCents: z.number(),
});

/** Resultado da simulação; espelha SimulationResult de @raiox/finance. */
export const simulationResultSchema = z.object({
  contractDate: isoDateSchema,
  firstDueDate: isoDateSchema,
  system: amortizationSystemSchema,
  amountCents: z.number().int(),
  releasedCents: z.number(),
  financedPrincipalCents: z.number(),
  feesCents: z.number(),
  iof: iofSummarySchema,
  schedule: z.array(scheduleRowSchema),
  totals: loanTotalsSchema,
  cetAnnual: z.number(),
  cetMonthly: z.number(),
});
