import { describe, expect, it } from 'vitest';
import { LIMITS, MAX_COMPARE_SCENARIOS, SHARE_TTL_DAYS } from './limits';

describe('LIMITS (R7)', () => {
  it('usa valor de R$ 100,00 a R$ 10.000.000,00 em centavos', () => {
    expect(LIMITS.amountCents).toEqual({ min: 10_000, max: 1_000_000_000 });
  });

  it('usa prazo de 1 a 420 meses', () => {
    expect(LIMITS.installments).toEqual({ min: 1, max: 420 });
  });

  it('usa taxa mensal de 0% a 30%', () => {
    expect(LIMITS.monthlyRate).toEqual({ min: 0, max: 0.3 });
  });

  it('limita tarifas e seguro a 50% do valor', () => {
    expect(LIMITS.feesMaxRatio).toBe(0.5);
  });

  it('define validade de 180 dias e até 3 cenários de comparação', () => {
    expect(SHARE_TTL_DAYS).toBe(180);
    expect(MAX_COMPARE_SCENARIOS).toBe(3);
  });
});
