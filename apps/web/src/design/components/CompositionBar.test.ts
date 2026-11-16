import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import CompositionBar from './CompositionBar.vue';

const PROPS = { interestCents: 1000, principalCents: 2000, chargesCents: 500 };

describe('CompositionBar', () => {
  it('lista cada parte na legenda com o rótulo e o valor formatado', () => {
    const wrapper = mount(CompositionBar, { props: PROPS });

    const itens = wrapper.findAll('.item').map((item) => ({
      rotulo: item.find('.label').text(),
      valor: item.find('.value').text(),
    }));
    expect(itens).toEqual([
      { rotulo: 'Juros', valor: 'R$ 10,00' },
      { rotulo: 'Amortização', valor: 'R$ 20,00' },
      { rotulo: 'Encargos', valor: 'R$ 5,00' },
    ]);
  });

  it('descreve a barra inteira no aria-label com valores e percentuais', () => {
    const wrapper = mount(CompositionBar, { props: PROPS });

    const barra = wrapper.find('[role="img"]');
    expect(barra.attributes('aria-label')).toBe(
      'Composição da parcela de R$ 35,00: juros R$ 10,00 (29%), amortização R$ 20,00 (57%), encargos R$ 5,00 (14%).',
    );
  });

  it('desenha segmentos proporcionais ao total', () => {
    const wrapper = mount(CompositionBar, { props: PROPS });

    const widths = wrapper.findAll('.segment').map((segmento) => segmento.attributes('style'));
    expect(widths[1]).toContain('width: 57.14');
  });

  it('omite encargos zerados da legenda e do aria-label com hideZero', () => {
    const wrapper = mount(CompositionBar, {
      props: { ...PROPS, chargesCents: 0, hideZero: true },
    });

    const rotulos = wrapper.findAll('.label').map((label) => label.text());
    expect(rotulos).toEqual(['Juros', 'Amortização']);
    const descricao = wrapper.find('[role="img"]').attributes('aria-label');
    expect(descricao).not.toContain('encargos');
    expect(descricao).toContain('juros');
    expect(descricao).toContain('(33%)');
    expect(descricao).toContain('(67%)');
  });

  it('mostra encargos com valor maior que zero mesmo com hideZero', () => {
    const wrapper = mount(CompositionBar, { props: { ...PROPS, hideZero: true } });

    const rotulos = wrapper.findAll('.label').map((label) => label.text());
    expect(rotulos).toContain('Encargos');
    expect(wrapper.find('[role="img"]').attributes('aria-label')).toContain('encargos');
  });

  it('mantém a legenda inline e renderiza o conteúdo do slot ao lado dela', () => {
    const wrapper = mount(CompositionBar, {
      props: { ...PROPS, inline: true },
      slots: { default: '<p class="extra">Saldo depois: R$ 1,00</p>' },
    });

    expect(wrapper.classes()).toContain('composition--inline');
    expect(wrapper.find('.legend-row .legend').exists()).toBe(true);
    expect(wrapper.find('.legend-row .extra').text()).toBe('Saldo depois: R$ 1,00');
  });

  it('não divide por zero quando todas as partes são zero', () => {
    const wrapper = mount(CompositionBar, {
      props: { interestCents: 0, principalCents: 0, chargesCents: 0 },
    });

    expect(wrapper.find('[role="img"]').attributes('aria-label')).toContain('R$ 0,00');
  });
});
