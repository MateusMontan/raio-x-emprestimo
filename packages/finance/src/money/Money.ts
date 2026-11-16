import { InvalidInputError } from '../errors';
import { roundHalfEven } from './roundHalfEven';

/** Valor monetário em centavos inteiros (ADR-002). */
export class Money {
  static readonly ZERO = new Money(0);

  readonly cents: number;

  private constructor(cents: number) {
    this.cents = cents;
  }

  static fromCents(cents: number): Money {
    if (!Number.isSafeInteger(cents)) {
      throw new InvalidInputError(`Valor em centavos deve ser inteiro seguro (${String(cents)})`);
    }
    return new Money(cents);
  }

  /** Converte reais (number) para centavos com arredondamento half-even. */
  static fromReais(reais: number): Money {
    return new Money(roundHalfEven(reais * 100));
  }

  /** Cria a partir de um valor exato em centavos, arredondando uma única vez (half-even). */
  static fromExactCents(exactCents: number): Money {
    return new Money(roundHalfEven(exactCents));
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    return new Money(this.cents - other.cents);
  }

  /** Multiplica por um fator e arredonda o resultado ao centavo (half-even). */
  multiply(factor: number): Money {
    return new Money(roundHalfEven(this.cents * factor));
  }

  /** Divide por um inteiro positivo e arredonda ao centavo (half-even). */
  divide(divisor: number): Money {
    return new Money(roundHalfEven(this.cents / divisor));
  }

  isPositive(): boolean {
    return this.cents > 0;
  }

  isZero(): boolean {
    return this.cents === 0;
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }
}
