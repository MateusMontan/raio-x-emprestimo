import { InvalidInputError } from '../errors';
import { findRoot } from '../solver/findRoot';

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

    const upper = findUpperBound(residual);
    const root = findRoot(residual, {
      lower: -0.99999,
      upper,
      initial: 0.01,
    });
    return root.value;
  }
}

/**
 * Fator de anuidade `a(i) = (1 − (1 + i)^−n) / i`. Escrito com expm1/log1p para
 * manter precisão perto de i = 0, onde o limite é `n`.
 */
function annuityFactor(rate: number, installments: number): number {
  if (Math.abs(rate) < 1e-12) return installments;
  return -Math.expm1(-installments * Math.log1p(rate)) / rate;
}

function findUpperBound(residual: (rate: number) => number): number {
  let upper = 1;
  while (residual(upper) > 0) {
    upper *= 2;
    if (upper > 1e6) {
      throw new InvalidInputError('Parcela incompatível com o valor liberado');
    }
  }
  return upper;
}
