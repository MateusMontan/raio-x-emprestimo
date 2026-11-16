import { InvalidInputError } from '../errors';
import { findRoot } from '../solver/findRoot';
import type { CashFlow, CetResult } from './types';

const DAYS_PER_YEAR = 365;
const LOWER_BOUND = -0.99999;
const MAX_UPPER_BOUND = 1e18;

/**
 * R4 — CET: taxa anual `r` tal que `FC0 = Σ FC_j / (1 + r)^((d_j − d_0) / 365)`.
 * Resolvido sobre fluxos normalizados por FC0 para que a tolerância seja relativa.
 */
export class CetCalculator {
  calculate(releasedCents: number, flows: readonly CashFlow[]): CetResult {
    if (!(releasedCents > 0)) {
      throw new InvalidInputError('Valor liberado deve ser positivo para calcular o CET');
    }
    if (flows.length === 0) {
      throw new InvalidInputError('CET requer ao menos um fluxo de pagamento');
    }

    const weights = flows.map((flow) => flow.amountCents / releasedCents);
    const years = flows.map((flow) => flow.days / DAYS_PER_YEAR);
    const residual = (rate: number): number => presentValue(weights, years, rate) - 1;
    const slope = (rate: number): number => presentValueSlope(weights, years, rate);

    const upper = findUpperBound(residual);
    const root = findRoot(residual, {
      lower: LOWER_BOUND,
      upper,
      initial: 0.3,
      derivative: slope,
    });
    return {
      annual: root.value,
      monthly: (1 + root.value) ** (1 / 12) - 1,
      iterations: root.iterations,
      method: root.method,
    };
  }
}

function presentValue(weights: readonly number[], years: readonly number[], rate: number): number {
  let total = 0;
  for (let j = 0; j < weights.length; j++) {
    total += (weights[j] ?? 0) * (1 + rate) ** -(years[j] ?? 0);
  }
  return total;
}

function presentValueSlope(weights: readonly number[], years: readonly number[], rate: number): number {
  let total = 0;
  for (let j = 0; j < weights.length; j++) {
    const t = years[j] ?? 0;
    total -= (weights[j] ?? 0) * t * (1 + rate) ** -(t + 1);
  }
  return total;
}

/** Procura um limite superior com sinal negativo do resíduo (valor presente abaixo de 1). */
function findUpperBound(residual: (rate: number) => number): number {
  let upper = 1;
  while (residual(upper) > 0) {
    upper *= 2;
    if (upper > MAX_UPPER_BOUND) {
      throw new InvalidInputError('CET acima do limite numérico');
    }
  }
  return upper;
}
