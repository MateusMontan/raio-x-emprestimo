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

/**
 * O limite real é 10 ms de CPU no Workers (ADR-001); o alvo local é 5 ms. Aqui se mede
 * tempo de parede, e os runners compartilhados do CI são bem mais lentos e ruidosos que uma
 * máquina de desenvolvimento, então no CI o teto é folgado: ele só pega regressões grandes
 * (por exemplo, um algoritmo que deixa de ser O(n)), não variação de hardware.
 */
const LIMIT_MS = process.env['CI'] ? 25 : 5;

/** Mediana de várias execuções: ignora picos de coleta de lixo e de agendamento. */
function medianMs(task: () => void, runs: number): number {
  const times: number[] = [];
  for (let run = 0; run < runs; run++) {
    const start = performance.now();
    task();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)] ?? Number.POSITIVE_INFINITY;
}

describe('desempenho (ADR-001: limite de 10 ms de CPU; alvo < 5 ms)', () => {
  it('simulação de 420 parcelas com IOF financiado e CET fica abaixo do limite na mediana (50 execuções)', () => {
    for (let warm = 0; warm < 5; warm++) simulateLoan(input);

    expect(medianMs(() => simulateLoan(input), 50)).toBeLessThan(LIMIT_MS);
  });

  it('CET isolado com 420 fluxos também fica abaixo do limite na mediana', () => {
    const flows = Array.from({ length: 420 }, (_, index) => ({
      amountCents: 250_000,
      days: 30 * (index + 1),
    }));
    const calculator = new CetCalculator();
    calculator.calculate(100_000_000, flows);

    expect(medianMs(() => calculator.calculate(100_000_000, flows), 50)).toBeLessThan(LIMIT_MS);
  });
});
