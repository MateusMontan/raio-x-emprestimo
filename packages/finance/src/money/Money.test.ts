import { describe, expect, it } from 'vitest';
import { InvalidInputError } from '../errors';
import { Money } from './Money';

describe('Money', () => {
  it('guarda centavos inteiros', () => {
    expect(Money.fromCents(12_345).cents).toBe(12_345);
  });

  it('rejeita centavos fracionados ou fora da faixa segura', () => {
    expect(() => Money.fromCents(1.5)).toThrow(InvalidInputError);
    expect(() => Money.fromCents(Number.MAX_SAFE_INTEGER + 1)).toThrow(InvalidInputError);
  });

  it('converte reais com arredondamento ao centavo', () => {
    expect(Money.fromReais(10_000).cents).toBe(1_000_000);
    expect(Money.fromReais(0.125).cents).toBe(12);
    expect(Money.fromReais(0.135).cents).toBe(14);
  });

  it('soma e subtrai sem perda de precisão', () => {
    const a = Money.fromCents(10_000_001);
    const b = Money.fromCents(2);
    expect(a.add(b).cents).toBe(10_000_003);
    expect(a.subtract(b).cents).toBe(9_999_999);
  });

  it('multiplica e divide com arredondamento half-even', () => {
    expect(Money.fromCents(1_000).multiply(0.0025).cents).toBe(2);
    expect(Money.fromCents(1_001).divide(2).cents).toBe(500);
    expect(Money.fromCents(1_003).divide(2).cents).toBe(502);
  });

  it('informa sinal, zero e igualdade', () => {
    expect(Money.fromCents(1).isPositive()).toBe(true);
    expect(Money.ZERO.isPositive()).toBe(false);
    expect(Money.ZERO.isZero()).toBe(true);
    expect(Money.fromCents(5).equals(Money.fromCents(5))).toBe(true);
    expect(Money.fromCents(5).equals(Money.fromCents(6))).toBe(false);
  });
});
