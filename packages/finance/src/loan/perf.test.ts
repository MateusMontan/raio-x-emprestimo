import { describe, expect, it } from 'vitest';
import { simulateLoan } from './simulateLoan';
import { CetCalculator } from '../cet/CetCalculator';
import type { LoanInput } from './types';

const input: LoanInput = {
  amountCents: 1_000_000_000,
  monthlyRate: 0.025,
  installments: 420,
  system: 'PRICE',
  contractDate: '2026-11-15',
  feesCents: 50_000,
  iofMode: 'FINANCED',
};

describe('desempenho (ADR-001: limite de 10 ms de CPU; alvo < 5 ms)', () => {
  it('simulação de 420 parcelas com IOF financiado e CET leva menos de 5 ms em média (50 execuções)', () => {
    for (let warm = 0; warm < 5; warm++) simulateLoan(input);

    const runs = 50;
    const start = performance.now();
    for (let run = 0; run < runs; run++) {
      simulateLoan(input);
    }
    const averageMs = (performance.now() - start) / runs;

    expect(averageMs).toBeLessThan(5);
  });

  it('CET isolado com 420 fluxos também fica abaixo de 5 ms em média', () => {
    const flows = Array.from({ length: 420 }, (_, index) => ({
      amountCents: 250_000,
      days: 30 * (index + 1),
    }));
    const calculator = new CetCalculator();
    calculator.calculate(100_000_000, flows);

    const start = performance.now();
    for (let run = 0; run < 50; run++) {
      calculator.calculate(100_000_000, flows);
    }
    expect((performance.now() - start) / 50).toBeLessThan(5);
  });
});
