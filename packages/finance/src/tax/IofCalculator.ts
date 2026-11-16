import type { Money } from '../money/Money';
import type { TaxPolicy } from './TaxPolicy';

/** R3 — IOF de crédito PF: diário sobre cada amortização e adicional sobre o principal. */
export class IofCalculator {
  constructor(private readonly policy: TaxPolicy) {}

  get policyId(): string {
    return this.policy.id;
  }

  /** IOF diário de uma parcela: amortização × alíquota diária × dias (limitados a `maxDays`). */
  dailyFor(amortization: Money, daysFromRelease: number): Money {
    const days = Math.min(Math.max(daysFromRelease, 0), this.policy.maxDays);
    return amortization.multiply(this.policy.dailyRate * days);
  }

  /** IOF adicional, uma única vez sobre o principal. */
  additionalFor(principal: Money): Money {
    return principal.multiply(this.policy.additionalRate);
  }
}
