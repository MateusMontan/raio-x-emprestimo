import type { SimulationResult } from '@raiox/contracts';
import { describe, expect, it } from 'vitest';
import { simulationAnnouncement } from './simulationAnnouncement';

const RESULTADO = {
  releasedCents: 1_000_000,
  totals: { paidCents: 1_134_715 },
  cetMonthly: 0.0223,
} as unknown as SimulationResult;

describe('simulationAnnouncement', () => {
  it('anuncia que está calculando enquanto o cálculo roda', () => {
    expect(simulationAnnouncement('loading', null)).toBe('Calculando…');
  });

  it('anuncia o resumo completo quando o resultado chega', () => {
    expect(simulationAnnouncement('success', RESULTADO).replace(/\s/g, ' ')).toBe(
      'Resultado atualizado: você recebe R$ 10.000,00 e devolve R$ 11.347,15. CET de 2,23% ao mês.',
    );
  });

  it('não anuncia nada antes do primeiro cálculo nem depois de um erro', () => {
    expect(simulationAnnouncement('idle', null)).toBe('');
    expect(simulationAnnouncement('error', RESULTADO)).toBe('');
  });
});
