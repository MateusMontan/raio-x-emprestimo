import type { OfferAnalysis, SimulationInput, SimulationResult } from '@raiox/contracts';

/** Valores de um cenário já prontos para exibir. Nenhum é derivado aqui: vêm da API. */
export interface ComparedResult {
  releasedCents: number;
  totalPaidCents: number;
  costCents: number;
  cetMonthly: number;
  cetAnnual: number;
  monthlyRate: number;
  installments: number;
  firstPaymentCents: number;
  lastPaymentCents: number;
}

/** Simulação (F1): a taxa é a informada e as parcelas vêm do cronograma. */
export function fromSimulation(input: SimulationInput, result: SimulationResult): ComparedResult {
  const first = result.schedule[0];
  const last = result.schedule.at(-1);
  if (!first || !last) throw new Error('A simulação não trouxe parcelas.');
  return {
    releasedCents: result.releasedCents,
    totalPaidCents: result.totals.paidCents,
    costCents: result.totals.costCents,
    cetMonthly: result.cetMonthly,
    cetAnnual: result.cetAnnual,
    monthlyRate: input.monthlyRate,
    installments: input.installments,
    firstPaymentCents: first.payment,
    lastPaymentCents: last.payment,
  };
}

/** Oferta (F2): a taxa é a implícita e a parcela é a mesma do início ao fim. */
export function fromOffer(analysis: OfferAnalysis): ComparedResult {
  return {
    releasedCents: analysis.releasedCents,
    totalPaidCents: analysis.totalPaidCents,
    costCents: analysis.costCents,
    cetMonthly: analysis.cetMonthly,
    cetAnnual: analysis.cetAnnual,
    monthlyRate: analysis.impliedMonthlyRate,
    installments: analysis.installments,
    firstPaymentCents: analysis.paymentCents,
    lastPaymentCents: analysis.paymentCents,
  };
}
