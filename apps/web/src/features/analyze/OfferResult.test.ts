import { mount } from '@vue/test-utils';
import type { OfferAnalysis } from '@raiox/contracts';
import { describe, expect, it } from 'vitest';
import OfferResult from './OfferResult.vue';

const ANALISE: OfferAnalysis = {
  contractDate: '2026-11-15',
  firstDueDate: '2026-12-15',
  releasedCents: 500_000,
  paymentCents: 50_000,
  installments: 12,
  impliedMonthlyRate: 0.0292,
  impliedAnnualRate: 0.413,
  cetMonthly: 0.0345,
  cetAnnual: 0.4918,
  totalPaidCents: 600_000,
  costCents: 100_000,
};

/** Espaços normalizados: formatMoney usa espaço não quebrável. */
function normalizado(texto: string): string {
  return texto.replace(/\s+/g, ' ');
}

describe('OfferResult', () => {
  it('diz quanto a pessoa recebe e quanto devolve, em frase com valores formatados', () => {
    const wrapper = mount(OfferResult, { props: { analysis: ANALISE } });

    expect(normalizado(wrapper.find('.sentence').text())).toBe(
      'Você recebe R$ 5.000,00 e devolve R$ 6.000,00.',
    );
  });

  it('mostra os juros embutidos ao mês e ao ano com duas casas', () => {
    const wrapper = mount(OfferResult, { props: { analysis: ANALISE } });

    expect(normalizado(wrapper.find('.rate').text())).toBe(
      'Os juros embutidos são de 2,92% ao mês (41,30% ao ano).',
    );
  });

  it('mostra o CET mensal e anual e o custo do crédito', () => {
    const wrapper = mount(OfferResult, { props: { analysis: ANALISE } });

    expect(wrapper.text()).toContain('CET mensal');
    expect(wrapper.text()).toContain('3,45%');
    expect(wrapper.text()).toContain('CET anual');
    expect(wrapper.text()).toContain('49,18%');
    expect(wrapper.text()).toContain('Custo do crédito');
    expect(normalizado(wrapper.text())).toContain('R$ 1.000,00');
  });

  it('orienta a pedir o CET por escrito quando a taxa anunciada é menor', () => {
    const wrapper = mount(OfferResult, { props: { analysis: ANALISE } });

    expect(normalizado(wrapper.find('.advice').text())).toContain('Peça o CET por escrito.');
  });

  it('anuncia a frase em região aria-live educada e atômica', () => {
    const wrapper = mount(OfferResult, { props: { analysis: ANALISE } });

    const regiao = wrapper.find('[aria-live]');
    expect(regiao.attributes('aria-live')).toBe('polite');
    expect(regiao.attributes('aria-atomic')).toBe('true');
    expect(regiao.text()).toContain('Você recebe');
  });
});
