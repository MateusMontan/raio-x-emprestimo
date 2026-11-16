import { describe, expect, it } from 'vitest';
import { InvalidInputError, NonConvergenceError } from '../errors';
import { ImplicitRateSolver } from './ImplicitRateSolver';

const solver = new ImplicitRateSolver();

describe('ImplicitRateSolver (R5)', () => {
  it('Raio-X: liberado R$ 5.000,00, parcela R$ 500,00 e 12 meses dão ≈ 2,92% a.m. (critério 3)', () => {
    const rate = solver.solve(500_000, 50_000, 12);
    expect(rate * 100).toBeCloseTo(2.92, 2);
  });

  it('a taxa encontrada reproduz a parcela pela fórmula da Price', () => {
    const rate = solver.solve(500_000, 50_000, 12);
    const payment = (500_000 * rate) / (1 - (1 + rate) ** -12);
    expect(payment).toBeCloseTo(50_000, 4);
  });

  it('com parcelas iguais ao valor dividido por n, a taxa é zero', () => {
    expect(solver.solve(120_000, 10_000, 12)).toBeCloseTo(0, 10);
  });

  it('com uma única parcela, a taxa é parcela/valor − 1', () => {
    expect(solver.solve(100_000, 105_000, 1)).toBeCloseTo(0.05, 10);
  });

  it('encontra taxa negativa quando a soma das parcelas é menor que o valor liberado', () => {
    expect(solver.solve(100_000, 8_000, 12)).toBeLessThan(0);
  });

  it('funciona para prazos longos (420 parcelas)', () => {
    const rate = solver.solve(10_000_000, 95_000, 420);
    const payment = (10_000_000 * rate) / (1 - (1 + rate) ** -420);
    expect(payment).toBeCloseTo(95_000, 3);
  });

  it('rejeita entradas não positivas ou parcelas inválidas', () => {
    expect(() => solver.solve(0, 1, 12)).toThrow(InvalidInputError);
    expect(() => solver.solve(1, 0, 12)).toThrow(InvalidInputError);
    expect(() => solver.solve(1, 1, 0)).toThrow(InvalidInputError);
  });

  it('encontra taxa muito alta quando a parcela é pequena em relação ao valor', () => {
    expect(solver.solve(1, 100_000, 12)).toBeGreaterThan(100);
  });

  it('rejeita valor liberado impossível de explicar com a parcela informada', () => {
    expect(() => solver.solve(1_000_000_000_000, 1, 2)).toThrow(NonConvergenceError);
  });

  it('rejeita parcela tão pequena que a taxa implícita sairia do limite numérico', () => {
    expect(() => solver.solve(1, 1_000_000_000_000, 12)).toThrow('Parcela incompatível');
  });
});
