import { z } from 'zod';
import { MSG } from './messages';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SIMULATION_ID_PATTERN = /^[0-9A-Za-z]{10}$/;
const MIN_DATE = '2000-01-01';
const MAX_DATE = '2100-12-31';

/** true se a string YYYY-MM-DD existe no calendário (inclui anos bissextos). */
function isRealCalendarDate(value: string): boolean {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** Data ISO sem hora, entre 2000-01-01 e 2100-12-31, que existe no calendário. */
export const isoDateSchema = z.string({ error: MSG.dateRequired }).superRefine((value, ctx) => {
  if (!ISO_DATE_PATTERN.test(value)) {
    ctx.addIssue({ code: 'custom', message: MSG.dateFormat });
    return;
  }
  if (value < MIN_DATE || value > MAX_DATE) {
    ctx.addIssue({ code: 'custom', message: MSG.dateRange });
    return;
  }
  if (!isRealCalendarDate(value)) {
    ctx.addIssue({ code: 'custom', message: MSG.dateInvalid });
  }
});

/** Identificador curto de simulação compartilhada (10 caracteres alfanuméricos). */
export const simulationIdSchema = z
  .string({ error: MSG.simulationIdRequired })
  .regex(SIMULATION_ID_PATTERN, MSG.simulationIdFormat);

export const amortizationSystemSchema = z.enum(['PRICE', 'SAC'], { error: MSG.system });

export const iofModeSchema = z.enum(['FINANCED', 'CASH', 'NONE'], { error: MSG.iofMode });
