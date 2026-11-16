import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import SegmentedControl from './SegmentedControl.vue';

const OPCOES = [
  { value: 'PRICE', label: 'Parcelas fixas (Price)' },
  { value: 'SAC', label: 'Parcelas que diminuem (SAC)' },
] as const;

describe('SegmentedControl', () => {
  it('associa o erro ao grupo com aria-invalid e aria-describedby', () => {
    const wrapper = mount(SegmentedControl<'PRICE' | 'SAC'>, {
      props: {
        legend: 'Sistema',
        name: 'sistema',
        options: OPCOES,
        modelValue: 'PRICE',
        error: 'Escolha Price ou SAC.',
      },
    });

    const grupo = wrapper.find('fieldset');
    expect(grupo.attributes('aria-invalid')).toBe('true');
    const ids = grupo.attributes('aria-describedby')?.split(' ') ?? [];
    const erro = wrapper.find('.error');
    expect(erro.text()).toBe('Escolha Price ou SAC.');
    expect(ids).toContain(erro.attributes('id'));
  });

  it('une a dica informada e o erro na descrição do grupo', () => {
    const wrapper = mount(SegmentedControl<'PRICE' | 'SAC'>, {
      props: {
        legend: 'Sistema',
        name: 'sistema',
        options: OPCOES,
        modelValue: 'PRICE',
        describedBy: 'sistema-dica',
        error: 'Escolha Price ou SAC.',
      },
    });

    const ids = wrapper.find('fieldset').attributes('aria-describedby')?.split(' ') ?? [];
    expect(ids).toEqual(['sistema-dica', 'sistema-erro']);
  });

  it('não marca o grupo como inválido sem erro', () => {
    const wrapper = mount(SegmentedControl<'PRICE' | 'SAC'>, {
      props: { legend: 'Sistema', name: 'sistema', options: OPCOES, modelValue: 'PRICE' },
    });

    expect(wrapper.find('fieldset').attributes('aria-invalid')).toBeUndefined();
    expect(wrapper.find('fieldset').attributes('aria-describedby')).toBeUndefined();
    expect(wrapper.find('.error').exists()).toBe(false);
  });
});
