import { NonConvergenceError } from '../errors';
import type { Money } from '../money/Money';
import { planSchedule, type ScheduleContext, type SchedulePlan } from './planSchedule';

const MAX_FINANCING_ITERATIONS = 100;

/**
 * IOF financiado (R3): o principal é `valor + IOF`, e o IOF depende do principal.
 * Ponto fixo em centavos inteiros: itera até `valor + IOF(principal) === principal`.
 * Se a iteração cair em um ciclo de dois valores (efeito do arredondamento das parcelas),
 * escolhe o maior deles, recalcula o plano com ele e devolve. Nesse caso a diferença
 * entre principal e `valor + IOF` é de exatamente 1 centavo.
 */
export function solveFinancedPlan(context: ScheduleContext, amount: Money): SchedulePlan {
  let principal = amount;
  let previous: Money | undefined;
  for (let iteration = 0; iteration < MAX_FINANCING_ITERATIONS; iteration++) {
    const plan = planSchedule(context, principal);
    const next = amount.add(plan.dailyIof).add(plan.additionalIof);
    if (!Number.isSafeInteger(next.cents)) {
      throw new NonConvergenceError('IOF financiado não convergiu');
    }
    if (next.cents === principal.cents) {
      return plan;
    }
    if (previous && next.cents === previous.cents) {
      const larger = next.cents > principal.cents ? next : principal;
      return planSchedule(context, larger);
    }
    previous = principal;
    principal = next;
  }
  throw new NonConvergenceError('IOF financiado não convergiu');
}
