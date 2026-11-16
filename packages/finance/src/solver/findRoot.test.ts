import { describe, expect, it } from 'vitest';
import { NonConvergenceError } from '../errors';
import { findRoot } from './findRoot';

describe('findRoot', () => {
  it('encontra raiz de x² − 2 por Newton-Raphson', () => {
    const result = findRoot((x) => x * x - 2, { lower: 0, upper: 10, initial: 1 });
    expect(result.value).toBeCloseTo(Math.SQRT2, 10);
    expect(result.method).toBe('newton');
  });

  it('usa derivada analítica quando informada', () => {
    const result = findRoot((x) => x * x - 2, {
      lower: 0,
      upper: 10,
      initial: 1,
      derivative: (x) => 2 * x,
    });
    expect(result.value).toBeCloseTo(Math.SQRT2, 10);
    expect(result.iterations).toBeLessThan(10);
  });

  it('cai para bisseção quando Newton sai do intervalo', () => {
    // Derivada quase nula em x = 0 empurra o Newton para fora de (0, 1).
    const result = findRoot((x) => Math.cbrt(x - 0.5), {
      lower: 0,
      upper: 1,
      initial: 0.0001,
    });
    expect(result.value).toBeCloseTo(0.5, 8);
    expect(result.method).toBe('bisection');
  });

  it('bisseção retorna a raiz exata quando o ponto médio já é raiz', () => {
    const result = findRoot((x) => x - 0.5, {
      lower: 0,
      upper: 1,
      initial: 2,
      derivative: () => 0,
    });
    expect(result.value).toBe(0.5);
    expect(result.method).toBe('bisection');
  });

  it('lança NonConvergenceError sem mudança de sinal no intervalo', () => {
    expect(() => findRoot((x) => x * x + 1, { lower: -1, upper: 1, initial: 0.5 })).toThrow(
      NonConvergenceError,
    );
  });

  it('lança NonConvergenceError quando a bisseção esgota as iterações', () => {
    expect(() =>
      findRoot((x) => x - 0.3, {
        lower: 0,
        upper: 1,
        initial: 5,
        derivative: () => 0,
        tolerance: 1e-300,
        maxIterations: 5,
      }),
    ).toThrow(NonConvergenceError);
  });

  it('lança NonConvergenceError quando Newton falha e bisseção não tem sinal oposto', () => {
    expect(() =>
      findRoot((x) => x * x + 1, { lower: -2, upper: 2, initial: 0, derivative: () => 0 }),
    ).toThrow(NonConvergenceError);
  });
});
