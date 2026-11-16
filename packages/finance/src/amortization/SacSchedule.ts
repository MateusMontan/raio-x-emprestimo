import type { Money } from '../money/Money';
import type { Rate } from '../rate/Rate';
import { assertFeasibleSchedule } from './assertFeasibleSchedule';
import { assertInstallments } from './assertInstallments';
import type { AmortizationStrategy, Installment } from './types';

/** R2 — SAC: amortização constante `A = PV / n`, juros sobre o saldo de cada período. */
export class SacSchedule implements AmortizationStrategy {
  readonly system = 'SAC' as const;

  plan(principal: Money, rate: Rate, installments: number): Installment[] {
    assertInstallments(installments);
    const fixedAmortization = principal.divide(installments);
    const rows: Installment[] = [];
    let balance = principal;
    for (let n = 1; n <= installments; n++) {
      const interest = rate.interestOn(balance);
      const amortization = n === installments ? balance : fixedAmortization;
      balance = balance.subtract(amortization);
      rows.push({
        n,
        interest,
        principal: amortization,
        payment: interest.add(amortization),
        balance,
      });
    }
    assertFeasibleSchedule(rows);
    return rows;
  }
}
