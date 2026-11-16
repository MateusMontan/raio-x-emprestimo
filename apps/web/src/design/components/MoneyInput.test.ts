import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import MoneyInput from './MoneyInput.vue';

/** Qualquer wrapper de teste que registre eventos emitidos. */
interface ComEmitidos {
  emitted(evento: string): unknown[][] | undefined;
}

function ultimoValor(wrapper: ComEmitidos): unknown {
  const eventos = wrapper.emitted('update:modelValue') ?? [];
  return eventos.at(-1)?.[0];
}

describe('MoneyInput', () => {
  it('emite centavos inteiros quando o usuário digita um valor pt-BR', async () => {
    const wrapper = mount(MoneyInput, {
      props: { id: 'valor', modelValue: null },
    });

    await wrapper.find('input').setValue('10.000,00');

    expect(ultimoValor(wrapper)).toBe(1_000_000);
  });

  it('emite null quando o texto não é um valor', async () => {
    const wrapper = mount(MoneyInput, {
      props: { id: 'valor', modelValue: null },
    });

    await wrapper.find('input').setValue('dez reais');

    expect(ultimoValor(wrapper)).toBeNull();
  });

  it('mostra o valor recebido formatado em pt-BR', () => {
    const wrapper = mount(MoneyInput, {
      props: { id: 'valor', modelValue: 1_000_000 },
    });

    expect(wrapper.find('input').element.value).toBe('10.000,00');
  });

  it('usa teclado decimal e marca o prefixo R$ como decorativo', () => {
    const wrapper = mount(MoneyInput, {
      props: { id: 'valor', modelValue: null },
    });

    expect(wrapper.find('input').attributes('inputmode')).toBe('decimal');
    expect(wrapper.find('.prefix').text()).toBe('R$');
    expect(wrapper.find('.prefix').attributes('aria-hidden')).toBe('true');
  });
});
