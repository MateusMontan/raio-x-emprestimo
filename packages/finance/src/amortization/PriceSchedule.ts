import type { Money } from '../money/Money';
import type { Rate } from '../rate/Rate';
import { assertInstallments } from './assertInstallments';
import type { AmortizationStrategy, Installment } from './types';

/** R1 — Tabela Price: parcelas fixas, `PMT = PV · i / (1 − (1 + i)^−n)`. */
export class PriceSchedule implements AmortizationStrategy {
  readonly system = 'PRICE' as const;

  plan(principal: Money, rate: Rate, installments: number): Installment[] {
    assertInstallments(installments);
    const payment = fixedPayment(principal, rate, installments);
    const rows: Installment[] = [];
    let balance = principal;
    for (let n = 1; n <= installments; n++) {
      const interest = rate.interestOn(balance);
      const amortization = n === installments ? balance : payment.subtract(interest);
      balance = balance.subtract(amortization);
      rows.push({
        n,
        interest,
        principal: amortization,
        payment: interest.add(amortization),
        balance,
      });
    }
    return rows;
  }
}

function fixedPayment(principal: Money, rate: Rate, installments: number): Money {
  if (rate.isZero()) {
    return principal.divide(installments);
  }
  const i = rate.monthly;
  const factor = i / (1 - (1 + i) ** -installments);
  return principal.multiply(factor);
}
