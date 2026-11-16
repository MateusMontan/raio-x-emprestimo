import { describe, expect, it } from 'vitest';
import { InvalidInputError } from '../errors';
import type { AmortizationSystem } from '../amortization/types';
import { simulateLoan } from './simulateLoan';
import type { LoanInput } from './types';

const AMOUNTS_CENTS = [10_000, 12_345, 100_000, 999_999, 1_000_000, 5_000_000, 123_456_789];
const RATES = [0, 0.001, 0.0123, 0.02, 0.1, 0.3];
const INSTALLMENTS = [1, 2, 3, 7, 12, 36, 60, 120, 420];
const SYSTEMS: readonly AmortizationSystem[] = ['PRICE', 'SAC'];

interface Outcome {
  readonly gap: number;
  readonly label: string;
}

/** Roda um caso de IOF financiado: devolve a diferença (ou null se a entrada é inviável). */
function gapFor(input: Omit<LoanInput, 'contractDate' | 'iofMode'>): Outcome | null {
  try {
    const result = simulateLoan({
      ...input,
      contractDate: '2026-11-15',
      iofMode: 'FINANCED',
    });
    const gap = result.financedPrincipalCents - result.amountCents - result.iof.totalCents;
    return { gap, label: JSON.stringify(input) };
  } catch (error) {
    if (error instanceof InvalidInputError) return null;
    throw error;
  }
}

describe('IOF financiado: principal = valor + IOF (R3, convergência ao centavo)', () => {
  it('para cada caso, o principal financiado é valor + IOF exatamente, ou difere em 1 centavo por ciclo', () => {
    const cycles: string[] = [];
    let converged = 0;
    for (const system of SYSTEMS)
      for (const amountCents of AMOUNTS_CENTS)
        for (const monthlyRate of RATES)
          for (const installments of INSTALLMENTS) {
            const outcome = gapFor({ amountCents, monthlyRate, installments, system });
            if (!outcome) continue;
            if (outcome.gap === 0) {
              converged++;
              continue;
            }
            // Ciclo de dois valores (ver financing.ts): o maior é escolhido e a diferença é 1 centavo.
            expect(outcome.gap).toBe(1);
            cycles.push(outcome.label);
          }
    // Documenta o achado: a maioria converge exatamente; ciclos existem e são de 1 centavo.
    expect(converged).toBeGreaterThan(cycles.length);
  });

  it('a 0% a.m. com 1 parcela de R$ 1.000,00 o principal fecha com IOF exato', () => {
    const outcome = gapFor({
      amountCents: 100_000,
      monthlyRate: 0,
      installments: 1,
      system: 'PRICE',
    });
    expect(outcome?.gap).toBe(0);
  });
});
