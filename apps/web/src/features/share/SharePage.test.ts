import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory } from 'vue-router';
import { simulationInputSchema, type SharedSimulation } from '@raiox/contracts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSharedSimulation } from '../../shared/api/client';
import { ApiError } from '../../shared/api/errors';
import { createAppRouter } from '../../app/router';
import SharePage from './SharePage.vue';

vi.mock('../../shared/api/client', () => ({ getSharedSimulation: vi.fn() }));

const buscar = vi.mocked(getSharedSimulation);

const SHARED = {
  id: 'abc123',
  createdAt: '2026-11-15T12:00:00.000Z',
  expiresAt: '2027-05-14T12:00:00.000Z',
  input: simulationInputSchema.parse({
    amountCents: 1_000_000,
    monthlyRate: 0.02,
    installments: 12,
    system: 'PRICE',
    contractDate: '2026-11-15',
  }),
  result: {},
} as unknown as SharedSimulation;

async function mountPage() {
  const router = createAppRouter(createMemoryHistory());
  await router.push('/s/abc123');
  await router.isReady();
  const wrapper = mount(SharePage, {
    global: {
      plugins: [router],
      stubs: { ResultSummary: true, Carne: true },
    },
  });
  await flushPromises();
  return { wrapper, router };
}

function problema(status: number, detail: string) {
  return new ApiError({ type: 'about:blank', title: 'Erro', status, detail });
}

describe('SharePage', () => {
  beforeEach(() => {
    buscar.mockReset();
  });

  it('mostra as entradas formatadas e a validade do link', async () => {
    buscar.mockResolvedValue(SHARED);

    const { wrapper } = await mountPage();

    expect(buscar).toHaveBeenCalledWith('abc123', expect.any(AbortSignal));
    expect(wrapper.find('h1').text()).toBe('Simulação compartilhada');
    expect(wrapper.find('.summary-line').text()).toBe(
      'Empréstimo de R$ 10.000,00, em 12 meses, a 2,00% ao mês, sistema Price, contratado em 15/11/2026.',
    );
    expect(wrapper.text()).toContain('Este link vale até 14/05/2027.');
  });

  it('mostra a página de link expirado com o botão Nova simulação para 404', async () => {
    buscar.mockRejectedValue(problema(404, 'Não encontramos o que você procurou.'));

    const { wrapper } = await mountPage();

    expect(wrapper.find('h1').text()).toBe('Link expirado');
    const button = wrapper.findAll('a').find((link) => link.text() === 'Nova simulação');
    expect(button?.attributes('href')).toBe('/');
  });

  it('mostra o erro em alerta e tenta de novo ao clicar', async () => {
    buscar.mockRejectedValueOnce(problema(500, 'O servidor não conseguiu responder.'));
    buscar.mockResolvedValueOnce(SHARED);

    const { wrapper } = await mountPage();

    expect(wrapper.find('[role="alert"]').text()).toBe('O servidor não conseguiu responder.');
    const tentar = wrapper.findAll('button').find((b) => b.text() === 'Tentar de novo');
    expect(tentar).toBeDefined();

    await tentar?.trigger('click');
    await flushPromises();

    expect(buscar).toHaveBeenCalledTimes(2);
    expect(wrapper.find('h1').text()).toBe('Simulação compartilhada');
  });
});
