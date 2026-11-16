import type { OfferAnalysis } from '@raiox/contracts';
import { describe, expect, it } from 'vitest';
import { offerAnnouncement } from './offerAnnouncement';

const ANALISE = {
  releasedCents: 500_000,
  totalPaidCents: 600_000,
  impliedMonthlyRate: 0.0292,
  cetMonthly: 0.0345,
} as unknown as OfferAnalysis;

describe('offerAnnouncement', () => {
  it('anuncia que está calculando enquanto o raio-X roda', () => {
    expect(offerAnnouncement('loading', null)).toBe('Calculando…');
  });

  it('anuncia valores, taxa embutida e CET quando o resultado chega', () => {
    expect(offerAnnouncement('success', ANALISE).replace(/\s/g, ' ')).toBe(
      'Resultado atualizado: você recebe R$ 5.000,00 e devolve R$ 6.000,00. ' +
        'Taxa embutida de 2,92% ao mês. CET de 3,45% ao mês.',
    );
  });

  it('não anuncia nada sem resultado', () => {
    expect(offerAnnouncement('idle', null)).toBe('');
  });
});
