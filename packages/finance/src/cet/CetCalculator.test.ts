import { describe, expect, it } from 'vitest';
import { InvalidInputError } from '../errors';
import { CetCalculator } from './CetCalculator';

const calculator = new CetCalculator();

describe('CetCalculator (R4)', () => {
  it('sem custos e com parcelas a cada 30 dias, o CET anual recupera a taxa composta equivalente', () => {
    const monthlyRate = 0.01;
    const flows = Array.from({ length: 12 }, (_, index) => ({
      amountCents: pmtCents(10_000_00, monthlyRate, 12),
      days: 30 * (index + 1),
    }));
    const result = calculator.calculate(10_000_00, flows);
    // (1 + CET)^(30/365) = 1 + i  =>  CET = (1 + i)^(365/30) − 1
    expect(result.annual).toBeCloseTo((1 + monthlyRate) ** (365 / 30) - 1, 4);
    expect(result.method).toBe('newton');
  });

  it('CET mensal é (1 + anual)^(1/12) − 1', () => {
    const result = calculator.calculate(100_000, [{ amountCents: 120_000, days: 365 }]);
    expect(result.annual).toBeCloseTo(0.2, 10);
    expect(result.monthly).toBeCloseTo(1.2 ** (1 / 12) - 1, 10);
  });

  it('CET de um fluxo único em um ano é a própria razão', () => {
    const result = calculator.calculate(100_000, [{ amountCents: 150_000, days: 365 }]);
    expect(result.annual).toBeCloseTo(0.5, 10);
  });

  it('cobra CET maior quando há encargos pagos à vista (FC0 menor)', () => {
    const flows = [{ amountCents: 110_000, days: 30 }];
    const withoutFees = calculator.calculate(100_000, flows);
    const withFees = calculator.calculate(95_000, flows);
    expect(withFees.annual).toBeGreaterThan(withoutFees.annual);
  });

  it('converge para CET alto em prazo curto, dentro do limite numérico', () => {
    const result = calculator.calculate(100_000, [{ amountCents: 110_000, days: 1 }]);
    expect(Number.isFinite(result.annual)).toBe(true);
    expect(result.annual).toBeGreaterThan(1_000);
  });

  it('rejeita fluxos cujo CET excede o limite numérico (ex.: 10x em 1 dia)', () => {
    expect(() => calculator.calculate(100_000, [{ amountCents: 1_000_000, days: 1 }])).toThrow(
      InvalidInputError,
    );
  });

  it('aceita CET negativo quando o cliente recebe mais do que paga', () => {
    const result = calculator.calculate(100_000, [{ amountCents: 90_000, days: 365 }]);
    expect(result.annual).toBeCloseTo(-0.1, 10);
  });

  it('rejeita valor liberado não positivo ou ausência de fluxos', () => {
    expect(() => calculator.calculate(0, [{ amountCents: 1, days: 1 }])).toThrow(InvalidInputError);
    expect(() => calculator.calculate(100, [])).toThrow(InvalidInputError);
  });
});

function pmtCents(principal: number, rate: number, n: number): number {
  return Math.round((principal * rate) / (1 - (1 + rate) ** -n));
}
