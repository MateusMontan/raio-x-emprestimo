import type { AmortizationSystem } from '../amortization/types';

/** IOF pago à vista (descontado do liberado), financiado (somado ao principal) ou não calculado. */
export type IofMode = 'FINANCED' | 'CASH' | 'NONE';

/** Entrada da simulação (F1). Valores monetários em centavos inteiros; taxa mensal decimal. */
export interface LoanInput {
  readonly amountCents: number;
  /** 0,02 = 2% a.m. */
  readonly monthlyRate: number;
  readonly installments: number;
  readonly system: AmortizationSystem;
  /** Data da contratação/liberação (YYYY-MM-DD). */
  readonly contractDate: string;
  /** Primeiro vencimento. Padrão: contratação + 30 dias. */
  readonly firstDueDate?: string;
  /** Tarifas e seguro somados, pagos à vista. */
  readonly feesCents?: number;
  /** Padrão: FINANCED. */
  readonly iofMode?: IofMode;
}

export interface ScheduleRow {
  readonly n: number;
  readonly dueDate: string;
  readonly payment: number;
  readonly interest: number;
  readonly principal: number;
  /** Encargos cobrados na parcela. Zero na v1: IOF financiado entra no principal e tarifas são à vista. */
  readonly charges: number;
  readonly balance: number;
}

export interface IofSummary {
  readonly mode: IofMode;
  readonly taxPolicyId: string;
  readonly dailyCents: number;
  readonly additionalCents: number;
  readonly totalCents: number;
}

export interface LoanTotals {
  /** Soma das parcelas pagas pelo cliente. */
  readonly paidCents: number;
  readonly interestCents: number;
  readonly principalCents: number;
  readonly chargesCents: number;
  readonly iofCents: number;
  readonly feesCents: number;
  /** Custo do crédito para o cliente: pago − liberado (inclui IOF, juros e tarifas). */
  readonly costCents: number;
}

export interface SimulationResult {
  readonly contractDate: string;
  readonly firstDueDate: string;
  readonly system: AmortizationSystem;
  readonly amountCents: number;
  /** Valor efetivamente recebido pelo cliente (FC0 da R4). */
  readonly releasedCents: number;
  /** Principal amortizado. Inclui o IOF quando financiado. */
  readonly financedPrincipalCents: number;
  readonly feesCents: number;
  readonly iof: IofSummary;
  readonly schedule: readonly ScheduleRow[];
  readonly totals: LoanTotals;
  readonly cetAnnual: number;
  readonly cetMonthly: number;
}

/** Entrada do Raio-X de oferta (F2). */
export interface OfferInput {
  readonly releasedCents: number;
  readonly paymentCents: number;
  readonly installments: number;
  readonly contractDate: string;
  readonly firstDueDate?: string;
}

export interface OfferAnalysis {
  readonly contractDate: string;
  readonly firstDueDate: string;
  readonly releasedCents: number;
  readonly paymentCents: number;
  readonly installments: number;
  /** Taxa mensal implícita (R5). */
  readonly impliedMonthlyRate: number;
  readonly impliedAnnualRate: number;
  readonly cetAnnual: number;
  readonly cetMonthly: number;
  readonly totalPaidCents: number;
  readonly costCents: number;
}
