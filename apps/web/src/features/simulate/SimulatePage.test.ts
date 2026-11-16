import { flushPromises, mount } from '@vue/test-utils';
import { simulationInputSchema } from '@raiox/contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateSimulation } from '../../shared/api/client';
import SimulatePage from './SimulatePage.vue';

vi.mock('../../shared/api/client', () => ({
  calculateSimulation: vi.fn(),
  shareSimulation: vi.fn(),
}));

const calculate = vi.mocked(calculateSimulation);

function mountPage() {
  return mount(SimulatePage, {
    attachTo: document.body,
    global: { stubs: { ResultSummary: true, Carne: true, ShareButton: true } },
  });
}

describe('SimulatePage', () => {
  beforeEach(() => {
    calculate.mockReset();
    calculate.mockResolvedValue({} as never);
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
});
