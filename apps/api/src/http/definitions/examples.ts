/** Exemplos do critério de aceite 1 da SPEC (Price, R$ 10.000,00, 2% a.m., 12 meses, sem IOF). */
export const SIMULATION_EXAMPLE = {
  amountCents: 1_000_000,
  monthlyRate: 0.02,
  installments: 12,
  system: 'PRICE',
  contractDate: '2026-01-10',
  feesCents: 0,
  iofMode: 'NONE',
} as const;

/** Exemplo do Raio-X de oferta (critério 3 da SPEC): liberado R$ 5.000,00, parcela R$ 500,00, 12 meses. */
export const OFFER_EXAMPLE = {
  releasedCents: 500_000,
  paymentCents: 50_000,
  installments: 12,
  contractDate: '2026-01-10',
} as const;
