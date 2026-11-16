import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PercentInput from './PercentInput.vue';

/** Qualquer wrapper de teste que registre eventos emitidos. */
interface ComEmitidos {
  emitted(evento: string): unknown[][] | undefined;
}

function ultimoValor(wrapper: ComEmitidos): unknown {
  const eventos = wrapper.emitted('update:modelValue') ?? [];
  return eventos.at(-1)?.[0];
}

describe('PercentInput', () => {
  it('emite a fração decimal quando o usuário digita 2,5', async () => {
    const wrapper = mount(PercentInput, {
      props: { id: 'taxa', modelValue: null },
    });

    await wrapper.find('input').setValue('2,5');

    expect(ultimoValor(wrapper)).toBe(0.025);
  });

  it('emite null quando o texto não é um percentual', async () => {
    const wrapper = mount(PercentInput, {
      props: { id: 'taxa', modelValue: null },
    });

    await wrapper.find('input').setValue('muito');

    expect(ultimoValor(wrapper)).toBeNull();
  });

  it('mostra a fração recebida como percentual sem o símbolo', () => {
    const wrapper = mount(PercentInput, {
      props: { id: 'taxa', modelValue: 0.0292 },
    });

    expect(wrapper.find('input').element.value).toBe('2,92');
    expect(wrapper.find('.suffix').text()).toBe('%');
  });
});
