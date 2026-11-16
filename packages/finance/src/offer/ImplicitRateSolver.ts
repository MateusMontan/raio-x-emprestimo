import { InvalidInputError } from '../errors';
import { annuityFactor } from '../internal/annuity';
import { findRoot } from '../solver/findRoot';

const MAX_UPPER_BOUND = 1e6;

/**
 * R5 — Taxa implícita: `i` mensal tal que `PV = PMT · (1 − (1 + i)^−n) / i`.
 * Mesmo solver da R4 (Newton com bisseção de fallback).
 */
export class ImplicitRateSolver {
  /** Retorna a taxa mensal decimal (0,0292 = 2,92% a.m.). */
  solve(presentValueCents: number, paymentCents: number, installments: number): number {
    if (!(presentValueCents > 0) || !(paymentCents > 0)) {
      throw new InvalidInputError('Valor liberado e parcela devem ser positivos');
    }
    if (!Number.isSafeInteger(installments) || installments < 1) {
      throw new InvalidInputError('Número de parcelas deve ser inteiro >= 1');
    }
    const target = presentValueCents / paymentCents;
    const residual = (rate: number): number => annuityFactor(rate, installments) - target;
    const root = findRoot(residual, {
      lower: -0.99999,
      upper: findUpperBound(residual),
      initial: 0.01,
    });
    return root.value;
  }
}

/** Procura um limite superior com resíduo negativo (a(i) abaixo do alvo). */
function findUpperBound(residual: (rate: number) => number): number {
  let upper = 1;
  while (residual(upper) > 0) {
    upper *= 2;
    if (upper > MAX_UPPER_BOUND) {
      throw new InvalidInputError('Parcela incompatível com o valor liberado');
    }
  }
  return upper;
}
