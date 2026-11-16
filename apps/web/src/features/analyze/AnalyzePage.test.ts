import { flushPromises, mount } from '@vue/test-utils';
import type { OfferAnalysis } from '@raiox/contracts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { analyzeOffer } from '../../shared/api/client';
import AnalyzePage from './AnalyzePage.vue';

vi.mock('../../shared/api/client', () => ({ analyzeOffer: vi.fn() }));

const analisar = vi.mocked(analyzeOffer);

const ANALISE = {
  releasedCents: 500_000,
  totalPaidCents: 600_000,
  impliedMonthlyRate: 0.0292,
  cetMonthly: 0.0345,
} as unknown as OfferAnalysis;

function mountPage() {
  return mount(AnalyzePage, { global: { stubs: { OfferResult: true, AddToComparison: true } } });
}

describe('AnalyzePage', () => {
  beforeEach(() => {
    analisar.mockReset();
  });

  it('mantém a região de anúncio no DOM, vazia antes do primeiro resultado', () => {
    const wrapper = mountPage();

    const region = wrapper.find('p.visually-hidden');
    expect(region.attributes('aria-live')).toBe('polite');
    expect(region.text()).toBe('');
    wrapper.unmount();
  });

  it('anuncia o resultado completo, com a taxa embutida e o CET', async () => {
    analisar.mockResolvedValue(ANALISE);
    const wrapper = mountPage();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('p.visually-hidden').text().replace(/\s/g, ' ')).toBe(
      'Resultado atualizado: você recebe R$ 5.000,00 e devolve R$ 6.000,00. Taxa embutida de 2,92% ao mês. CET de 3,45% ao mês.',
    );
    wrapper.unmount();
  });
});
