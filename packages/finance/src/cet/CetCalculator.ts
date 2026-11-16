import { InvalidInputError } from '../errors';
import { findRoot } from '../solver/findRoot';
import type { CashFlow, CetResult } from './types';

const DAYS_PER_YEAR = 365;
const LOWER_BOUND = -0.99999;
const MAX_UPPER_BOUND = 1e18;

interface Term {
  /** Peso do fluxo em relação ao valor liberado. */
  readonly weight: number;
  /** Prazo em anos (base 365). */
  readonly years: number;
}

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

    const terms: Term[] = flows.map((flow) => ({
      weight: flow.amountCents / releasedCents,
      years: flow.days / DAYS_PER_YEAR,
    }));
    const residual = (rate: number): number => presentValue(terms, rate) - 1;
    const upper = findUpperBound(residual);
    const root = findRoot(residual, {
      lower: LOWER_BOUND,
      upper,
      initial: 0.3,
      derivative: (rate) => presentValueSlope(terms, rate),
    });
    return {
      annual: root.value,
      monthly: (1 + root.value) ** (1 / 12) - 1,
      iterations: root.iterations,
      method: root.method,
    };
  }
}

function presentValue(terms: readonly Term[], rate: number): number {
  return terms.reduce((total, term) => total + term.weight * (1 + rate) ** -term.years, 0);
}

function presentValueSlope(terms: readonly Term[], rate: number): number {
  return terms.reduce(
    (total, term) => total - term.weight * term.years * (1 + rate) ** -(term.years + 1),
    0,
  );
}

/** Procura um limite superior com resíduo negativo (valor presente abaixo do liberado). */
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
