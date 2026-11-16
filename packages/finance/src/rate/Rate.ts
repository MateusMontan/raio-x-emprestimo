import { InvalidInputError } from '../errors';
import type { Money } from '../money/Money';

/** Taxa mensal como decimal (0,02 = 2% a.m.). */
export class Rate {
  readonly monthly: number;

  private constructor(monthly: number) {
    this.monthly = monthly;
  }

  static monthly(decimal: number): Rate {
    if (!Number.isFinite(decimal) || decimal <= -1) {
      throw new InvalidInputError(`Taxa mensal inválida (${String(decimal)})`);
    }
    return new Rate(decimal);
  }

  /** Juros de um período sobre o saldo informado, arredondados ao centavo. */
  interestOn(balance: Money): Money {
    return balance.multiply(this.monthly);
  }

  isZero(): boolean {
    return this.monthly === 0;
  }
}
