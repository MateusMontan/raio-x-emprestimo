import { describe, expect, it } from 'vitest';
import { InvalidInputError } from '../errors';
import { Money } from '../money/Money';
import { Rate } from '../rate/Rate';
import { PriceSchedule } from './PriceSchedule';
import { SacSchedule } from './SacSchedule';

const INFEASIBLE_MESSAGE =
  'Valor baixo demais para este prazo: a parcela arredondada quitaria a dívida antes do fim. Reduza o prazo ou aumente o valor.';

describe('viabilidade do cronograma (defeito: parcela final negativa)', () => {
  it('Price R$ 100,00 a 1% a.m. em 420 meses lança InvalidInputError', () => {
    expect(() =>
      new PriceSchedule().plan(Money.fromCents(10_000), Rate.monthly(0.01), 420),
    ).toThrow(new InvalidInputError(INFEASIBLE_MESSAGE));
  });

  it('Price R$ 100,00 a 0% a.m. em 420 meses lança InvalidInputError', () => {
    expect(() => new PriceSchedule().plan(Money.fromCents(10_000), Rate.monthly(0), 420)).toThrow(
      InvalidInputError,
    );
  });

  it('SAC R$ 100,00 a 1% a.m. em 420 meses lança InvalidInputError', () => {
    expect(() => new SacSchedule().plan(Money.fromCents(10_000), Rate.monthly(0.01), 420)).toThrow(
      InvalidInputError,
    );
  });
});
