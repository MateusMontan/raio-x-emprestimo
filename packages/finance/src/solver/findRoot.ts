import { NonConvergenceError } from '../errors';

export interface RootOptions {
  /** Limite inferior do intervalo de busca (a bisseção precisa de sinais opostos nos extremos). */
  readonly lower: number;
  readonly upper: number;
  /** Ponto inicial do Newton-Raphson. */
  readonly initial: number;
  /** Derivada analítica. Se omitida, usa diferença central. */
  readonly derivative?: (x: number) => number;
  readonly tolerance?: number;
  readonly maxIterations?: number;
}

export interface RootResult {
  readonly value: number;
  readonly iterations: number;
  readonly method: 'newton' | 'bisection';
}

const DEFAULT_TOLERANCE = 1e-10;
const DEFAULT_MAX_ITERATIONS = 100;

/**
 * Newton-Raphson com fallback para bisseção (ADR-002, R4 e R5).
 * Newton converge rápido; se sair do intervalo, divergir ou esgotar as iterações,
 * a bisseção garante a raiz dentro de `lower..upper`.
 */
export function findRoot(fn: (x: number) => number, options: RootOptions): RootResult {
  const tolerance = options.tolerance ?? DEFAULT_TOLERANCE;
  const maxIterations = options.maxIterations ?? DEFAULT_MAX_ITERATIONS;
  const derivative = options.derivative ?? ((x: number) => centralDifference(fn, x));

  const newton = tryNewton(fn, derivative, options, tolerance, maxIterations);
  if (newton) return newton;
  return bisect(fn, options.lower, options.upper, tolerance, maxIterations);
}

function tryNewton(
  fn: (x: number) => number,
  derivative: (x: number) => number,
  options: RootOptions,
  tolerance: number,
  maxIterations: number,
): RootResult | undefined {
  let x = options.initial;
  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    const slope = derivative(x);
    if (!Number.isFinite(slope) || slope === 0) return undefined;
    const next = x - fn(x) / slope;
    if (!Number.isFinite(next) || next <= options.lower || next >= options.upper) return undefined;
    if (Math.abs(next - x) < tolerance) {
      return { value: next, iterations: iteration, method: 'newton' };
    }
    x = next;
  }
  return undefined;
}

function bisect(
  fn: (x: number) => number,
  lower: number,
  upper: number,
  tolerance: number,
  maxIterations: number,
): RootResult {
  let lo = lower;
  let hi = upper;
  let fLo = fn(lo);
  const fHi = fn(hi);
  if (Math.sign(fLo) === Math.sign(fHi)) {
    throw new NonConvergenceError('Intervalo sem mudança de sinal: não há raiz para o solver');
  }
  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    const mid = (lo + hi) / 2;
    const fMid = fn(mid);
    if ((hi - lo) / 2 < tolerance || fMid === 0) {
      return { value: mid, iterations: iteration, method: 'bisection' };
    }
    if (Math.sign(fMid) === Math.sign(fLo)) {
      lo = mid;
      fLo = fMid;
    } else {
      hi = mid;
    }
  }
  throw new NonConvergenceError('Bisseção esgotou as iterações sem convergir');
}

function centralDifference(fn: (x: number) => number, x: number): number {
  const h = 1e-7 * Math.max(1, Math.abs(x));
  return (fn(x + h) - fn(x - h)) / (2 * h);
}
