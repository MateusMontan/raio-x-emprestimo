import type { Money } from '../money/Money';
import type { Rate } from '../rate/Rate';

export type AmortizationSystem = 'PRICE' | 'SAC';

/** Uma parcela calculada pelo sistema de amortização, sem datas (valores em centavos via Money). */
export interface Installment {
  readonly n: number;
  readonly interest: Money;
  readonly principal: Money;
  readonly payment: Money;
  readonly balance: Money;
}

/** Estratégia de amortização (OCP): novos sistemas implementam esta interface sem tocar nos existentes. */
export interface AmortizationStrategy {
  readonly system: AmortizationSystem;
  /** Gera as parcelas. A última parcela absorve o resíduo: o saldo final é exatamente zero. */
  plan(principal: Money, rate: Rate, installments: number): Installment[];
}
