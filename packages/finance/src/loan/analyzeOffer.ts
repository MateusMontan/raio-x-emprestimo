import { CetCalculator } from '../cet/CetCalculator';
import { assertInstallments } from '../amortization/assertInstallments';
import { InvalidInputError } from '../errors';
import { ImplicitRateSolver } from '../offer/ImplicitRateSolver';
import { dueDatesFrom, resolveDates } from './resolveDates';
import type { OfferAnalysis, OfferInput } from './types';

/**
 * Facade F2: Raio-X de oferta. A partir do valor liberado, da parcela e do prazo
 * informados pelo banco, descobre a taxa implícita (R5) e o CET (R4).
 */
export function analyzeOffer(input: OfferInput): OfferAnalysis {
  if (!Number.isSafeInteger(input.releasedCents) || input.releasedCents <= 0) {
    throw new InvalidInputError('Valor liberado deve ser inteiro positivo em centavos');
  }
  if (!Number.isSafeInteger(input.paymentCents) || input.paymentCents <= 0) {
    throw new InvalidInputError('Parcela deve ser inteiro positivo em centavos');
  }
  assertInstallments(input.installments);
  const { contract, firstDue } = resolveDates(input.contractDate, input.firstDueDate);

  const impliedMonthlyRate = new ImplicitRateSolver().solve(
    input.releasedCents,
    input.paymentCents,
    input.installments,
  );
  const flows = dueDatesFrom(firstDue, input.installments).map((due) => ({
    amountCents: input.paymentCents,
    days: contract.daysUntil(due),
  }));
  const cet = new CetCalculator().calculate(input.releasedCents, flows);
  const totalPaidCents = input.paymentCents * input.installments;

  return {
    contractDate: contract.value,
    firstDueDate: firstDue.value,
    releasedCents: input.releasedCents,
    paymentCents: input.paymentCents,
    installments: input.installments,
    impliedMonthlyRate,
    impliedAnnualRate: (1 + impliedMonthlyRate) ** 12 - 1,
    cetAnnual: cet.annual,
    cetMonthly: cet.monthly,
    totalPaidCents,
    costCents: totalPaidCents - input.releasedCents,
  };
}
