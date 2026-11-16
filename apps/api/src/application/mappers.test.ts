import { describe, expect, it } from 'vitest';
import { aSimulationInput, anOfferInput } from './testing/fixtures';
import { toLoanInput, toOfferInput } from './mappers';

describe('toLoanInput', () => {
  it('copia os campos da simulação para a entrada do domínio', () => {
    const loan = toLoanInput(aSimulationInput({ system: 'SAC', feesCents: 5000 }));

    expect(loan).toEqual({
      amountCents: 1_000_000,
      monthlyRate: 0.02,
      installments: 12,
      system: 'SAC',
      contractDate: '2026-01-10',
      feesCents: 5000,
      iofMode: 'NONE',
    });
  });

  it('omite firstDueDate quando não foi informado, sem deixar a chave com undefined', () => {
    const loan = toLoanInput(aSimulationInput());

    expect(Object.keys(loan)).not.toContain('firstDueDate');
  });

  it('repassa firstDueDate quando foi informado', () => {
    const loan = toLoanInput(aSimulationInput({ firstDueDate: '2026-03-01' }));

    expect(loan.firstDueDate).toBe('2026-03-01');
  });
});

describe('toOfferInput', () => {
  it('copia os campos do Raio-X para a entrada do domínio', () => {
    expect(toOfferInput(anOfferInput())).toEqual({
      releasedCents: 500_000,
      paymentCents: 50_000,
      installments: 12,
      contractDate: '2026-01-10',
    });
  });

  it('omite firstDueDate quando não foi informado e repassa quando foi', () => {
    expect(Object.keys(toOfferInput(anOfferInput()))).not.toContain('firstDueDate');
    expect(toOfferInput(anOfferInput({ firstDueDate: '2026-02-10' })).firstDueDate).toBe(
      '2026-02-10',
    );
  });
});
