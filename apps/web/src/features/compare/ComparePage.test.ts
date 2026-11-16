import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';
import type { OfferAnalysis } from '@raiox/contracts';
import { offerInputSchema } from '@raiox/contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { analyzeOffer } from '../../shared/api/client';
import ComparePage from './ComparePage.vue';
import { useComparison } from './useComparison';

vi.mock('../../shared/api/client', () => ({
  calculateSimulation: vi.fn(),
  analyzeOffer: vi.fn(),
  shareSimulation: vi.fn(),
  getSharedSimulation: vi.fn(),
}));

const analisar = vi.mocked(analyzeOffer);

const entry = offerInputSchema.parse({
  releasedCents: 500_000,
  paymentCents: 50_000,
  installments: 12,
  contractDate: '2026-11-15',
});

function analise(cetMonthly: number, totalPaidCents: number): OfferAnalysis {
  return {
    contractDate: '2026-11-15',
    firstDueDate: '2026-12-15',
    releasedCents: 500_000,
    paymentCents: 50_000,
    installments: 12,
    impliedMonthlyRate: 0.02,
    impliedAnnualRate: 0.27,
    cetAnnual: 0.28,
    cetMonthly,
    totalPaidCents,
    costCents: totalPaidCents - 500_000,
  };
}

function mountPage() {
  return mount(ComparePage, {
    global: { stubs: { RouterLink: RouterLinkStub } },
  });
}

/** Rótulos das colunas (índices) em que a linha da tabela traz o texto do selo. */
function colunasComSelo(wrapper: ReturnType<typeof mountPage>, rotulo: string, selo: string) {
  const linha = wrapper.findAll('tbody tr').find((tr) => tr.find('th').text() === rotulo);
  return (linha?.findAll('td') ?? [])
    .map((td, indice) => (td.text().includes(selo) ? indice : -1))
    .filter((indice) => indice >= 0);
}

describe('ComparePage', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    useComparison().clear();
    analisar.mockReset();
  });

  afterEach(() => {
    useComparison().clear();
  });

  it('mostra o estado vazio com o formulário aberto e o link para Simular', () => {
    const wrapper = mountPage();

    expect(wrapper.text()).toContain(
      'Adicione as ofertas que você recebeu para ver qual sai mais barata.',
    );
    expect(wrapper.find('#valor-recebido').exists()).toBe(true);
    expect(wrapper.text()).toContain('Adicionar à comparação');
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/');
    wrapper.unmount();
  });

  it('marca o menor CET e o menor total pago com selos de texto', async () => {
    analisar
      .mockResolvedValueOnce(analise(0.021, 1_120_000))
      .mockResolvedValueOnce(analise(0.025, 1_100_000));
    const { add } = useComparison();
    add({ kind: 'offer', input: entry });
    add({ kind: 'offer', input: entry });

    const wrapper = mountPage();
    await flushPromises();

    expect(colunasComSelo(wrapper, 'CET ao mês', 'Menor CET')).toEqual([0]);
    expect(colunasComSelo(wrapper, 'Total pago', 'Menor total pago')).toEqual([1]);
    expect(wrapper.find('.summary').text()).toBe(
      'A Oferta 1 tem o menor CET (2,10% ao mês). A Oferta 2 tem o menor total pago (R$ 11.000,00).',
    );
    wrapper.unmount();
  });

  it('marca todos os empatados e usa uma frase única quando o mesmo cenário vence nos dois', async () => {
    analisar
      .mockResolvedValueOnce(analise(0.021, 1_120_000))
      .mockResolvedValueOnce(analise(0.021, 1_120_000))
      .mockResolvedValueOnce(analise(0.03, 1_200_000));
    const { add } = useComparison();
    add({ kind: 'offer', input: entry });
    add({ kind: 'offer', input: entry });
    add({ kind: 'offer', input: entry });

    const wrapper = mountPage();
    await flushPromises();

    expect(colunasComSelo(wrapper, 'CET ao mês', 'Menor CET')).toEqual([0, 1]);
    expect(colunasComSelo(wrapper, 'Total pago', 'Menor total pago')).toEqual([0, 1]);
    expect(wrapper.find('.summary').text()).toContain('Oferta 1 e Oferta 2 têm o menor CET');
    wrapper.unmount();
  });

  it('não mostra selo com um único cenário', async () => {
    analisar.mockResolvedValueOnce(analise(0.021, 1_120_000));
    useComparison().add({ kind: 'offer', input: entry });

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.text()).not.toContain('Menor CET');
    expect(wrapper.find('.summary').text()).toBe('');
    wrapper.unmount();
  });

  it('remove um cenário pelo botão da coluna', async () => {
    analisar
      .mockResolvedValueOnce(analise(0.021, 1_120_000))
      .mockResolvedValueOnce(analise(0.025, 1_100_000));
    const { add } = useComparison();
    add({ kind: 'offer', input: entry });
    add({ kind: 'offer', input: entry });

    const wrapper = mountPage();
    await flushPromises();
    await wrapper.find('button[aria-label="Remover Oferta 1"]').trigger('click');

    expect(useComparison().scenarios.value).toHaveLength(1);
    expect(wrapper.findAll('th[scope="col"]')).toHaveLength(2);
    expect(wrapper.text()).not.toContain('Menor CET');
    wrapper.unmount();
  });

  it('mostra o nome editado na frase-resumo', async () => {
    analisar
      .mockResolvedValueOnce(analise(0.021, 1_120_000))
      .mockResolvedValueOnce(analise(0.025, 1_100_000));
    const { add } = useComparison();
    add({ kind: 'offer', input: entry });
    add({ kind: 'offer', input: entry });

    const wrapper = mountPage();
    await flushPromises();
    await wrapper.find('input[aria-label="Nome da oferta 2"]').setValue('Banco Sul');

    expect(wrapper.find('.summary').text()).toContain('A Banco Sul tem o menor total pago');
    wrapper.unmount();
  });

  it('mostra o erro só na coluna que falhou e permite tentar de novo', async () => {
    analisar
      .mockResolvedValueOnce(analise(0.021, 1_120_000))
      .mockRejectedValueOnce(new Error('falha de rede'));
    const { add } = useComparison();
    add({ kind: 'offer', input: entry });
    add({ kind: 'offer', input: entry });

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.text()).toContain('Não foi possível calcular esta oferta.');
    expect(wrapper.text()).toContain('2,10%');

    analisar.mockResolvedValueOnce(analise(0.025, 1_100_000));
    await wrapper.find('button.retry').trigger('click');
    await flushPromises();

    expect(wrapper.text()).not.toContain('Não foi possível calcular esta oferta.');
    expect(colunasComSelo(wrapper, 'CET ao mês', 'Menor CET')).toEqual([0]);
    wrapper.unmount();
  });
});
