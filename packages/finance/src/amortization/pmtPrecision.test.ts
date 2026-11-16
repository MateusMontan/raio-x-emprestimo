import { describe, expect, it } from 'vitest';
import { Money } from '../money/Money';
import { Rate } from '../rate/Rate';
import { PriceSchedule } from './PriceSchedule';

const PRINCIPAL_CENTS = 1_000_000_000;
const TINY_RATE = 1e-9;

/**
 * PMT exato (sem arredondar) em centavos, expandido até o termo de 1ª ordem em i:
 * PMT = PV · i / (1 − (1 + i)^−n) ≈ (PV / n) · (1 + (n + 1)·i / 2).
 */
function idealPaymentCents(installments: number): number {
  return (PRINCIPAL_CENTS / installments) * (1 + ((installments + 1) * TINY_RATE) / 2);
}

describe('precisão do PMT com taxa muito pequena (defeito: cancelamento em 1 − (1 + i)^−n)', () => {
  it('com i = 1e-9 a parcela fica a menos de 1 centavo do PMT exato, em vários prazos', () => {
    for (const installments of [2, 12, 60, 420]) {
      const rows = new PriceSchedule().plan(
        Money.fromCents(PRINCIPAL_CENTS),
        Rate.monthly(TINY_RATE),
        installments,
      );
      const payment = rows[0]?.payment.cents ?? Number.NaN;
      expect(Math.abs(payment - idealPaymentCents(installments))).toBeLessThan(1);
    }
  });
});
