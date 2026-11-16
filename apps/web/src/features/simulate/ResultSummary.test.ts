import { mount } from '@vue/test-utils';
import type { SimulationResult } from '@raiox/contracts';
import { describe, expect, it } from 'vitest';
import { formatMoney, formatPercent } from '../../shared/format';
import ResultSummary from './ResultSummary.vue';

const RESULTADO = {
  releasedCents: 1_000_000,
  feesCents: 5_000,
  iof: { totalCents: 3_800 },
  totals: { paidCents: 1_134_715, interestCents: 124_715, costCents: 134_715 },
  cetMonthly: 0.0223,
  cetAnnual: 0.3,
  schedule: [
    { n: 1, dueDate: '2026-12-15', payment: 94_560 },
    { n: 2, dueDate: '2027-01-15', payment: 94_560 },
    { n: 3, dueDate: '2027-02-15', payment: 94_555 },
  ],
} as unknown as SimulationResult;

describe('ResultSummary', () => {
  it('monta a frase com o valor liberado e o total pago', () => {
    const wrapper = mount(ResultSummary, { props: { result: RESULTADO } });

    const frase = wrapper.find('.sentence').text();
    expect(frase).toContain(
      `Você recebe ${formatMoney(1_000_000)} e devolve ${formatMoney(1_134_715)}.`,
    );
  });

  it('mostra o CET mensal e anual com duas casas', () => {
    const wrapper = mount(ResultSummary, { props: { result: RESULTADO } });

    const valores = wrapper.findAll('.cet dd').map((dd) => dd.text());
    expect(valores).toEqual([formatPercent(0.0223), formatPercent(0.3)]);
    expect(valores[0]).toBe('2,23%');
  });

  it('explica o CET com uma dica', () => {
    const wrapper = mount(ResultSummary, { props: { result: RESULTADO } });

    expect(wrapper.find('.term-hint').text()).toContain('O que é CET');
    expect(wrapper.find('.term-hint').text()).toContain(
      'Custo Efetivo Total: o custo real, com juros, IOF e tarifas',
    );
  });

  it('lista custo, juros, IOF, tarifas e a primeira e a última parcela', () => {
    const wrapper = mount(ResultSummary, { props: { result: RESULTADO } });

    const definicoes = wrapper.findAll('.details div').map((div) => ({
      termo: div.find('dt').text(),
      valor: div.find('dd').text(),
    }));
    expect(definicoes).toEqual([
      { termo: 'Custo do crédito', valor: formatMoney(134_715) },
      { termo: 'Juros', valor: formatMoney(124_715) },
      { termo: 'IOF', valor: formatMoney(3_800) },
      { termo: 'Tarifas e seguro', valor: formatMoney(5_000) },
      { termo: 'Primeira parcela', valor: formatMoney(94_560) },
      { termo: 'Última parcela', valor: formatMoney(94_555) },
    ]);
  });

  it('anuncia a frase em região aria-live educada', () => {
    const wrapper = mount(ResultSummary, { props: { result: RESULTADO } });

    const regiao = wrapper.find('[aria-live]');
    expect(regiao.attributes('aria-live')).toBe('polite');
    expect(regiao.attributes('aria-atomic')).toBe('true');
    expect(regiao.find('.sentence').exists()).toBe(true);
  });
});
