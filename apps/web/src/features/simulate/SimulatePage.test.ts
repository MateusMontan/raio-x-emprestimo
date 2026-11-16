import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { simulationInputSchema, type SimulationResult } from '@raiox/contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateSimulation } from '../../shared/api/client';
import SimulatePage from './SimulatePage.vue';

vi.mock('../../shared/api/client', () => ({
  calculateSimulation: vi.fn(),
  shareSimulation: vi.fn(),
}));

const calculate = vi.mocked(calculateSimulation);

const RESULTADO = {
  releasedCents: 2_500_000,
  totals: { paidCents: 2_900_000 },
  cetMonthly: 0.0231,
  schedule: [],
} as unknown as SimulationResult;

const ENTRADA = simulationInputSchema.parse({
  amountCents: 2_500_000,
  monthlyRate: 0.03,
  installments: 24,
  system: 'SAC',
  contractDate: '2026-11-15',
});

function mountPage() {
  return mount(SimulatePage, {
    attachTo: document.body,
    global: { stubs: { ResultSummary: true, Carne: true, ShareButton: true } },
  });
}

describe('SimulatePage', () => {
  beforeEach(() => {
    calculate.mockReset();
    calculate.mockResolvedValue(RESULTADO);
  });

  afterEach(() => {
    window.history.replaceState(null, '');
  });

  it('carrega a entrada recebida em history.state e calcula sozinha', async () => {
    const entry = simulationInputSchema.parse({
      amountCents: 2_500_000,
      monthlyRate: 0.03,
      installments: 24,
      system: 'SAC',
      contractDate: '2026-11-15',
    });
    window.history.replaceState({ input: entry }, '');

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.find<HTMLInputElement>('#valor').element.value).toBe('25.000,00');
    expect(wrapper.find<HTMLInputElement>('#prazo').element.value).toBe('24');
    expect(calculate).toHaveBeenCalledWith(
      expect.objectContaining({ amountCents: 2_500_000, installments: 24, system: 'SAC' }),
      expect.anything(),
    );
    wrapper.unmount();
  });

  it('ignora history.state que não é uma entrada válida', async () => {
    window.history.replaceState({ input: { amountCents: 'x' } }, '');

    const wrapper = mountPage();
    await flushPromises();

    expect(calculate).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('mantém a região de anúncio no DOM, vazia antes do primeiro cálculo', () => {
    const wrapper = mountPage();

    const region = wrapper.find('p.visually-hidden');
    expect(region.attributes('aria-live')).toBe('polite');
    expect(region.attributes('aria-atomic')).toBe('true');
    expect(region.text()).toBe('');
    wrapper.unmount();
  });

  it('anuncia o cálculo e depois o resumo completo na mesma região', async () => {
    window.history.replaceState({ input: ENTRADA }, '');

    const wrapper = mountPage();
    await nextTick();
    expect(wrapper.find('p.visually-hidden').text()).toBe('Calculando…');

    await flushPromises();
    expect(wrapper.find('p.visually-hidden').text().replace(/\s/g, ' ')).toBe(
      'Resultado atualizado: você recebe R$ 25.000,00 e devolve R$ 29.000,00. CET de 2,31% ao mês.',
    );
    wrapper.unmount();
  });
});
