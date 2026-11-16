import { NonConvergenceError } from '../errors';
import type { Money } from '../money/Money';
import { planSchedule, type ScheduleContext, type SchedulePlan } from './planSchedule';

const MAX_FINANCING_ITERATIONS = 100;
/** Diferença aceita entre iterações, em centavos (menor que R$ 0,01 em valor real). */
const CONVERGENCE_CENTS = 1;

/**
 * IOF financiado (R3): o principal é `valor + IOF`, e o IOF depende do principal.
 * Ponto fixo até a variação ficar abaixo de um centavo.
 */
export function solveFinancedPlan(context: ScheduleContext, amount: Money): SchedulePlan {
  let principal = amount;
  for (let iteration = 0; iteration < MAX_FINANCING_ITERATIONS; iteration++) {
    const plan = planSchedule(context, principal);
    const next = amount.add(plan.dailyIof).add(plan.additionalIof);
    if (Math.abs(next.cents - principal.cents) <= CONVERGENCE_CENTS) {
      return plan;
    }
    principal = next;
  }
  throw new NonConvergenceError('IOF financiado não convergiu');
}
