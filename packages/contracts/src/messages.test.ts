import { describe, expect, it } from 'vitest';
import { formatBrl, MSG } from './messages';

describe('formatBrl', () => {
  it('formata centavos como moeda brasileira', () => {
    expect(formatBrl(10_000)).toBe('R$ 100,00');
    expect(formatBrl(1)).toBe('R$ 0,01');
    expect(formatBrl(1_000_000_000)).toBe('R$ 10.000.000,00');
    expect(formatBrl(123_456)).toBe('R$ 1.234,56');
  });
});

describe('MSG', () => {
  it('monta as faixas de valor, prazo e taxa a partir da R7', () => {
    expect(MSG.amountRange).toBe('O valor vai de R$ 100,00 a R$ 10.000.000,00.');
    expect(MSG.installmentsRange).toBe('O prazo vai de 1 a 420 meses.');
    expect(MSG.rateRange).toBe('A taxa mensal vai de 0% a 30%.');
    expect(MSG.feesRatio).toBe('Tarifas e seguro não podem passar de 50% do valor.');
  });
});
