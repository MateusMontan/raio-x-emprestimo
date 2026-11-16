/** Alíquotas de IOF para crédito a pessoa física, com vigência e norma de origem. */
export interface TaxPolicy {
  readonly id: string;
  /** Primeira data (YYYY-MM-DD) em que esta versão vale. */
  readonly validFrom: string;
  /** Alíquota diária (0,0082% ao dia = 0,000082). */
  readonly dailyRate: number;
  /** Alíquota adicional, cobrada uma vez sobre o principal (0,38% = 0,0038). */
  readonly additionalRate: number;
  /** Limite de dias contados para o IOF diário. */
  readonly maxDays: number;
  readonly legalReference: {
    readonly title: string;
    readonly url: string;
  };
}
