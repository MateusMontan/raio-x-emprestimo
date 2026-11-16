/** Fluxo pago pelo cliente: valor em centavos e dias corridos desde a liberação (R4). */
export interface CashFlow {
  readonly amountCents: number;
  readonly days: number;
}

export interface CetResult {
  /** CET anual (base 365 dias), decimal. */
  readonly annual: number;
  /** CET mensal, `(1 + annual)^(1/12) − 1`. */
  readonly monthly: number;
  readonly iterations: number;
  readonly method: 'newton' | 'bisection';
}
