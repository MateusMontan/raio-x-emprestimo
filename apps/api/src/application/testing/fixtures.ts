import type { OfferInput, SimulationInput } from '@raiox/contracts';

/** Simulação de referência: Price, R$ 10.000,00, 2% a.m., 12 meses, sem IOF nem tarifas (2026). */
export function aSimulationInput(overrides: Partial<SimulationInput> = {}): SimulationInput {
  return {
    amountCents: 1_000_000,
    monthlyRate: 0.02,
    installments: 12,
    system: 'PRICE',
    contractDate: '2026-01-10',
    feesCents: 0,
    iofMode: 'NONE',
    ...overrides,
  };
}

/** Raio-X de referência: liberado R$ 5.000,00, parcela R$ 500,00, 12 meses (2026). */
export function anOfferInput(overrides: Partial<OfferInput> = {}): OfferInput {
  return {
    releasedCents: 500_000,
    paymentCents: 50_000,
    installments: 12,
    contractDate: '2026-01-10',
    ...overrides,
  };
}
