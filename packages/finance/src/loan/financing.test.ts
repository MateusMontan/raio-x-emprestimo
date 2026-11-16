import { describe, expect, it } from 'vitest';
import { PriceSchedule } from '../amortization/PriceSchedule';
import { NonConvergenceError } from '../errors';
import { IsoDate } from '../date/IsoDate';
import { Money } from '../money/Money';
import { Rate } from '../rate/Rate';
import { IofCalculator } from '../tax/IofCalculator';
import type { TaxPolicy } from '../tax/TaxPolicy';
import { dueDatesFrom } from './resolveDates';
import type { ScheduleContext } from './planSchedule';
import { solveFinancedPlan } from './financing';

const contract = IsoDate.parse('2026-11-15');
const dueDates = dueDatesFrom(contract.addDays(30), 12);

function contextWith(policy: TaxPolicy): ScheduleContext {
  return {
    strategy: new PriceSchedule(),
    rate: Rate.monthly(0.02),
    installments: 12,
    dueDates,
    dayCounts: dueDates.map((due) => contract.daysUntil(due)),
    iof: new IofCalculator(policy),
    applyIof: true,
  };
}

const policy: TaxPolicy = {
  id: 'teste',
  validFrom: '2020-01-01',
  dailyRate: 0.000082,
  additionalRate: 0.0038,
  maxDays: 365,
  legalReference: { title: 'Teste', url: 'https://example.invalid' },
};

describe('solveFinancedPlan (R3, IOF financiado)', () => {
  it('converge com alíquotas reais e o principal cobre valor + IOF ao centavo', () => {
    const amount = Money.fromCents(1_000_000);
    const plan = solveFinancedPlan(contextWith(policy), amount);
    const iof = plan.dailyIof.add(plan.additionalIof);
    expect(Math.abs(plan.principal.subtract(amount).subtract(iof).cents)).toBeLessThanOrEqual(1);
  });

  it('lança NonConvergenceError quando o IOF não estabiliza (alíquota absurda)', () => {
    const explosive: TaxPolicy = { ...policy, additionalRate: 1.5 };
    expect(() => solveFinancedPlan(contextWith(explosive), Money.fromCents(1_000_000))).toThrow(
      NonConvergenceError,
    );
  });
});
