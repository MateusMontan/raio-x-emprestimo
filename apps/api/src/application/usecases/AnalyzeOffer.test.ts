import { describe, expect, it } from 'vitest';
import { anOfferInput } from '../testing/fixtures';
import { AnalyzeOffer } from './AnalyzeOffer';

describe('AnalyzeOffer', () => {
  const useCase = new AnalyzeOffer();

  it('descobre a taxa implícita da SPEC (critério 3): liberado R$ 5.000,00, parcela R$ 500,00, 12 meses ≈ 2,92% a.m.', () => {
    const result = useCase.execute(anOfferInput());

    expect(result.impliedMonthlyRate).toBeCloseTo(0.0292, 4);
    expect(result.totalPaidCents).toBe(600_000);
    expect(result.costCents).toBe(100_000);
  });

  it('usa a data do 1º vencimento informada quando ela vem', () => {
    const result = useCase.execute(anOfferInput({ firstDueDate: '2026-02-20' }));

    expect(result.firstDueDate).toBe('2026-02-20');
  });
});
