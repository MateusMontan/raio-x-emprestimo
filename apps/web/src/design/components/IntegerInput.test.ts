import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import IntegerInput from './IntegerInput.vue';

describe('IntegerInput', () => {
  it('lê a unidade como descrição do campo, sem escondê-la', () => {
    const wrapper = mount(IntegerInput, {
      props: { id: 'prazo', modelValue: 12, suffix: 'meses', describedBy: 'prazo-dica' },
    });

    expect(wrapper.find('.suffix').attributes('aria-hidden')).toBeUndefined();
    expect(wrapper.find('.suffix').text()).toBe('meses');
    expect(wrapper.find('input').attributes('aria-describedby')).toBe('prazo-dica prazo-unidade');
  });

  it('não aponta para unidade quando não há sufixo', () => {
    const wrapper = mount(IntegerInput, {
      props: { id: 'parcelas', modelValue: 3, describedBy: 'parcelas-dica' },
    });

    expect(wrapper.find('input').attributes('aria-describedby')).toBe('parcelas-dica');
  });
});
