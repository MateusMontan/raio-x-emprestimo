import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PercentInput from './PercentInput.vue';

/** Qualquer wrapper de teste que registre eventos emitidos. */
interface ComEmitidos {
  emitted(evento: string): unknown[][] | undefined;
}

function lastValue(wrapper: ComEmitidos): unknown {
  const eventos = wrapper.emitted('update:modelValue') ?? [];
  return eventos.at(-1)?.[0];
}

describe('PercentInput', () => {
  it('emite a fração decimal quando o usuário digita 2,5', async () => {
    const wrapper = mount(PercentInput, {
      props: { id: 'taxa', modelValue: null },
    });

    await wrapper.find('input').setValue('2,5');

    expect(lastValue(wrapper)).toBe(0.025);
  });

  it('emite null quando o texto não é um percentual', async () => {
    const wrapper = mount(PercentInput, {
      props: { id: 'taxa', modelValue: null },
    });

    await wrapper.find('input').setValue('muito');

    expect(lastValue(wrapper)).toBeNull();
  });

  it('mostra a fração recebida como percentual sem o símbolo', () => {
    const wrapper = mount(PercentInput, {
      props: { id: 'taxa', modelValue: 0.0292 },
    });

    expect(wrapper.find('input').element.value).toBe('2,92');
    expect(wrapper.find('.suffix').text()).toBe('%');
  });

  it('lê o % como descrição do campo, sem escondê-lo', () => {
    const wrapper = mount(PercentInput, {
      props: { id: 'taxa', modelValue: 0.02, describedBy: 'taxa-dica' },
    });

    expect(wrapper.find('.suffix').attributes('aria-hidden')).toBeUndefined();
    expect(wrapper.find('input').attributes('aria-describedby')).toBe('taxa-dica taxa-unidade');
    expect(wrapper.find('#taxa-unidade').text()).toBe('%');
  });
});
