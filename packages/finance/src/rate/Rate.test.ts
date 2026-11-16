import { describe, expect, it } from 'vitest';
import { InvalidInputError } from '../errors';
import { Money } from '../money/Money';
import { Rate } from './Rate';

describe('Rate', () => {
  it('representa taxa mensal decimal', () => {
    expect(Rate.monthly(0.02).monthly).toBe(0.02);
  });

  it('calcula juros do período sobre o saldo, arredondados ao centavo', () => {
    expect(Rate.monthly(0.02).interestOn(Money.fromCents(1_000_000)).cents).toBe(20_000);
  });

  it('identifica taxa zero', () => {
    expect(Rate.monthly(0).isZero()).toBe(true);
    expect(Rate.monthly(0.01).isZero()).toBe(false);
  });

  it('aceita taxa negativa acima de -100% (usada pelo solver)', () => {
    expect(Rate.monthly(-0.5).monthly).toBe(-0.5);
  });

  it('rejeita taxa não finita ou igual/abaixo de -100%', () => {
    expect(() => Rate.monthly(-1)).toThrow(InvalidInputError);
    expect(() => Rate.monthly(Number.NaN)).toThrow(InvalidInputError);
  });
});
