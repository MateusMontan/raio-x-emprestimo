import { describe, expect, it } from 'vitest';
import { InvalidInputError } from '../errors';
import { Money } from '../money/Money';
import { Rate } from '../rate/Rate';
import { PriceSchedule } from './PriceSchedule';
import { SacSchedule } from './SacSchedule';
import type { AmortizationStrategy, Installment } from './types';

const MIN_CENTS = 10_000;
const MAX_CENTS = 1_000_000_000;
const MIN_INSTALLMENTS = 1;
const MAX_INSTALLMENTS = 420;
const MAX_RATE = 0.3;
const RANDOM_CASES = 300;
const SEED = 20_260_101;

/** Gerador pseudoaleatório determinístico (mulberry32): mesma semente, mesmos casos. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

interface Case {
  readonly strategy: AmortizationStrategy;
  readonly amountCents: number;
  readonly monthlyRate: number;
  readonly installments: number;
}

function cornerCases(): Case[] {
  const strategies: AmortizationStrategy[] = [new PriceSchedule(), new SacSchedule()];
  const amounts = [MIN_CENTS, MAX_CENTS];
  const installments = [MIN_INSTALLMENTS, MAX_INSTALLMENTS];
  const rates = [0, MAX_RATE];
  const cases: Case[] = [];
  for (const strategy of strategies)
    for (const amountCents of amounts)
      for (const monthlyRate of rates)
        for (const count of installments)
          cases.push({ strategy, amountCents, monthlyRate, installments: count });
  return cases;
}

function randomCases(random: () => number): Case[] {
  const cases: Case[] = [];
  for (let index = 0; index < RANDOM_CASES; index++) {
    const strategy = random() < 0.5 ? new PriceSchedule() : new SacSchedule();
    const amountCents = MIN_CENTS + Math.floor(random() * (MAX_CENTS - MIN_CENTS + 1));
    const installments =
      MIN_INSTALLMENTS + Math.floor(random() * (MAX_INSTALLMENTS - MIN_INSTALLMENTS + 1));
    const monthlyRate = random() * MAX_RATE;
    cases.push({ strategy, amountCents, monthlyRate, installments });
  }
  return cases;
}

/** Verifica as propriedades de um cronograma aceito (saldo >= 0, parcela > 0, etc.). */
function expectWellFormed(rows: readonly Installment[], amountCents: number): void {
  for (const row of rows) {
    expect(row.payment.cents).toBeGreaterThan(0);
    expect(row.principal.cents).toBeGreaterThanOrEqual(0);
    expect(row.balance.cents).toBeGreaterThanOrEqual(0);
    expect(row.payment.cents).toBe(row.interest.cents + row.principal.cents);
  }
  const amortized = rows.reduce((sum, row) => sum + row.principal.cents, 0);
  expect(amortized).toBe(amountCents);
  expect(rows.at(-1)?.balance.cents).toBe(0);
}

/** Roda um caso: devolve true se gerou cronograma válido, false se recusou por valor baixo. */
function runCase(item: Case): boolean {
  const principal = Money.fromCents(item.amountCents);
  const rate = Rate.monthly(item.monthlyRate);
  try {
    const rows = item.strategy.plan(principal, rate, item.installments);
    expectWellFormed(rows, item.amountCents);
    return true;
  } catch (error) {
    if (error instanceof InvalidInputError) return false;
    throw error;
  }
}

describe('propriedades dos cronogramas dentro dos limites da R7', () => {
  it('cantos da R7 (R$ 100,00 e R$ 10.000.000,00; 1 e 420 meses; 0% e 30%): erro dedicado ou cronograma válido', () => {
    for (const item of cornerCases()) {
      expect(() => runCase(item)).not.toThrow();
    }
  });

  it(`${RANDOM_CASES} combinações aleatórias com semente fixa: erro dedicado ou cronograma válido`, () => {
    const cases = randomCases(seededRandom(SEED));
    let accepted = 0;
    for (const item of cases) {
      if (runCase(item)) accepted++;
    }
    // Garante que o teste exercita os dois caminhos e não só um deles.
    expect(accepted).toBeGreaterThan(0);
    expect(accepted).toBeLessThan(cases.length);
    // Cada caso simula até 420 parcelas com IOF financiado; no CI isso passa de 5 s.
  }, 60_000);
});
