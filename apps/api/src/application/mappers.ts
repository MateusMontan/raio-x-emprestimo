import type { OfferInput, SimulationInput } from '@raiox/contracts';
import type { LoanInput, OfferInput as DomainOfferInput } from '@raiox/finance';

/** Converte a entrada validada da simulação para a entrada do domínio. */
export function toLoanInput(input: SimulationInput): LoanInput {
  return {
    amountCents: input.amountCents,
    monthlyRate: input.monthlyRate,
    installments: input.installments,
    system: input.system,
    contractDate: input.contractDate,
    feesCents: input.feesCents,
    iofMode: input.iofMode,
    ...(input.firstDueDate !== undefined ? { firstDueDate: input.firstDueDate } : {}),
  };
}

/** Converte a entrada validada do Raio-X de oferta para a entrada do domínio. */
export function toOfferInput(input: OfferInput): DomainOfferInput {
  return {
    releasedCents: input.releasedCents,
    paymentCents: input.paymentCents,
    installments: input.installments,
    contractDate: input.contractDate,
    ...(input.firstDueDate !== undefined ? { firstDueDate: input.firstDueDate } : {}),
  };
}
