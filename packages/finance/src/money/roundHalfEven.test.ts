import { describe, expect, it } from 'vitest';
import { roundHalfEven } from './roundHalfEven';

describe('roundHalfEven', () => {
  it('arredonda para baixo abaixo de meio centavo', () => {
    expect(roundHalfEven(2.4)).toBe(2);
  });

  it('arredonda para cima acima de meio centavo', () => {
    expect(roundHalfEven(2.6)).toBe(3);
  });

  it('empate vai para o inteiro par, nos dois sinais', () => {
    expect(roundHalfEven(2.5)).toBe(2);
    expect(roundHalfEven(3.5)).toBe(4);
    expect(roundHalfEven(-2.5)).toBe(-2);
    expect(roundHalfEven(-3.5)).toBe(-4);
  });

  it('rejeita valores não finitos', () => {
    expect(() => roundHalfEven(Number.NaN)).toThrow(RangeError);
    expect(() => roundHalfEven(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});
