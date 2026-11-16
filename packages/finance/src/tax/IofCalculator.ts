import type { Money } from '../money/Money';
import type { TaxPolicy } from './TaxPolicy';

/**
 * R3 — IOF de crédito PF: diário sobre cada amortização e adicional sobre o principal.
 * Os métodos `*Exact` devolvem centavos sem arredondar, para que a soma de várias
 * parcelas seja arredondada uma única vez (ver `planSchedule`).
 */
export class IofCalculator {
  constructor(private readonly policy: TaxPolicy) {}

  get policyId(): string {
    return this.policy.id;
  }

  /** IOF diário exato (centavos fracionados) de uma amortização, limitado a `maxDays`. */
  dailyExact(amortization: Money, daysFromRelease: number): number {
    const days = Math.min(Math.max(daysFromRelease, 0), this.policy.maxDays);
    return amortization.cents * this.policy.dailyRate * days;
  }

  /** IOF adicional exato (centavos fracionados), uma única vez sobre o principal. */
  additionalExact(principal: Money): number {
    return principal.cents * this.policy.additionalRate;
  }
}
