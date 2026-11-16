import { CetCalculator } from '../cet/CetCalculator';
import { strategyFor } from '../amortization/strategyFor';
import { InvalidInputError } from '../errors';
import type { Money } from '../money/Money';
import { IofCalculator } from '../tax/IofCalculator';
import { taxPolicyFor } from '../tax/taxPolicyFor';
import { solveFinancedPlan } from './financing';
import { requireAt } from '../internal/requireAt';
import { dueDatesFrom } from './resolveDates';
import { planSchedule, type ScheduleContext, type SchedulePlan } from './planSchedule';
import { normalizeLoanInput, type NormalizedLoan } from './validateLoanInput';
import type { LoanTotals, SimulationResult, LoanInput } from './types';

/** Identificador de política quando o IOF não é calculado. */
const NO_TAX_POLICY_ID = 'none';

/**
 * Facade F1: simula um empréstimo com cronograma, IOF, custo e CET.
 * Função pura: mesma entrada, mesma saída, sem I/O.
 */
export function simulateLoan(input: LoanInput): SimulationResult {
  const loan = normalizeLoanInput(input);
  const context = buildContext(loan);
  const plan =
    loan.iofMode === 'FINANCED'
      ? solveFinancedPlan(context, loan.amount)
      : planSchedule(context, loan.amount);

  const iofTotal = plan.dailyIof.add(plan.additionalIof);
  const released =
    loan.iofMode === 'CASH'
      ? loan.amount.subtract(iofTotal).subtract(loan.fees)
      : loan.amount.subtract(loan.fees);
  if (!released.isPositive()) {
    throw new InvalidInputError('Valor liberado ficaria zero ou negativo após IOF e tarifas');
  }

  const cet = new CetCalculator().calculate(
    released.cents,
    plan.rows.map((row, index) => ({
      amountCents: row.payment,
      days: requireAt(context.dayCounts, index),
    })),
  );

  return {
    contractDate: loan.contract.value,
    firstDueDate: loan.firstDue.value,
    system: loan.system,
    amountCents: loan.amount.cents,
    releasedCents: released.cents,
    financedPrincipalCents: plan.principal.cents,
    feesCents: loan.fees.cents,
    iof: {
      mode: loan.iofMode,
      taxPolicyId: context.iof?.policyId ?? NO_TAX_POLICY_ID,
      dailyCents: plan.dailyIof.cents,
      additionalCents: plan.additionalIof.cents,
      totalCents: iofTotal.cents,
    },
    schedule: plan.rows,
    totals: totalsFor(plan, released, loan.fees),
    cetAnnual: cet.annual,
    cetMonthly: cet.monthly,
  };
}

function buildContext(loan: NormalizedLoan): ScheduleContext {
  const dueDates = dueDatesFrom(loan.firstDue, loan.installments);
  return {
    strategy: strategyFor(loan.system),
    rate: loan.rate,
    installments: loan.installments,
    dueDates,
    dayCounts: dueDates.map((due) => loan.contract.daysUntil(due)),
    iof: loan.iofMode === 'NONE' ? null : new IofCalculator(taxPolicyFor(loan.contract)),
  };
}

function totalsFor(plan: SchedulePlan, released: Money, fees: Money): LoanTotals {
  let paid = 0;
  let interest = 0;
  let principal = 0;
  for (const row of plan.rows) {
    paid += row.payment;
    interest += row.interest;
    principal += row.principal;
  }
  return {
    paidCents: paid,
    interestCents: interest,
    principalCents: principal,
    chargesCents: 0,
    iofCents: plan.dailyIof.add(plan.additionalIof).cents,
    feesCents: fees.cents,
    costCents: paid - released.cents,
  };
}
