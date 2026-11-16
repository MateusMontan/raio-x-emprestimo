import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { describe, expect, it } from 'vitest';
import type { FieldAttrs } from '../fieldAttrs';
import BaseField from './BaseField.vue';

const PROPS = { id: 'prazo', label: 'Prazo, em meses', hint: 'De 1 a 420 meses.' };

/** Controle de teste que recebe os atributos do BaseField pelo slot. */
function controlWithAttrs(attrs: FieldAttrs) {
  return h('input', {
    id: attrs.id,
    'aria-describedby': attrs.describedBy,
    'aria-invalid': attrs.invalid ? 'true' : undefined,
  });
}

describe('BaseField', () => {
  it('liga o rótulo ao controle pelo id', () => {
    const wrapper = mount(BaseField, {
      props: PROPS,
      slots: { default: (attrs: FieldAttrs) => controlWithAttrs(attrs) },
    });

    expect(wrapper.find('label').attributes('for')).toBe('prazo');
    expect(wrapper.find('label').text()).toBe('Prazo, em meses');
    expect(wrapper.find('input').attributes('id')).toBe('prazo');
  });

  it('descreve o controle pela dica, sem erro', () => {
    const wrapper = mount(BaseField, {
      props: PROPS,
      slots: { default: (attrs: FieldAttrs) => controlWithAttrs(attrs) },
    });

    const input = wrapper.find('input');
    expect(input.attributes('aria-describedby')).toBe('prazo-dica');
    expect(input.attributes('aria-invalid')).toBeUndefined();
  });

  it('descreve o controle pela dica e pelo erro e marca aria-invalid', () => {
    const wrapper = mount(BaseField, {
      props: { ...PROPS, error: 'O prazo vai de 1 a 420 meses.' },
      slots: { default: (attrs: FieldAttrs) => controlWithAttrs(attrs) },
    });

    const input = wrapper.find('input');
    expect(input.attributes('aria-describedby')).toBe('prazo-dica prazo-erro');
    expect(input.attributes('aria-invalid')).toBe('true');
    expect(wrapper.find('#prazo-erro').text()).toBe('O prazo vai de 1 a 420 meses.');
  });
});
