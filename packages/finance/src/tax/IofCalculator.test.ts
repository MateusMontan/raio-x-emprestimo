import { describe, expect, it } from 'vitest';
import { Money } from '../money/Money';
import { IofCalculator } from './IofCalculator';
import type { TaxPolicy } from './TaxPolicy';

const policy: TaxPolicy = {
  id: 'teste-v1',
  validFrom: '2020-01-01',
  dailyRate: 0.000082,
  additionalRate: 0.0038,
  maxDays: 365,
  legalReference: { title: 'Teste', url: 'https://example.invalid/norma' },
};

describe('IofCalculator (R3)', () => {
  const calculator = new IofCalculator(policy);

  it('expõe o id da política usada', () => {
    expect(calculator.policyId).toBe('teste-v1');
  });

  it('IOF adicional é 0,38% do principal, arredondado ao centavo', () => {
    expect(calculator.additionalFor(Money.fromCents(1_000_000)).cents).toBe(3_800);
  });

  it('IOF diário é amortização × 0,0082% × dias', () => {
    // R$ 1.000,00 × 0,000082 × 30 dias = R$ 2,46
    expect(calculator.dailyFor(Money.fromCents(100_000), 30).cents).toBe(246);
  });

  it('limita a contagem de dias a 365', () => {
    const capped = calculator.dailyFor(Money.fromCents(100_000_000), 400);
    const atLimit = calculator.dailyFor(Money.fromCents(100_000_000), 365);
    expect(capped.equals(atLimit)).toBe(true);
    expect(capped.cents).toBe(2_993_000);
  });

  it('dias negativos ou zero geram IOF diário zero', () => {
    expect(calculator.dailyFor(Money.fromCents(100_000), 0).isZero()).toBe(true);
    expect(calculator.dailyFor(Money.fromCents(100_000), -5).isZero()).toBe(true);
  });

  it('usa a alíquota de qualquer política informada (troca de versão sem mudar o algoritmo)', () => {
    const future = new IofCalculator({ ...policy, dailyRate: 0.0001, additionalRate: 0.001 });
    expect(future.additionalFor(Money.fromCents(100_000)).cents).toBe(100);
    expect(future.dailyFor(Money.fromCents(100_000), 10).cents).toBe(100);
  });
});
