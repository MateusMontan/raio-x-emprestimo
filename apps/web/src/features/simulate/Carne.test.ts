import { mount } from '@vue/test-utils';
import type { ScheduleRow } from '@raiox/contracts';
import { describe, expect, it } from 'vitest';
import Carne from './Carne.vue';

function schedule(parcelas: number): ScheduleRow[] {
  return Array.from({ length: parcelas }, (_, indice) => ({
    n: indice + 1,
    dueDate: '2026-12-15',
    payment: 94_560,
    interest: 20_000,
    principal: 74_560,
    charges: 0,
    balance: 1_000_000 - (indice + 1) * 74_560,
  }));
}

describe('Carne', () => {
  it('desenha uma lâmina por parcela quando há até 24 parcelas', () => {
    const wrapper = mount(Carne, { props: { schedule: schedule(12), animate: false } });

    expect(wrapper.findAll('li.slip')).toHaveLength(12);
    expect(wrapper.find('ol').attributes('aria-label')).toBe('Parcelas');
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('resume a partir de 25 parcelas: 6 primeiras, aviso e 3 últimas', () => {
    const wrapper = mount(Carne, { props: { schedule: schedule(30), animate: false } });

    const slips = wrapper.findAll('li.slip');
    expect(slips).toHaveLength(9);
    expect(slips[0]?.text()).toContain('Parcela 1 de 30');
    expect(slips[8]?.text()).toContain('Parcela 30 de 30');
    expect(wrapper.find('.gap').text()).toBe('… 21 parcelas …');
  });

  it('abre e fecha a tabela completa pelo botão com aria-expanded', async () => {
    const wrapper = mount(Carne, { props: { schedule: schedule(30), animate: false } });
    const button = wrapper.find('button');

    expect(button.text()).toBe('Ver todas as parcelas');
    expect(button.attributes('aria-expanded')).toBe('false');
    expect(button.attributes('aria-controls')).toBe('tabela-parcelas');
    expect(wrapper.find('table').exists()).toBe(false);

    await button.trigger('click');

    expect(button.text()).toBe('Ocultar a tabela');
    expect(button.attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('table').exists()).toBe(true);

    await button.trigger('click');

    expect(button.attributes('aria-expanded')).toBe('false');
    expect(wrapper.find('table').exists()).toBe(false);
  });

  it('marca a linha de intervalo como apresentação, sem ser uma lâmina', () => {
    const wrapper = mount(Carne, { props: { schedule: schedule(30), animate: false } });

    const gap = wrapper.find('.gap');
    expect(gap.element.tagName).toBe('LI');
    expect(gap.attributes('role')).toBe('presentation');
    expect(gap.classes()).not.toContain('slip');
    expect(wrapper.find('ol').classes()).toContain('carne');
  });

  it('anima só as 6 primeiras lâminas quando animate é verdadeiro', () => {
    const wrapper = mount(Carne, { props: { schedule: schedule(12), animate: true } });

    const animated = wrapper.findAll('li.slip').map((slip) => slip.classes('slip--enter'));
    expect(animated.slice(0, 6).every(Boolean)).toBe(true);
    expect(animated.slice(6).some(Boolean)).toBe(false);
  });
});
