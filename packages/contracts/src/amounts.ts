import { z } from 'zod';
import { LIMITS } from './limits';
import { MSG } from './messages';

/** Valor em centavos, dentro dos limites da R7. */
export const amountCentsSchema = z
  .number({ error: MSG.amountRequired })
  .int(MSG.amountInt)
  .min(LIMITS.amountCents.min, MSG.amountRange)
  .max(LIMITS.amountCents.max, MSG.amountRange);

/** Prazo em meses, dentro dos limites da R7. */
export const installmentsSchema = z
  .number({ error: MSG.installmentsRequired })
  .int(MSG.installmentsInt)
  .min(LIMITS.installments.min, MSG.installmentsRange)
  .max(LIMITS.installments.max, MSG.installmentsRange);

/** Taxa mensal decimal (0,02 = 2% a.m.), dentro dos limites da R7. */
export const monthlyRateSchema = z
  .number({ error: MSG.rateRequired })
  .min(LIMITS.monthlyRate.min, MSG.rateRange)
  .max(LIMITS.monthlyRate.max, MSG.rateRange);

/** Parcela paga pelo cliente, em centavos: de 1 centavo até o teto de valor. */
export const paymentCentsSchema = z
  .number({ error: MSG.paymentRequired })
  .int(MSG.paymentInt)
  .min(1, MSG.paymentRange)
  .max(LIMITS.amountCents.max, MSG.paymentRange);
