import type { AmortizationStrategy } from '../amortization/types';
import type { IsoDate } from '../date/IsoDate';
import { Money } from '../money/Money';
import type { Rate } from '../rate/Rate';
import type { IofCalculator } from '../tax/IofCalculator';
import { requireAt } from '../internal/requireAt';
import type { ScheduleRow } from './types';

/** Tudo que não muda entre as iterações do IOF financiado. */
export interface ScheduleContext {
  readonly strategy: AmortizationStrategy;
  readonly rate: Rate;
  readonly installments: number;
  readonly dueDates: readonly IsoDate[];
  /** Dias corridos entre a liberação e cada vencimento (R4). */
  readonly dayCounts: readonly number[];
  /** Null quando IOF = NONE: a política de tributos nem é consultada. */
  readonly iof: IofCalculator | null;
}

export interface SchedulePlan {
  readonly principal: Money;
  readonly rows: readonly ScheduleRow[];
  readonly dailyIof: Money;
  readonly additionalIof: Money;
}

/**
 * Gera o cronograma para um principal e calcula o IOF que ele gera (R1/R2 + R3).
 * O IOF diário é somado sem arredondar por parcela e arredondado uma única vez,
 * o que mantém a iteração do IOF financiado estável ao centavo.
 */
export function planSchedule(context: ScheduleContext, principal: Money): SchedulePlan {
  const installments = context.strategy.plan(principal, context.rate, context.installments);
  const iof = context.iof;
  let dailyExact = 0;
  const rows = installments.map<ScheduleRow>((installment, index) => {
    if (iof) {
      const days = requireAt(context.dayCounts, index);
      dailyExact += iof.dailyExact(installment.principal, days);
    }
    return {
      n: installment.n,
      dueDate: requireAt(context.dueDates, index).value,
      payment: installment.payment.cents,
      interest: installment.interest.cents,
      principal: installment.principal.cents,
      charges: 0,
      balance: installment.balance.cents,
    };
  });
  return {
    principal,
    rows,
    dailyIof: Money.fromExactCents(dailyExact),
    additionalIof: iof ? Money.fromExactCents(iof.additionalExact(principal)) : Money.ZERO,
  };
}
