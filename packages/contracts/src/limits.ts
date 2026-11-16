/** Limites de entrada (R7 da SPEC). Valores monetários em centavos. */
export const LIMITS = {
  amountCents: { min: 10_000, max: 1_000_000_000 },
  installments: { min: 1, max: 420 },
  /** 0,30 = 30% a.m. */
  monthlyRate: { min: 0, max: 0.3 },
  /** Tarifas e seguro somados, como fração do valor. */
  feesMaxRatio: 0.5,
} as const;

/** Dias de validade de uma simulação compartilhada (NFR de privacidade). */
export const SHARE_TTL_DAYS = 180;

/** Máximo de cenários na comparação (F3). */
export const MAX_COMPARE_SCENARIOS = 3;
