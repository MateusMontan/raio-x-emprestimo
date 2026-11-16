import { describe, expect, it } from 'vitest';
import { aSimulationInput } from '../testing/fixtures';
import { CalculateSimulation } from './CalculateSimulation';

describe('CalculateSimulation', () => {
  const useCase = new CalculateSimulation();

  it('calcula a Price da SPEC (critério 1): parcela de R$ 945,60 e total de R$ 11.347,15', () => {
    const result = useCase.execute(aSimulationInput({ system: 'PRICE' }));

    expect(result.schedule).toHaveLength(12);
    expect(result.schedule[0]?.payment).toBe(94_560);
    expect(result.schedule[11]?.payment).toBe(94_555);
    expect(result.totals.paidCents).toBe(1_134_715);
  });

  it('calcula o SAC da SPEC (critério 2): primeira parcela de R$ 1.120,00 e última de R$ 1.010,00', () => {
    const result = useCase.execute(
      aSimulationInput({ amountCents: 1_200_000, monthlyRate: 0.01, system: 'SAC' }),
    );

    expect(result.schedule[0]?.payment).toBe(112_000);
    expect(result.schedule[11]?.payment).toBe(101_000);
  });

  it('usa a data do 1º vencimento informada quando ela vem', () => {
    const result = useCase.execute(aSimulationInput({ firstDueDate: '2026-03-15' }));

    expect(result.firstDueDate).toBe('2026-03-15');
  });

  it('propaga o erro do domínio quando a entrada é rejeitada', () => {
    expect(() =>
      useCase.execute(aSimulationInput({ iofMode: 'FINANCED', contractDate: '2021-06-01' })),
    ).toThrow(/IOF/);
  });
});
